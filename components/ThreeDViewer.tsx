
import React, { useState, useEffect, useRef } from 'react';
import { LayerVisibility, WorkStatus, ProjectStage, CameraFeed, ViewMode, TourSession, TourStep, AiDetection } from '../types';
import { Maximize, Minimize, Layers, Zap, Ruler, Camera, Activity, Video, Radio, Spline, Save, RefreshCw, SplitSquareHorizontal, Move3d, MapPin, AlertCircle, Play, Square, Timer, Navigation, Upload, X, ChevronDown, ChevronLeft, ChevronRight, Link as LinkIcon, Unlink, Download, Trash2, Rotate3d, Scan, Target, Crosshair } from 'lucide-react';
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
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    stage, layers, activeCamera, cameras, viewMode, onCameraCapture, onSelectCamera, onSaveTour
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [sliceDepth, setSliceDepth] = useState(1);
  const [isSynced, setIsSynced] = useState(false);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  const [bimFileName, setBimFileName] = useState<string | null>(null);
  const [linkedRealityCameraId, setLinkedRealityCameraId] = useState<string | null>(null);
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState(false);
  const [bimRotation, setBimRotation] = useState(0);
  const [isRotatingBim, setIsRotatingBim] = useState(false);
  const [rotateStartX, setRotateStartX] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bimInputRef = useRef<HTMLInputElement>(null);

  // 360 Tour State
  const [panX, setPanX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isRecordingTour, setIsRecordingTour] = useState(false);
  const [currentLocationId, setCurrentLocationId] = useState('LOC-A');
  const [tourElapsedTime, setTourElapsedTime] = useState(0);
  const [tourPath, setTourPath] = useState<TourStep[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [stage, activeCamera, viewMode]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (activeCamera || (viewMode === 'SPLIT' && linkedRealityCameraId)) {
          interval = setInterval(() => {
             const mockDetections: AiDetection[] = [
                 { id: 'd1', label: 'Excavator', status: Math.random() > 0.3 ? 'WORKING' : 'IDLE', confidence: 0.98, x: 40 + (Math.random() * 5 - 2.5), y: 50 + (Math.random() * 5 - 2.5), width: 20, height: 15 },
                 { id: 'd2', label: 'Safety Personnel', status: 'MOVING', confidence: 0.92, x: 20 + (Math.random() * 10 - 5), y: 70 + (Math.random() * 2 - 1), width: 5, height: 12 }
             ];
             setDetections(mockDetections);
          }, 1000);
      } else {
          setDetections([]);
      }
      return () => clearInterval(interval);
  }, [activeCamera, viewMode, linkedRealityCameraId]);

  // CORE REFINEMENT: Capture Frame and Analyze with Gemini
  const handleAnalyzeStream = async () => {
    if (!activeCamera) return;
    setIsAnalyzing(true);
    
    // In a real browser implementation with direct video, we would draw to canvas:
    // ctx.drawImage(videoRef.current, 0, 0); const dataUrl = canvas.toDataURL();
    // For this demo/pitch, we use a placeholder to represent the 'Captured Frame'
    const dummyDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."; 

    try {
        const result = await analyzeSiteFrame(dummyDataUrl, stage, activeCamera.name);
        alert(`AI Site Audit (${result.isCodeReference}):\n\n${result.visualAudit}\n\nAnomaly Detected: ${result.detectedAnomalies.join(', ') || 'None'}`);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTour = () => {
      setIsRecordingTour(true);
      setTourElapsedTime(0);
      const startLoc = TOUR_LOCATIONS[currentLocationId];
      setTourPath([{ locationId: startLoc.id, locationName: startLoc.name, timestamp: new Date().toISOString() }]);
  };

  const handleStopTour = () => {
      setIsRecordingTour(false);
      const newSession: TourSession = { id: `SESS-${Date.now()}`, name: `Site Walkthrough ${new Date().toLocaleDateString()}`, date: new Date().toISOString().split('T')[0], duration: formatTime(tourElapsedTime), steps: tourPath };
      onSaveTour(newSession);
      setTourPath([]);
      setTourElapsedTime(0);
  };

  const handleNavigate = (targetId: string) => {
      setCurrentLocationId(targetId);
      setPanX(0);
      if (isRecordingTour) {
          const loc = TOUR_LOCATIONS[targetId];
          setTourPath(prev => [...prev, { locationId: loc.id, locationName: loc.name, timestamp: new Date().toISOString() }]);
      }
  };

  const getOverlayStyle = (color: string, sliceIndex: number = 0) => {
    const isSliced = layers.bimSlice && !activeCamera;
    const distanceMultiplier = 120 * sliceDepth; 
    const transform = isSliced ? `translateZ(${sliceIndex * distanceMultiplier}px) translateY(${-sliceIndex * 60 * sliceDepth}px) rotateX(5deg)` : 'translateZ(0px)';
    return { borderColor: color, boxShadow: `0 0 20px ${color}40`, transform: transform, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' };
  };
  
  const renderAiOverlay = () => (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {detections.map(det => (
              <div key={det.id} className="absolute transition-all duration-500 ease-linear border-2" style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.width}%`, height: `${det.height}%`, borderColor: det.status === 'WORKING' ? '#22c55e' : det.status === 'IDLE' ? '#f97316' : '#3b82f6' }}>
                  {precisionMode ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          <Crosshair size={24} className="text-white animate-spin-slow" />
                      </div>
                  ) : (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 -mt-0.5 -ml-0.5" style={{borderColor: 'inherit'}}></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 -mt-0.5 -mr-0.5" style={{borderColor: 'inherit'}}></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 -mb-0.5 -ml-0.5" style={{borderColor: 'inherit'}}></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 -mb-0.5 -mr-0.5" style={{borderColor: 'inherit'}}></div>
                      </>
                  )}
                  <div className="absolute -top-6 left-0 bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] text-white font-mono flex items-center gap-2 border border-slate-700 whitespace-nowrap">
                       <span className={`font-bold ${det.status === 'WORKING' ? 'text-green-400' : det.status === 'IDLE' ? 'text-orange-400' : 'text-blue-400'}`}>
                           [{det.label}: {det.status}]
                       </span>
                       <span className="text-slate-500">{(det.confidence * 100).toFixed(0)}%</span>
                  </div>
              </div>
          ))}
      </div>
  );

  return (
    <div className={`${isMaximized ? "fixed inset-0 z-50 bg-slate-950" : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"} group transition-all duration-300 select-none`}>
      
      <canvas ref={canvasRef} className="hidden" width="1280" height="720"></canvas>

      <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur-md p-2 rounded-lg border border-slate-600 text-slate-300 shadow-lg flex items-center gap-3">
            {activeCamera ? (
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">LIVE: {activeCamera.name}</span>
                 </div>
            ) : <span className="text-xs font-mono font-bold uppercase">{viewMode} VIEW</span>}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-600 transition-all shadow-lg">
          {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        {activeCamera && (
            <button 
                onClick={handleAnalyzeStream} 
                disabled={isAnalyzing}
                className={`p-2 rounded-lg border transition-all shadow-lg ${isAnalyzing ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-800 text-orange-400 border-slate-600 hover:bg-slate-700'}`}
                title="AI Frame Scan">
                {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Scan size={20} />}
            </button>
        )}
      </div>

      <div className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
        {viewMode === 'SPLIT' && !activeCamera && (
            <div className="relative w-full h-full bg-slate-900">
                {/* Simplified Split View Logic (same as before) */}
                <div className="absolute inset-0 w-full h-full bg-slate-800">
                    <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" alt="Reality" className="w-full h-full object-cover grayscale-[20%]" />
                </div>
                <div className="absolute inset-0 overflow-hidden border-r-2 border-orange-500 bg-slate-900 z-10" style={{ width: `${splitPosition}%` }}>
                    <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop" alt="BIM" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 invert" style={{ width: '100vw' }} />
                </div>
                <input type="range" min="0" max="100" value={splitPosition} onChange={(e) => setSplitPosition(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
            </div>
        )}

        {viewMode === 'TOUR' && !activeCamera && (
            <div className="relative w-full h-full cursor-move overflow-hidden">
                <div className="absolute inset-0 h-full w-[300%] bg-cover bg-center" style={{ backgroundImage: `url('${TOUR_LOCATIONS[currentLocationId].imageUrl}')`, transform: `translateX(${panX}px)` }}></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
                    <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 flex items-center gap-4 text-xs font-bold text-slate-300">
                        <MapPin size={12} className="text-cyan-400"/> {TOUR_LOCATIONS[currentLocationId].name}
                    </div>
                </div>
            </div>
        )}

        {(viewMode === 'ORBIT' || activeCamera) && (
             <div className="w-full h-full relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-10"></div>
                {activeCamera ? (
                     <div className="w-full h-full relative">
                         {renderAiOverlay()}
                         {activeCamera.streamType === 'YOUTUBE' ? (
                             <iframe src={activeCamera.streamUrl} className="w-full h-full object-cover scale-110" allow="autoplay; encrypted-media"></iframe>
                         ) : (
                             <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                         )}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                             <button 
                                onClick={() => setPrecisionMode(!precisionMode)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border backdrop-blur-md transition-all flex items-center gap-2 ${precisionMode ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-black/60 border-white/20 text-slate-400'}`}>
                                <Target size={12} /> {precisionMode ? 'PRECISION SCAN ACTIVE' : 'STANDARD VIEW'}
                             </button>
                        </div>
                     </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Layers size={48} className="text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Master Digital Twin Online</p>
                        </div>
                    </div>
                )}
             </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center">
             <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-cyan-400 font-mono text-xs uppercase tracking-tighter">Initializing Subsystems...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDViewer;
