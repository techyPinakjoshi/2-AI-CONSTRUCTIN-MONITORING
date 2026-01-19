
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LayerVisibility, WorkStatus, ProjectStage, CameraFeed, ViewMode, TourSession, TourStep, AiDetection } from '../types';
import { Maximize, Minimize, Layers, Zap, RefreshCw, Scan, Box, MapPin } from 'lucide-react';
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

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    stage, layers, activeCamera, viewMode, bimFileName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  const [currentLocationId] = useState('LOC-A');

  // Use a ref for the interval to ensure we only ever have ONE active timer
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [stage, activeCamera?.id, viewMode, bimFileName]);

  useEffect(() => {
      // Clear existing interval immediately on change
      if (detectionIntervalRef.current) {
          window.clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
      }

      if (activeCamera) {
          detectionIntervalRef.current = window.setInterval(() => {
             setDetections([
                 { id: 'd1', label: 'Excavator', status: Math.random() > 0.3 ? 'WORKING' : 'IDLE', confidence: 0.98, x: 40 + (Math.random() * 2), y: 50 + (Math.random() * 2), width: 20, height: 15 },
                 { id: 'd2', label: 'Safety Personnel', status: 'MOVING', confidence: 0.92, x: 20 + (Math.random() * 4), y: 70 + (Math.random() * 1), width: 5, height: 12 }
             ]);
          }, 2000); // Throttled to 2 seconds for performance
      } else {
          setDetections([]);
      }

      return () => {
          if (detectionIntervalRef.current) {
              window.clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
          }
      };
  }, [activeCamera?.id]); 

  const handleAnalyzeStream = async () => {
    if (!activeCamera || isAnalyzing) return;
    setIsAnalyzing(true);
    const dummyDataUrl = "data:image/jpeg;base64,..."; 
    try {
        const result = await analyzeSiteFrame(dummyDataUrl, stage, activeCamera.name);
        alert(`AI Site Audit: ${result.visualAudit || 'Analysis Complete'}`);
    } catch (e) {
        console.error("Analysis failed:", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className={`${isMaximized ? "fixed inset-0 z-50 bg-slate-950" : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"} transition-all duration-300`}>
      
      <div className="absolute top-4 left-4 z-30 flex gap-2 pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur-md p-2 rounded-lg border border-slate-600 text-slate-300 shadow-lg flex items-center gap-3">
            {activeCamera ? (
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">LIVE: {activeCamera.name}</span>
                 </div>
            ) : <span className="text-xs font-mono font-bold uppercase">{viewMode} VIEW</span>}
            {bimFileName && !activeCamera && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-600">
                <Box size={14} className="text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400">{bimFileName}</span>
              </div>
            )}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-600 transition-all shadow-lg">
          {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {activeCamera && (
            <button 
                onClick={handleAnalyzeStream} 
                disabled={isAnalyzing}
                className={`p-2 rounded-lg border transition-all shadow-lg ${isAnalyzing ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-800 text-orange-400 border-slate-600 hover:bg-slate-700'}`}>
                {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Scan size={20} />}
            </button>
        )}
      </div>

      <div className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
        {viewMode === 'SPLIT' && !activeCamera && (
            <div className="relative w-full h-full bg-slate-900">
                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" alt="Reality" className="w-full h-full object-cover grayscale-[20%]" />
                <div className="absolute inset-0 overflow-hidden border-r-2 border-orange-500 bg-slate-900 z-10" style={{ width: `${splitPosition}%` }}>
                    <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop" alt="BIM" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 invert" style={{ width: '100vw' }} />
                </div>
                <input type="range" min="0" max="100" value={splitPosition} onChange={(e) => setSplitPosition(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
            </div>
        )}

        {viewMode === 'TOUR' && !activeCamera && (
            <div className="relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${TOUR_LOCATIONS[currentLocationId].imageUrl}')` }}></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 flex items-center gap-4 text-xs font-bold text-slate-300 z-40">
                    <MapPin size={12} className="text-cyan-400"/> {TOUR_LOCATIONS[currentLocationId].name}
                </div>
            </div>
        )}

        {(viewMode === 'ORBIT' || activeCamera) && (
             <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-10"></div>
                
                {activeCamera ? (
                     <div className="w-full h-full relative">
                         <div className="absolute inset-0 pointer-events-none z-20">
                            {detections.map(det => (
                                <div key={det.id} className="absolute border-2 transition-all duration-700" style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.width}%`, height: `${det.height}%`, borderColor: det.status === 'WORKING' ? '#22c55e' : '#f97316' }}>
                                    <div className="absolute -top-6 left-0 bg-slate-900/80 px-2 text-[10px] text-white border border-slate-700 whitespace-nowrap">
                                        {det.label}: {det.status}
                                    </div>
                                </div>
                            ))}
                         </div>
                         {activeCamera.streamType === 'YOUTUBE' ? (
                             <iframe src={activeCamera.streamUrl} className="w-full h-full object-cover pointer-events-none" allow="autoplay; encrypted-media"></iframe>
                         ) : (
                             <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                         )}
                     </div>
                ) : bimFileName ? (
                    <div className="relative w-[500px] h-[400px] animate-float transition-transform duration-1000" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(45deg)' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="absolute inset-0 border-2 border-cyan-500/40 bg-cyan-500/5 backdrop-blur-[1px]" style={{ transform: `translateZ(${i * 60}px)` }}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <Layers size={48} className="text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mb-2">Awaiting Data Sync</p>
                    </div>
                )}
             </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: rotateX(60deg) rotateZ(45deg) translateY(0); }
          50% { transform: rotateX(60deg) rotateZ(45deg) translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ThreeDViewer;
