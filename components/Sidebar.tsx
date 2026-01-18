
import React, { useState, useRef } from 'react';
import { ProjectStage, LayerVisibility, SiteMeasurement, LayerMetadata, DataSourceType, CameraFeed, ViewMode, TourSession } from '../types';
import { Layers, Eye, EyeOff, AlertTriangle, UploadCloud, Link as LinkIcon, FileCode, CheckCircle, Smartphone, Loader2, Database, Video, Radio, Spline, Plus, Move3d, SplitSquareHorizontal, Cuboid, Calendar, Clock, MapPin, PlayCircle, Trash2, MoreVertical, Grid, FileText, Check, Hammer, Download, FileJson, Zap } from 'lucide-react';

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
  onAddCamera: (url: string) => void;
  bimFileName: string | null;
  onBimFileSelect: (name: string | null) => void;
  isPremium?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentStage, measurements, layers, layerMeta, cameras, selectedCameraId, viewMode, savedTours, 
    onSetViewMode, toggleLayer, onRunDroneSurvey, onLayerUpload, onSelectCamera, onPlayTour, onDeleteTour, onOpenMultiView, onAddCamera, bimFileName, onBimFileSelect, isPremium 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'layers' | 'bim-reconstruct'>('layers');
  const [isProcessingBIM, setIsProcessingBIM] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reconstructionStatus, setReconstructionStatus] = useState<'IDLE' | 'UPLOADING' | 'ALIGNING' | 'GENERATING' | 'SUCCESS'>('IDLE');
  const [uploadedPlans, setUploadedPlans] = useState<string[]>([]);
  const [newStreamUrl, setNewStreamUrl] = useState('');
  
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

  const handleStartReconstruction = () => {
    if (uploadedPlans.length < 2) {
      alert("Please upload at least Architectural and Structural plans for accurate 3D reconstruction.");
      return;
    }
    setReconstructionStatus('UPLOADING');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setUploadProgress(progress);
      if (progress === 30) setReconstructionStatus('ALIGNING');
      if (progress === 70) setReconstructionStatus('GENERATING');
      if (progress >= 100) {
        clearInterval(interval);
        setReconstructionStatus('SUCCESS');
        onBimFileSelect(`Reconstructed_Model_${Date.now()}.ifc`);
        onLayerUpload('structural', 'BIM');
        onLayerUpload('pipes', 'BIM');
        onLayerUpload('electrical', 'BIM');
      }
    }, 100);
  };

  const handlePlanAdd = (type: string) => {
    const name = `${type}_Plan_v1.pdf`;
    setUploadedPlans(prev => [...prev, name]);
  };

  const handleBIMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        onBimFileSelect(file.name);
        setIsProcessingBIM(true);
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsProcessingBIM(false);
                    onLayerUpload('structural', 'BIM');
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    }
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
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="text-cyan-400" size={20} />
                Asset Intelligence
            </h2>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => setActiveSubTab('layers')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === 'layers' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500'}`}
              >
                Layers
              </button>
              <button 
                onClick={() => setActiveSubTab('bim-reconstruct')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeSubTab === 'bim-reconstruct' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800 text-slate-500'}`}
              >
                AI BIM Builder
              </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {activeSubTab === 'layers' ? (
              <>
                <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Visualization Mode</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => { onSelectCamera(null); onSetViewMode('ORBIT'); }} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'ORBIT' && !selectedCameraId ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><Cuboid size={20} className="mb-1" /><span className="text-[10px] font-bold">Orbit 3D</span></button>
                        <button onClick={() => { onSelectCamera(null); onSetViewMode('SPLIT'); }} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'SPLIT' && !selectedCameraId ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><SplitSquareHorizontal size={20} className="mb-1" /><span className="text-[10px] font-bold">BIM Split</span></button>
                        <button onClick={() => { onSelectCamera(null); onSetViewMode('TOUR'); }} className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewMode === 'TOUR' && !selectedCameraId ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><Move3d size={20} className="mb-1" /><span className="text-[10px] font-bold">360° Tour</span></button>
                    </div>
                </div>

                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Video size={12} /> Live Camera Network</h3>
                        <button onClick={onOpenMultiView} className="text-[10px] flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/30"><Grid size={10} /> Grid View</button>
                    </div>
                    <div className="space-y-2">
                        {cameras.map(cam => (
                            <button key={cam.id} onClick={() => onSelectCamera(cam.id)} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border ${selectedCameraId === cam.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'}`}>
                                <div className="relative">{cam.type === 'DRONE' ? <Radio size={16}/> : <Video size={16} />}{cam.status === 'RECORDING' && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}</div>
                                <div className="flex-1 text-left overflow-hidden"><div className="text-sm font-medium truncate">{cam.name}</div><div className="text-[10px] opacity-70 truncate">{cam.location}</div></div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Active Layers</h3>
                        <div className="space-y-2">
                            {layerControls.map((layer) => {
                                const meta = layerMeta[layer.key];
                                const isVisible = layers[layer.key];
                                const hasData = meta.hasData;
                                return (
                                    <button key={layer.key} onClick={() => hasData && toggleLayer(layer.key)} disabled={!hasData} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${isVisible ? 'bg-slate-800 border-slate-600 text-white shadow-md' : 'bg-slate-900/50 border-slate-800 text-slate-500'} ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: isVisible ? layer.color : '#475569' }}></div><span className="text-sm font-medium">{layer.label}</span></div>
                                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
                  <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Hammer size={16} /> 2D to 3D BIM Synthesis
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">Upload architectural, structural, and electrical plans to generate a master Digital Twin.</p>
                </div>

                <div className="space-y-2">
                  <PlanUploadRow label="Architectural Plan" onAdd={() => handlePlanAdd('Arch')} isAdded={uploadedPlans.some(p => p.startsWith('Arch'))} />
                  <PlanUploadRow label="Structural Plan" onAdd={() => handlePlanAdd('Struct')} isAdded={uploadedPlans.some(p => p.startsWith('Struct'))} />
                  <PlanUploadRow label="MEP/Electrical" onAdd={() => handlePlanAdd('Elec')} isAdded={uploadedPlans.some(p => p.startsWith('Elec'))} />
                  <PlanUploadRow label="Site Topography" onAdd={() => handlePlanAdd('Site')} isAdded={uploadedPlans.some(p => p.startsWith('Site'))} />
                </div>

                <div className="pt-4">
                  {reconstructionStatus === 'IDLE' ? (
                    <button 
                      onClick={handleStartReconstruction}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={16} className="fill-white" />
                      Build BIM Model
                    </button>
                  ) : reconstructionStatus === 'SUCCESS' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                         <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                         <p className="text-xs font-bold text-green-400 uppercase">Model Generated Successfully</p>
                         <p className="text-[10px] text-slate-400 mt-1">Integrated with 3D Viewer Layers</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg text-xs font-bold border border-slate-700">
                          <Download size={14} /> Download .IFC
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg text-xs font-bold border border-slate-700">
                          <FileJson size={14} /> View Metadata
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center relative overflow-hidden">
                       <Loader2 className="animate-spin text-purple-500 mx-auto mb-3" size={32} />
                       <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">{reconstructionStatus}</p>
                       <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
    </div>
  );
};

const PlanUploadRow: React.FC<{ label: string; onAdd: () => void; isAdded: boolean }> = ({ label, onAdd, isAdded }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isAdded ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
    <div className="flex items-center gap-3">
      {isAdded ? <Check size={14} className="text-green-500" /> : <FileText size={14} className="text-slate-500" />}
      <span className={`text-xs font-medium ${isAdded ? 'text-green-400' : 'text-slate-300'}`}>{label}</span>
    </div>
    <button 
      onClick={onAdd}
      disabled={isAdded}
      className={`p-1.5 rounded-md transition-all ${isAdded ? 'text-green-500' : 'text-slate-500 hover:text-cyan-400 bg-slate-900/50'}`}
    >
      {isAdded ? 'Ready' : <Plus size={14} />}
    </button>
  </div>
);

export default Sidebar;
