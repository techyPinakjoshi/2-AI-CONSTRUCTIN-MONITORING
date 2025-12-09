import React, { useState, useRef } from 'react';
import { ProjectStage, LayerVisibility, SiteMeasurement, LayerMetadata, DataSourceType, CameraFeed } from '../types';
import { Layers, Eye, EyeOff, AlertTriangle, UploadCloud, Link as LinkIcon, FileCode, CheckCircle, Smartphone, Loader2, Database, Video, Radio } from 'lucide-react';

interface SidebarProps {
  currentStage: ProjectStage;
  measurements: SiteMeasurement[];
  layers: LayerVisibility;
  layerMeta: Record<keyof LayerVisibility, LayerMetadata>;
  cameras: CameraFeed[];
  selectedCameraId: string | null;
  toggleLayer: (key: keyof LayerVisibility) => void;
  onRunDroneSurvey: () => void;
  onLayerUpload: (key: keyof LayerVisibility, source: DataSourceType) => void;
  onSelectCamera: (id: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentStage, 
    measurements, 
    layers, 
    layerMeta,
    cameras,
    selectedCameraId,
    toggleLayer, 
    onRunDroneSurvey,
    onLayerUpload,
    onSelectCamera
}) => {
  const [isProcessingBIM, setIsProcessingBIM] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const bimInputRef = useRef<HTMLInputElement>(null);

  const layerControls: { key: keyof LayerVisibility; label: string; color: string }[] = [
    { key: 'structural', label: 'Structural Model', color: 'cyan' },
    { key: 'pipes', label: 'MEP / Piping', color: 'orange' },
    { key: 'electrical', label: 'Electrical Grid', color: 'yellow' },
    { key: 'excavationRed', label: 'Planned Excavation', color: 'red' },
    { key: 'excavationGreen', label: 'Completed Work', color: 'green' },
    { key: 'excavationBlue', label: 'Live Progress', color: 'blue' },
  ];

  const handleConAIConnect = () => {
    // Simulate connection to external app
    const confirmed = window.confirm("Connect to ConAI Workspace to import 2D Site Plans?");
    if (confirmed) {
        // Mock loading specific layers from "ConAI"
        onLayerUpload('excavationRed', 'ConAI');
    }
  };

  const handleBIMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsProcessingBIM(true);
        setUploadProgress(0);

        // Simulation of BIM parsing and slicing
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
      // Automatically "slice" and populate relevant layers
      onLayerUpload('structural', 'BIM');
      onLayerUpload('pipes', 'BIM');
      onLayerUpload('electrical', 'BIM');
      alert("BIM Model Processed: Structural, MEP, and Electrical layers extracted successfully.");
  };

  const handleIndividualUpload = (key: keyof LayerVisibility) => {
      // Simulate file dialog
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.dwg,.pdf,.ifc,.rvt';
      input.onchange = () => {
          onLayerUpload(key, 'MANUAL');
      };
      input.click();
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
            
            {/* Camera Network Section */}
            <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Video size={12} /> Live Camera Network
                </h3>
                <div className="space-y-2">
                    {/* Master View Button */}
                    <button 
                        onClick={() => onSelectCamera(null)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border ${
                            selectedCameraId === null 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                        }`}>
                        <div className="relative">
                            <Layers size={18} />
                            {selectedCameraId === null && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-bold">Master 3D Twin</div>
                            <div className="text-[10px] opacity-70">Aggregated Data View</div>
                        </div>
                    </button>

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
                                <div className="text-[10px] opacity-70 truncate">{cam.location}</div>
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
                                    {/* Visibility Toggle */}
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
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]`} 
                                                 style={{ 
                                                     color: isVisible ? layer.color : '#64748b', 
                                                     backgroundColor: isVisible ? layer.color : 'transparent' 
                                                 }}></div>
                                            <span className="text-sm font-medium truncate max-w-[120px]">{layer.label}</span>
                                        </div>
                                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>

                                    {/* Connection / Upload Status Button */}
                                    {hasData ? (
                                        <div className="relative group/tooltip">
                                            <div className={`p-2.5 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center
                                                ${meta.source === 'BIM' ? 'text-cyan-400' : 
                                                  meta.source === 'ConAI' ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                {meta.source === 'BIM' && <FileCode size={14} />}
                                                {meta.source === 'ConAI' && <LinkIcon size={14} />}
                                                {meta.source === 'MANUAL' && <CheckCircle size={14} />}
                                            </div>
                                            <div className="absolute right-0 top-full mt-2 w-max bg-black text-white text-xs px-2 py-1 rounded hidden group-hover/tooltip:block z-50">
                                                Source: {meta.source}
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleIndividualUpload(layer.key)}
                                            className="p-2.5 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-all"
                                            title="Upload Layer Data">
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