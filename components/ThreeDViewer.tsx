import React, { useState, useEffect } from 'react';
import { LayerVisibility, WorkStatus, ProjectStage, CameraFeed } from '../types';
import { Maximize, Minimize, Layers, Zap, Ruler, Camera, Activity, Video, Radio } from 'lucide-react';

interface ThreeDViewerProps {
  stage: ProjectStage;
  layers: LayerVisibility;
  activeCamera: CameraFeed | null; // null = Master Mode
  cameras: CameraFeed[];
  onCameraCapture: () => void;
  onSelectCamera: (id: string | null) => void;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
    stage, 
    layers, 
    activeCamera, 
    cameras,
    onCameraCapture,
    onSelectCamera
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Simulate loading a new "model" when stage changes or view mode changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), activeCamera ? 800 : 1200);
    return () => clearTimeout(timer);
  }, [stage, activeCamera]);

  // Dynamic overlay styles based on status
  const getOverlayStyle = (color: string) => ({
    borderColor: color,
    boxShadow: `0 0 20px ${color}40`,
  });

  const containerClasses = isMaximized 
    ? "fixed inset-0 z-50 bg-slate-950" 
    : "relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl";

  return (
    <div className={`${containerClasses} group transition-all duration-300`}>
      
      {/* View Header Info */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <div className="bg-slate-800/80 backdrop-blur-md p-2 rounded-lg border border-slate-600 text-slate-300 shadow-lg flex items-center gap-3">
            {activeCamera ? (
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-mono font-bold text-red-400 uppercase">LIVE FEED: {activeCamera.name}</span>
                 </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">MASTER 3D TWIN</span>
                </div>
            )}
            
            {isMaximized && !activeCamera && (
                <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                    FULLSCREEN MONITORING
                </span>
            )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          className="p-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-600 transition-all shadow-lg" 
          title={isMaximized ? "Exit Fullscreen" : "Maximize View"}>
          {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <button className="p-2 bg-slate-800/90 hover:bg-slate-700 text-purple-400 rounded-lg border border-slate-600 transition-all shadow-lg" title="Measure">
          <Ruler size={20} />
        </button>
        <button 
          onClick={onCameraCapture}
          className="p-2 bg-slate-800/90 hover:bg-slate-700 text-green-400 rounded-lg border border-slate-600 transition-all shadow-lg" title="Capture & Analyze">
          <Camera size={20} />
        </button>
      </div>

      {/* Main Viewport */}
      <div className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
        {/* Render Logic: Camera Feed vs Master Model */}
        <div className="w-full h-full relative overflow-hidden">
             
            {/* Background Grid */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-10"></div>
            
            {activeCamera ? (
                 // CAMERA VIEW MODE
                 <div className="w-full h-full relative">
                     <img 
                        src={`https://picsum.photos/seed/${activeCamera.id}/1600/900?grayscale`} 
                        alt="Live Camera Feed" 
                        className="w-full h-full object-cover"
                    />
                    {/* Camera Feed Overlays (AI Detection) */}
                    <div className="absolute inset-0 z-10">
                        {/* Blue Line: Work In Progress (Live detection) */}
                        <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 border-2 border-blue-500 bg-blue-500/5 animate-pulse rounded-sm">
                            <div className="absolute -top-6 left-0 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold rounded">
                                <Activity size={10} />
                                DETECTING PROGRESS (Excavation)
                            </div>
                        </div>

                        {/* Green Line: Completed / Verified */}
                        <div className="absolute bottom-1/4 right-1/3 w-1/5 h-1/5 border-2 border-green-500 bg-green-500/5 rounded-sm">
                            <div className="absolute -bottom-6 right-0 bg-green-600 text-white px-2 py-0.5 text-[10px] font-bold rounded">
                                VERIFIED: FOUNDATION WALL
                            </div>
                        </div>

                        {/* HUD Stats */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                             <div className="bg-black/60 backdrop-blur p-2 rounded text-[10px] font-mono text-green-400">
                                 Confidence: 98.4%
                             </div>
                             <div className="bg-black/60 backdrop-blur p-2 rounded text-[10px] font-mono text-blue-400">
                                 Tracking: 12 Objects
                             </div>
                        </div>
                    </div>
                 </div>
            ) : (
                // MASTER 3D MODEL MODE
                <>
                    <img 
                        src="https://picsum.photos/1600/900?grayscale&blur=1" 
                        alt="Master 3D Model" 
                        className="w-full h-full object-cover opacity-60 scale-105 group-hover:scale-110 transition-transform duration-[20s]"
                    />

                    {/* Master Layers Overlays */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="relative w-3/4 h-3/4 transform perspective-1000 rotate-x-12 rotate-z-2">
                            
                            {/* RED LINE: Planned */}
                            {layers.excavationRed && (
                                <div className="absolute top-10 left-10 w-1/3 h-1/2 border-2 border-dashed border-red-500 bg-red-500/10 rounded-tr-3xl"
                                    style={getOverlayStyle('#ef4444')}>
                                    <span className="absolute -top-6 left-0 text-red-500 text-xs font-mono bg-slate-900 px-1">PLANNED (MASTER)</span>
                                </div>
                            )}

                            {/* GREEN LINE: Completed (Synced from Cameras) */}
                            {layers.excavationGreen && (
                                <div className="absolute bottom-10 right-10 w-1/3 h-1/3 border-2 border-green-500 bg-green-500/10 rounded-bl-3xl"
                                    style={getOverlayStyle('#22c55e')}>
                                    <span className="absolute -bottom-6 right-0 text-green-500 text-xs font-mono bg-slate-900 px-1">COMPLETED (SYNCED)</span>
                                </div>
                            )}

                            {/* BLUE LINE: Live (Aggregate) */}
                            {layers.excavationBlue && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 border-2 border-dashed border-blue-400 bg-blue-400/10 animate-pulse"
                                    style={getOverlayStyle('#60a5fa')}>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-500 text-slate-950 px-2 py-0.5 text-[10px] font-bold rounded-full">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                        AGGREGATED LIVE PROGRESS
                                    </div>
                                </div>
                            )}

                            {/* BIM/Structural Layers */}
                            {layers.structural && (
                                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M10,90 L10,10 L90,10 L90,90 Z" fill="none" stroke="cyan" strokeWidth="0.5" />
                                    <path d="M10,10 L50,40 L90,10" fill="none" stroke="cyan" strokeWidth="0.5" />
                                    <line x1="10" y1="90" x2="50" y2="40" stroke="cyan" strokeWidth="0.5" />
                                    <line x1="90" y1="90" x2="50" y2="40" stroke="cyan" strokeWidth="0.5" />
                                </svg>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* Floating Camera Network Panel (Only in Maximized Master Mode) */}
      {isMaximized && !activeCamera && (
        <div className="absolute right-4 top-16 bottom-4 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl overflow-y-auto z-30 flex flex-col shadow-2xl scrollbar-hide">
            <div className="p-3 border-b border-slate-700 bg-slate-800/50 sticky top-0 z-10">
                <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Video size={14} className="text-cyan-400" /> Connected Feeds ({cameras.length})
                </h3>
            </div>
            <div className="p-2 space-y-2">
                {cameras.map((cam) => (
                    <div 
                        key={cam.id}
                        onClick={() => onSelectCamera(cam.id)}
                        className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer bg-slate-950"
                    >
                        <img 
                            src={`https://picsum.photos/seed/${cam.id}/200/120?grayscale`} 
                            alt={cam.name} 
                            className="w-full h-24 object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] font-bold text-white truncate w-32">{cam.name}</div>
                                    <div className="text-[8px] text-slate-400">{cam.type}</div>
                                </div>
                                {cam.status === 'RECORDING' && (
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                                )}
                            </div>
                        </div>
                        
                        {/* Overlay Icon on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <Maximize size={24} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center">
             <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-cyan-400 font-mono animate-pulse">
                 {activeCamera ? 'CONNECTING FEED...' : 'AGGREGATING DATA POINTS...'}
             </p>
          </div>
        </div>
      )}

      {/* Data Overlay Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-20 pointer-events-none">
        <div className="flex justify-between items-end">
             <div className="flex gap-4">
                 <div className="text-slate-400 text-xs">
                     <p className="uppercase text-[10px] text-slate-500">Coordinates</p>
                     <p className="font-mono">N 28°35'12" E 77°14'22"</p>
                 </div>
                 {!activeCamera && (
                     <div className="text-slate-400 text-xs">
                        <p className="uppercase text-[10px] text-slate-500">Master Sync</p>
                        <p className="font-mono text-cyan-400">Live ({cameras.length} Feeds)</p>
                     </div>
                 )}
             </div>
             
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-green-500 text-xs font-bold tracking-wider">
                     {activeCamera ? 'AI VISION ACTIVE' : 'LIDAR CLOUD ACTIVE'}
                 </span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewer;