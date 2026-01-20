
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

const AiOverlay = memo(({ detections }: { detections: AiDetection[] }) => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {detections.map(det => (
      <div 
        key={det.id} 
        className="absolute border border-green-500/60 bg-green-500/5 transition-transform duration-300" 
        style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.width}%`, height: `${det.height}%` }}
      >
        <div className="absolute -top-5 left-0 bg-slate-900/95 px-1.5 py-0.5 text-[9px] text-white border border-slate-700 font-mono">
          {det.label}
        </div>
      </div>
    ))}
  </div>
));

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    stage, activeCamera, viewMode, bimFileName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, [stage, viewMode, bimFileName]);

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    if (activeCamera) {
      intervalRef.current = window.setInterval(() => {
        // Static mock data to keep the JS thread idle as much as possible
        setDetections([
          { id: 'd1', label: 'Excavator', status: 'WORKING', confidence: 0.98, x: 42, y: 51, width: 18, height: 14 },
          { id: 'd2', label: 'Personnel', status: 'MOVING', confidence: 0.92, x: 25, y: 72, width: 4, height: 10 }
        ]);
      }, 5000); // 5 seconds interval for minimal thread usage
    } else {
      setDetections([]);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [activeCamera?.id]);

  const handleAnalyzeStream = async () => {
    if (!activeCamera || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      await analyzeSiteFrame("data:image/jpeg;base64,...", stage, activeCamera.name);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`${isMaximized ? "fixed inset-0 z-[100] bg-slate-950" : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800"}`}>
      
      <div className="absolute top-3 left-3 z-30 flex gap-2 pointer-events-none">
        <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-3">
          {activeCamera ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">LIVE • {activeCamera.name}</span>
            </div>
          ) : (
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{viewMode} VIEW</span>
          )}
        </div>
      </div>
      
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
        <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-900/90 text-slate-400 hover:text-cyan-400 rounded-lg border border-slate-700">
          {isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        {activeCamera && (
          <button 
            onClick={handleAnalyzeStream} 
            disabled={isAnalyzing}
            className={`p-2 rounded-lg border transition-colors ${isAnalyzing ? 'bg-orange-600' : 'bg-slate-900 text-orange-400 border-slate-700'}`}
          >
            {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Scan size={18} />}
          </button>
        )}
      </div>

      <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        
        {viewMode === 'SPLIT' && !activeCamera && (
          <div className="relative w-full h-full bg-slate-950">
            <div className="w-full h-full bg-slate-800">
                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Site" />
            </div>
            <div className="absolute inset-0 overflow-hidden border-r-2 border-cyan-500/50 z-10 pointer-events-none" style={{ width: `${splitPosition}%` }}>
              <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" style={{ width: '100vw' }} alt="BIM" />
            </div>
            <input type="range" min="0" max="100" value={splitPosition} onChange={(e) => setSplitPosition(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
          </div>
        )}

        {viewMode === 'TOUR' && !activeCamera && (
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('${TOUR_LOCATIONS['LOC-A'].imageUrl}')` }}></div>
            <div className="absolute bottom-6 bg-slate-900/95 px-4 py-2 rounded-full border border-slate-700 text-[10px] font-bold text-white z-40 flex items-center gap-2">
              <MapPin size={12} className="text-cyan-400" /> {TOUR_LOCATIONS['LOC-A'].name}
            </div>
          </div>
        )}

        {(viewMode === 'ORBIT' || activeCamera) && (
          <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {activeCamera ? (
              <div className="w-full h-full">
                <AiOverlay detections={detections} />
                {activeCamera.streamType === 'YOUTUBE' ? (
                  <iframe 
                    src={activeCamera.streamUrl} 
                    className="w-full h-full pointer-events-none" 
                    allow="autoplay; encrypted-media" 
                  />
                ) : (
                  <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-[#020617] flex items-center justify-center">
                <div className="text-center opacity-20">
                  <Layers size={64} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Connect Asset Model</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
          <div className="w-6 h-6 border border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default memo(ThreeDViewer);
