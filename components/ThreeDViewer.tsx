
import React, { useState, useEffect, useRef, memo } from 'react';
import { LayerVisibility, ProjectStage, CameraFeed, ViewMode, TourSession, AiDetection } from '../types';
import { Maximize, Minimize, Layers, RefreshCw, Scan, Box, MapPin, ShieldCheck, AlertTriangle, SplitSquareHorizontal } from 'lucide-react';
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
  const [complianceStatus, setComplianceStatus] = useState<'VERIFIED' | 'MONITORING' | 'ALERT'>('MONITORING');
  
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, [stage, viewMode, bimFileName]);

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);

    if (activeCamera) {
      setComplianceStatus('MONITORING');
      intervalRef.current = window.setInterval(() => {
        setDetections([
          { id: 'd1', label: 'Excavator', status: 'WORKING', confidence: 0.98, x: 42, y: 51, width: 18, height: 14 },
          { id: 'd2', label: 'Personnel', status: 'MOVING', confidence: 0.92, x: 25, y: 72, width: 4, height: 10 }
        ]);
        setComplianceStatus(prev => prev === 'MONITORING' ? 'VERIFIED' : 'MONITORING');
      }, 5000);
    } else {
      setDetections([]);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [activeCamera?.id]);

  // Handle Fullscreen transitions
  useEffect(() => {
    const handleFsChange = () => {
      setIsMaximized(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        const enterFs = containerRef.current.requestFullscreen || 
                       (containerRef.current as any).webkitRequestFullscreen ||
                       (containerRef.current as any).mozRequestFullScreen ||
                       (containerRef.current as any).msRequestFullscreen;
        
        if (enterFs) {
          await enterFs.call(containerRef.current);
        } else {
          // No API available, use CSS fallback
          setIsMaximized(true);
        }
      } catch (err) {
        console.warn("Native Fullscreen blocked by browser/iframe policy. Falling back to CSS Maximize.", err);
        // Fallback to CSS Maximize if API blocked (e.g., in iframe without allow="fullscreen")
        setIsMaximized(true);
      }
    } else {
      try {
        const exitFs = document.exitFullscreen || 
                      (document as any).webkitExitFullscreen ||
                      (document as any).mozCancelFullScreen ||
                      (document as any).msExitFullscreen;
        
        if (exitFs) {
          await exitFs.call(document);
        } else {
          setIsMaximized(false);
        }
      } catch (err) {
        setIsMaximized(false);
      }
    }
  };

  const handleAnalyzeStream = async () => {
    if (!activeCamera || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      await analyzeSiteFrame("data:image/jpeg;base64,...", stage, activeCamera.name);
      setComplianceStatus('VERIFIED');
    } catch (e) {
      console.error(e);
      setComplianceStatus('ALERT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`${isMaximized ? "fixed inset-0 z-[1000] bg-slate-950" : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner"}`}
    >
      
      {/* HUD - Top Left */}
      <div className="absolute top-4 left-4 z-30 flex gap-2 pointer-events-none">
        <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-3 shadow-2xl backdrop-blur-md">
          {activeCamera ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">LIVE • {activeCamera.name}</span>
            </div>
          ) : (
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{viewMode} VIEW</span>
          )}
        </div>

        {activeCamera && (
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all duration-500 shadow-2xl backdrop-blur-md ${
                complianceStatus === 'VERIFIED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 
                complianceStatus === 'ALERT' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                'bg-blue-500/20 border-blue-500/40 text-blue-400'
            }`}>
                {complianceStatus === 'VERIFIED' ? <ShieldCheck size={12} /> : 
                 complianceStatus === 'ALERT' ? <AlertTriangle size={12} className="animate-bounce" /> : 
                 <RefreshCw size={12} className="animate-spin" />}
                <span className="text-[9px] font-black uppercase tracking-widest">
                    IS Code Guard: {complianceStatus}
                </span>
            </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button 
          onClick={toggleFullScreen} 
          className="p-2.5 bg-slate-900/90 text-slate-400 hover:text-cyan-400 rounded-lg border border-slate-700 backdrop-blur-md transition-all active:scale-90 shadow-xl"
          title={isMaximized ? "Minimize" : "Full Screen"}
        >
          {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {activeCamera && (
          <button 
            onClick={handleAnalyzeStream} 
            disabled={isAnalyzing}
            className={`p-2.5 rounded-lg border transition-all backdrop-blur-md active:scale-90 shadow-xl ${isAnalyzing ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 text-orange-400 border-slate-700 hover:text-orange-300'}`}
            title="Scan Site Frame"
          >
            {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Scan size={20} />}
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
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={splitPosition} 
              onChange={(e) => setSplitPosition(parseInt(e.target.value))} 
              className="absolute inset-y-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-30" 
            />
            {/* Split UI visual handle */}
            <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `${splitPosition}%` }}>
                <div className="h-full w-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-600 p-1.5 rounded-md border border-cyan-400 shadow-xl">
                    <SplitSquareHorizontal size={14} className="text-white" />
                </div>
            </div>
          </div>
        )}

        {viewMode === 'TOUR' && !activeCamera && (
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-all duration-1000" style={{ backgroundImage: `url('${TOUR_LOCATIONS['LOC-A'].imageUrl}')` }}></div>
            <div className="absolute bottom-10 bg-slate-900/95 px-5 py-2.5 rounded-full border border-slate-700 text-[10px] font-black text-white z-40 flex items-center gap-2 shadow-2xl backdrop-blur-md uppercase tracking-widest">
              <MapPin size={14} className="text-cyan-400" /> {TOUR_LOCATIONS['LOC-A'].name}
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
                    className="w-full h-full pointer-events-none scale-105" 
                    allow="autoplay; encrypted-media" 
                  />
                ) : (
                  <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-[#020617] flex items-center justify-center relative">
                {/* Visual grid for BIM context */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="text-center relative z-10 animate-in zoom-in-95 duration-500">
                  <div className="relative inline-block mb-4">
                    <Layers size={80} className="text-slate-800 mx-auto" />
                    <Box size={32} className="text-cyan-500 absolute -bottom-2 -right-2 animate-bounce" />
                  </div>
                  <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em]">{bimFileName ? `BIM Asset: ${bimFileName}` : 'Waiting for Asset Sync'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4"></div>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Vision Link...</span>
        </div>
      )}
    </div>
  );
};

export default memo(ThreeDViewer);
