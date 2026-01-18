
import React, { useState, useEffect, useRef } from 'react';
import { LayerVisibility, WorkStatus, ProjectStage, CameraFeed, ViewMode, TourSession, TourStep, AiDetection } from '../types';
import { Maximize, Minimize, Layers, Zap, Ruler, Camera, Activity, Video, Radio, Spline, Save, RefreshCw, SplitSquareHorizontal, Move3d, MapPin, AlertCircle, Play, Square, Timer, Navigation, Upload, X, ChevronDown, ChevronLeft, ChevronRight, Link as LinkIcon, Unlink, Download, Trash2, Rotate3d, Scan, Target, Crosshair, Box } from 'lucide-react';
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
    stage, layers, activeCamera, cameras, viewMode, onCameraCapture, onSelectCamera, onSaveTour, bimFileName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [sliceDepth, setSliceDepth] = useState(1);
  const [detections, setDetections] = useState<AiDetection[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  const [panX, setPanX] = useState(0);
  const [currentLocationId, setCurrentLocationId] = useState('LOC-A');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [stage, activeCamera, viewMode, bimFileName]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (activeCamera) {
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
  }, [activeCamera]);

  const handleAnalyzeStream = async () => {
    if (!activeCamera) return;
    setIsAnalyzing(true);
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
                <span className="text-[10px] font-mono text-cyan-400 animate-pulse">{bimFileName}</span>
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
                className={`p-2 rounded-lg border transition-all shadow-lg ${isAnalyzing ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-800 text-orange-400 border-slate-600 hover:bg-slate-700'}`}
                title="AI Frame Scan">
                {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Scan size={20} />}
            </button>
        )}
      </div>

      <div className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
        {viewMode === 'SPLIT' && !activeCamera && (
            <div className="relative w-full h-full bg-slate-900">
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
             <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950">
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-10"></div>
                
                {activeCamera ? (
                     <div className="w-full h-full relative">
                         {renderAiOverlay()}
                         {activeCamera.streamType === 'YOUTUBE' ? (
                             <iframe src={activeCamera.streamUrl} className="w-full h-full object-cover scale-110" allow="autoplay; encrypted-media"></iframe>
                         ) : (
                             <video src={activeCamera.streamUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                         )}
                     </div>
                ) : bimFileName ? (
                    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
                        {/* Simulated 3D BIM Mesh */}
                        <div className="w-[500px] h-[400px] relative animate-float transition-transform duration-1000" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(45deg)' }}>
                            {/* Building Slabs */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <div 
                                    key={i}
                                    className="absolute inset-0 border-2 border-cyan-500/40 bg-cyan-500/5 backdrop-blur-[1px] transition-all duration-700"
                                    style={{ 
                                        transform: `translateZ(${i * 60 * (layers.bimSlice ? sliceDepth : 1)}px)`,
                                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)'
                                    }}
                                >
                                    {/* Grid on Slabs */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                    {/* Structural Elements */}
                                    {layers.structural && (
                                        <div className="absolute inset-4 border border-cyan-400/20 flex items-center justify-center">
                                            <div className="w-1/2 h-1/2 border-l-4 border-cyan-400/40"></div>
                                        </div>
                                    )}
                                    {/* MEP Elements */}
                                    {layers.pipes && (
                                        <div className="absolute inset-0 border-r-4 border-orange-500/30"></div>
                                    )}
                                </div>
                            ))}
                            {/* Vertical Columns */}
                            <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                                <div className="absolute left-0 top-0 w-1 bg-cyan-400/30 h-[240px]" style={{ transform: 'rotateX(-90deg)', transformOrigin: 'top' }}></div>
                                <div className="absolute right-0 top-0 w-1 bg-cyan-400/30 h-[240px]" style={{ transform: 'rotateX(-90deg)', transformOrigin: 'top' }}></div>
                                <div className="absolute left-0 bottom-0 w-1 bg-cyan-400/30 h-[240px]" style={{ transform: 'rotateX(-90deg)', transformOrigin: 'top' }}></div>
                                <div className="absolute right-0 bottom-0 w-1 bg-cyan-400/30 h-[240px]" style={{ transform: 'rotateX(-90deg)', transformOrigin: 'top' }}></div>
                            </div>
                        </div>

                        {/* Tech UI Overlay on 3D */}
                        <div className="absolute bottom-20 left-10 space-y-2 animate-in slide-in-from-left duration-1000">
                            <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded border border-cyan-900/50">
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                                RENDER_ENGINE: STABLE
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                                GEOM_VERTS: 142.5k
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center animate-in zoom-in duration-700">
                        <Layers size={48} className="text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mb-2">Awaiting Data Sync</p>
                        <p className="text-slate-700 text-[10px] uppercase font-bold">Connect BIM File in Sidebar to Initialize Twin</p>
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: rotateX(60deg) rotateZ(45deg) translateY(0); }
          50% { transform: rotateX(60deg) rotateZ(45deg) translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1200px;
        }
      `}</style>
    </div>
  );
};

export default ThreeDViewer;
