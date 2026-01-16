import React, { useState, useRef } from 'react';
import { ProjectStage, LayerVisibility, SiteMeasurement, LayerMetadata, DataSourceType, CameraFeed, ViewMode, TourSession } from '../types';
import { Layers, Eye, EyeOff, AlertTriangle, UploadCloud, Link as LinkIcon, FileCode, CheckCircle, Smartphone, Loader2, Database, Video, Radio, Spline, Plus, Move3d, SplitSquareHorizontal, Cuboid, Calendar, Clock, MapPin, PlayCircle, Trash2, MoreVertical, Grid } from 'lucide-react';

interface SidebarProps {
  currentStage: ProjectStage;
  measurements: SiteMeasurement[];
  layers: LayerVisibility;
  layerMeta: Record<keyof LayerVisibility, LayerMetadata>;
  cameras: CameraFeed[];
  selectedCameraId: string | null;
  viewMode: ViewMode;
  savedTours: TourSession[];
  onSetViewMode: (mode: ViewMode) => void;
  toggleLayer: (key: keyof LayerVisibility) => void;
  onRunDroneSurvey: () => void;
  onLayerUpload: (key: keyof LayerVisibility, source: DataSourceType) => void;
  onSelectCamera: (id: string | null) => void;
  onPlayTour: (session: TourSession) => void;
  onDeleteTour: (id: string) => void;
  onOpenMultiView: () => void;
  onAddCamera: (url: string) => void; // NEW PROP
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentStage, 
    measurements, 
    layers, 
    layerMeta,
    cameras,
    selectedCameraId,
    viewMode,
    savedTours,
    onSetViewMode,
    toggleLayer, 
    onRunDroneSurvey,
    onLayerUpload,
    onSelectCamera,
    onPlayTour,
    onDeleteTour,
    onOpenMultiView,
    onAddCamera
}) => {
  const [isProcessingBIM, setIsProcessingBIM] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const bimInputRef = useRef<HTMLInputElement>(null);

  const layerControls: { key: keyof LayerVisibility; label: string; color: string }[] = [
    { key: 'structural', label: 'Structural Model', color: 'cyan' },
    { key: 'pipes', label: 'MEP / Piping', color: 'orange' },
    { key: 'electrical', label: 'Electrical Grid', color: 'yellow' },
    { key: 'excavationRed', label: 'Planned Excavation', color: 'red' },
    { key: 'excavationGreen', label: 'Completed Work', color: 'green' },
    { key: 'excavationBlue', label: 'Live Progress', color: 'blue' },
    { key: 'bimSlice', label: 'BIM Slicing View', color: 'purple' },
  ];

  const handleConAIConnect = () => {
    const confirmed = window.confirm("Connect to ConAI Workspace to import 2D Site Plans?");
    if (confirmed) {
        onLayerUpload('excavationRed', 'ConAI');
    }
  };

  const handleBIMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsProcessingBIM(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    finishBIMProcessing();
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    }
  };

  const finishBIMProcessing = () => {
      setIsProcessingBIM(false);
      onLayerUpload('structural', 'BIM');
      onLayerUpload('pipes', 'BIM');
      onLayerUpload('electrical', 'BIM');
      if (!layers.bimSlice) toggleLayer('bimSlice');
      onLayerUpload('bimSlice', 'BIM');
      alert("BIM File Connected Successfully! Opening Slicing View...");
  };

  const handleIndividualUpload = (key: keyof LayerVisibility) => {
      if (key === 'bimSlice') {
          bimInputRef.current?.click();
          return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.dwg,.pdf,.ifc,.rvt';
      input.onchange = () => {
          onLayerUpload(key, 'MANUAL');
      };
      input.click();
  };

  const handleAddStream = (e: React.FormEvent) => {
      e.preventDefault();
      if(newStreamUrl) {
          onAddCamera(newStreamUrl);
          setNewStreamUrl('');
      }
  };

  return (
    <div className="w-96 h-full bg-slate-900 border-l border-slate-700 flex flex-col shadow-xl z-30 font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="text-cyan-400" size={20} />
                Site Data & Assets
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage BIM, CAD & Drone Data</p>
        </div>

        <div className="flex-1 overflow-y-auto">
            
            {/* VIEW MODES */}
            <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Visualization Mode
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => { onSelectCamera(null); onSetViewMode('ORBIT'); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'ORBIT' && !selectedCameraId ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <Cuboid size={20} className="mb-1" />
                        <span className="text-[10px] font-bold">Orbit 3D</span>
                    </button>
                    <button 
                        onClick={() => { onSelectCamera(null); onSetViewMode('SPLIT'); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'SPLIT' && !selectedCameraId ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <SplitSquareHorizontal size={20} className="mb-1" />
                        <span className="text-[10px] font-bold">BIM Split</span>
                    </button>
                    <button 
                        onClick={() => { onSelectCamera(null); onSetViewMode('TOUR'); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'TOUR' && !selectedCameraId ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <Move3d size={20} className="mb-1" />
                        <span className="text-[10px] font-bold">360° Tour</span>
                    </button>
                </div>
            </div>

            {/* SAVED TOURS (Only Visible in TOUR Mode) */}
            {viewMode === 'TOUR' && (
                <div className="p-4 border-b border-slate-700/50 bg-green-900/10">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={12} /> Recent Walkthroughs
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {savedTours.map((tour) => (
                            <div key={tour.id} className="relative bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-start gap-2">
                                         {/* Menu Trigger */}
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === tour.id ? null : tour.id);
                                                }}
                                                className="mt-0.5 text-slate-500 hover:text-white transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                            
                                            {/* Context Menu */}
                                            {activeMenuId === tour.id && (
                                                <div className="absolute left-0 top-6 z-50 w-24 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                                    <button 
                                                        onClick={() => {
                                                            onDeleteTour(tour.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-red-500/20 flex items-center gap-2">
                                                        <Trash2 size={10} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-200">{tour.name}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                                <Calendar size={10} /> {tour.date}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onPlayTour(tour)}
                                        className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                                        title="Play Walkthrough Video">
                                        <PlayCircle size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between text-[10px] bg-slate-900/50 p-1.5 rounded ml-6">
                                     <span className="text-slate-400">{tour.steps.length} Locations</span>
                                     <span className="font-mono text-green-400">{tour.duration}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Camera Network Section */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Video size={12} /> Live Camera Network
                    </h3>
                    <button 
                        onClick={onOpenMultiView}
                        className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30">
                        <Grid size={10} /> Grid View
                    </button>
                </div>

                {/* Quick Add Stream Input */}
                <form onSubmit={handleAddStream} className="mb-3 flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Paste YouTube/RTSP Link..." 
                        value={newStreamUrl}
                        onChange={(e) => setNewStreamUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                    />
                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-1.5 rounded-lg border border-slate-700">
                        <Plus size={14} />
                    </button>
                </form>

                <div className="space-y-2">
                    {/* Camera List */}
                    {cameras.map(cam => (
                        <button 
                            key={cam.id}
                            onClick={() => onSelectCamera(cam.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border ${
                                selectedCameraId === cam.id
                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                            }`}>
                            <div className="relative">
                                {cam.type === 'DRONE' ? <Radio size={16}/> : <Video size={16} />}
                                {cam.status === 'RECORDING' && (
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <div className="text-sm font-medium truncate">{cam.name}</div>
                                <div className="flex justify-between items-center">
                                    <div className="text-[10px] opacity-70 truncate">{cam.location}</div>
                                    {cam.streamType === 'YOUTUBE' && <div className="text-[9px] text-red-400">YouTube</div>}
                                </div>
                            </div>
                            {cam.status === 'RECORDING' && <span className="text-[9px] text-red-400 font-mono">REC</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Sources Section */}
            <div className="p-4 space-y-3 border-b border-slate-700/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connect Sources</h3>
                
                {/* ConAI Connection */}
                <button 
                    onClick={handleConAIConnect}
                    className="w-full flex items-center justify-between p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 p-1.5 rounded-md text-white">
                            <Smartphone size={16} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">Connect ConAI Plan</div>
                            <div className="text-[10px] text-indigo-400/60">Import 2D Plans & Boundaries</div>
                        </div>
                    </div>
                    <LinkIcon size={14} className="text-indigo-400" />
                </button>

                {/* Master BIM Upload */}
                <div className="relative">
                    <input 
                        type="file" 
                        ref={bimInputRef}
                        className="hidden" 
                        accept=".ifc,.rvt,.nwd"
                        onChange={handleBIMUpload}
                    />
                    <button 
                        onClick={() => bimInputRef.current?.click()}
                        disabled={isProcessingBIM}
                        className="w-full flex items-center justify-between p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all group">
                        <div className="flex items-center gap-3">
                             <div className="bg-cyan-600 p-1.5 rounded-md text-white">
                                {isProcessingBIM ? <Loader2 size={16} className="animate-spin"/> : <FileCode size={16} />}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-cyan-300 group-hover:text-cyan-200">
                                    {isProcessingBIM ? 'Processing BIM...' : 'Upload Master BIM'}
                                </div>
                                <div className="text-[10px] text-cyan-400/60">
                                    {isProcessingBIM ? `Slicing Layers: ${uploadProgress}%` : 'Auto-slice Structural, MEP, etc.'}
                                </div>
                            </div>
                        </div>
                        {!isProcessingBIM && <UploadCloud size={14} className="text-cyan-400" />}
                    </button>
                    {/* Progress Bar for BIM */}
                    {isProcessingBIM && (
                        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-300 rounded-b-lg" style={{ width: `${uploadProgress}%` }}></div>
                    )}
                </div>
            </div>

            {/* Action Button: Drone Survey */}
            <div className="p-4 pb-2">
                 <button 
                    onClick={onRunDroneSurvey}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 text-white font-medium rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 group text-sm">
                    <span className="group-hover:rotate-12 transition-transform">🛸</span> 
                    Run Drone Topography Scan
                 </button>
            </div>

            {/* Layer Controls */}
            <div className="p-4 space-y-6">
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Layers</h3>
                        <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            {Object.values(layers).filter(Boolean).length} Visible
                        </span>
                    </div>
                    
                    <div className="space-y-2">
                        {layerControls.map((layer) => {
                            const meta = layerMeta[layer.key];
                            const isVisible = layers[layer.key];
                            const hasData = meta.hasData;

                            return (
                                <div key={layer.key} className="flex items-center gap-2">
                                    <button
                                        onClick={() => hasData && toggleLayer(layer.key)}
                                        disabled={!hasData}
                                        className={`flex-1 flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                                            isVisible 
                                            ? 'bg-slate-800 border-slate-600 text-white shadow-md' 
                                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-800/50'
                                        } ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {layer.key === 'bimSlice' ? (
                                                <div className="text-purple-400"><Spline size={14} /></div>
                                            ) : (
                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]`} 
                                                 style={{ 
                                                     color: isVisible ? layer.color : '#64748b', 
                                                     backgroundColor: isVisible ? layer.color : 'transparent' 
                                                 }}></div>
                                            )}
                                            <span className="text-sm font-medium truncate max-w-[120px]">{layer.label}</span>
                                        </div>
                                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>

                                    {hasData ? (
                                        <div className="relative group/tooltip">
                                            <div className={`p-2.5 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center
                                                ${meta.source === 'BIM' ? 'text-cyan-400' : 
                                                  meta.source === 'ConAI' ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                {meta.source === 'BIM' && <FileCode size={14} />}
                                                {meta.source === 'ConAI' && <LinkIcon size={14} />}
                                                {meta.source === 'MANUAL' && <CheckCircle size={14} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleIndividualUpload(layer.key)}
                                            className="p-2.5 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-all flex items-center gap-1"
                                            title="Connect Data">
                                            <UploadCloud size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Measurements</h3>
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 border border-slate-700">
                        {measurements.map((m, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">{m.label}</span>
                                <div className="text-right">
                                    <span className="block text-sm font-mono font-medium text-white">{m.value} <span className="text-slate-500 text-xs">{m.unit}</span></span>
                                    {m.delta && (
                                        <span className={`text-[10px] ${m.delta.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                            {m.delta}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {currentStage === ProjectStage.EXCAVATION && (
                    <section className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg animate-pulse">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-yellow-500 mb-1">Excavation Alert</h4>
                                <p className="text-xs text-yellow-200/80">
                                    Soil density in Zone B is 15% lower than expected.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    </div>
  );
};

export default Sidebar;