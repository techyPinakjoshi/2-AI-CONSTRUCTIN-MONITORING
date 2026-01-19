
import React, { useState, useEffect, useRef, memo } from 'react';
import { LayerVisibility, ProjectStage, CameraFeed, ViewMode, TourSession, AiDetection } from '../types';
import { Maximize, Minimize, Layers, RefreshCw, Scan, Box, MapPin } from 'lucide-react';
import { TOUR_LOCATIONS } from '../constants';
import { analyzeSiteFrame } from '../services/geminiService';

interface ThreeDViewerProps {
  stage: ProjectStage;
  layers: LayerVisibility;
  activeCamera: CameraFeed | null;
  cameras: CameraFeed[];
  viewMode: ViewMode;
  onCameraCapture: () => void;
  onSelectCamera: (id: string | null) => void;
  onSaveTour: (session: TourSession) => void;
  bimFileName: string | null;
}

// Sub-component for AI Detections to prevent parent re-renders
const AiOverlay = memo(({ detections }: { detections: AiDetection[] }) => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {detections.map(det => (
      <div 
        key={det.id} 
        className="absolute border-2 border-green-500/60 bg-green-500/5 transition-all duration-500" 
        style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.width}%`, height: `${det.height}%` }}
      >
        <div className="absolute -top-6 left-0 bg-slate-900/90 px-2 py-0.5 text-[10px] text-white border border-slate-700 whitespace-nowrap font-mono">
          {det.label} ({(det.confidence * 100).toFixed(0)}%)
        </div>
      </div>
    ))}
  </div>
));

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    stage, layers, activeCamera, viewMode, bimFileName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  const [currentLocationId] = useState('LOC-A');

  // Ref to track interval and prevent multiple instances
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [stage, viewMode, bimFileName]);

  useEffect(() => {
    // Clear existing interval immediately
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (activeCamera) {
      // Slower polling frequency to keep UI thread light
      intervalRef.current = window.setInterval(() => {
        setDetections([
          { id: 'd1', label: 'Excavator', status: 'WORKING', confidence: 0.98, x: 42, y: 51, width: 18, height: 14 },
          { id: 'd2', label: 'Laborer', status: 'MOVING', confidence: 0.92, x: 25, y: 72, width: 4, height: 10 }
        ]);
      }, 3000);
    } else {
      setDetections([]);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeCamera?.id]);

  const handleAnalyzeStream = async () => {
    if (!activeCamera || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      // Simulate real-time frame capture
      const result = await analyzeSiteFrame("data:image/jpeg;base64,...", stage, activeCamera.name);
      alert(`AI Site Audit: ${result.visualAudit || 'Analysis Complete'}`);
    } catch (e) {
      console.error("Analysis error", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`${isMaximized ? "fixed inset-0 z-50 bg-slate-950" : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"}`}>
      
      {/* HUD Info */}
      <div className="absolute top-4 left-4 z-30 flex gap-2 pointer-events-none">
        <div className="bg-slate-800/90 p-2 rounded-lg border border-slate-600 text-slate-300 shadow-lg flex items-center gap-3">
          {activeCamera ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">LIVE FEED: {activeCamera.name}</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{viewMode} VIEW</span>
          )}
          {bimFileName && !activeCamera && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-600">
              <Box size={14} className="text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-400">{bimFileName}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-600 shadow-lg">
          {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {activeCamera && (
          <button 
            onClick={handleAnalyzeStream} 
            disabled={isAnalyzing}
            className={`p-2 rounded-lg border shadow-lg ${isAnalyzing ? 'bg-orange-600 text-white' : 'bg-slate-800 text-orange-400 border-slate-600 hover:bg-slate-700'}`}
          >
            {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Scan size={20} />}
          </button>
        )}
      </div>

      <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Split View Mode */}
        {viewMode === 'SPLIT' && !activeCamera && (
          <div className="relative w-full h-full bg-slate-950">
            <div className="absolute inset-0 bg-slate-900">
               <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" alt="Real Site" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 overflow-hidden border-r-2 border-orange-500 z-10" style={{ width: `${splitPosition}%` }}>
              <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop" alt="BIM Overlay" className="absolute inset-0 w-full h-full object-cover grayscale invert opacity-60" style={{ width: '100vw' }} />
            </div>
            <input type="range" min="0" max="100" value={splitPosition} onChange={(e) => setSplitPosition(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
          </div>
        )}

        {/* Tour Mode */}
        {viewMode === 'TOUR' && !activeCamera && (
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('${TOUR_LOCATIONS[currentLocationId].imageUrl}')` }}></div>
            <div className="absolute bottom-6 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 text-xs font-bold text-white z-40 flex items-center gap-2">
              <MapPin size={14} className="text-cyan-400" /> {TOUR_LOCATIONS[currentLocationId].name}
            </div>
          </div>
        )}

        {/* Main 3D / Camera Feed View */}
        {(viewMode === 'ORBIT' || activeCamera) && (
          <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {activeCamera ? (
              <div className="w-full h-full">
                <AiOverlay detections={detections} />
                {activeCamera.streamType === 'YOUTUBE' ? (
                  <iframe 
                    src={activeCamera.streamUrl} 
                    className="w-full h-full pointer-events-none scale-105" 
                    allow="autoplay; encrypted-media" 
                  />
                ) : (
                  <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                )}
              </div>
            ) : bimFileName ? (
              <div className="relative w-[500px] h-[400px] perspective-container" style={{ perspective: '1200px' }}>
                <div className="w-full h-full relative animate-float-stable" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(55deg) rotateZ(40deg)' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="absolute inset-0 border border-cyan-500/30 bg-cyan-500/[0.03]" 
                      style={{ transform: `translateZ(${i * 50}px)` }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center opacity-40">
                <Layers size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Connect Asset Model to Initialize Twin</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Low-cost Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        @keyframes float-stable {
          0%, 100% { transform: rotateX(55deg) rotateZ(40deg) translateY(0); }
          50% { transform: rotateX(55deg) rotateZ(40deg) translateY(-10px); }
        }
        .animate-float-stable {
          animation: float-stable 8s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default memo(ThreeDViewer);
