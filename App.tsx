import React, { useState, useEffect } from 'react';
import { 
  ProjectStage, 
  InventoryItem, 
  SiteMeasurement, 
  LayerVisibility,
  LayerMetadata,
  DataSourceType,
  CameraFeed
} from './types';
import { INITIAL_INVENTORY, STAGES, MOCK_CAMERAS } from './constants';
import ThreeDViewer from './components/ThreeDViewer';
import Sidebar from './components/Sidebar';
import InventoryPanel from './components/InventoryPanel';
import ProgressPanel from './components/ProgressPanel';
import { LayoutDashboard, Package, Activity, Settings, UserCircle, Menu, X, ClipboardList } from 'lucide-react';
import { analyzeSiteProgress, getRegulatoryAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'progress'>('dashboard');
  const [currentStage, setCurrentStage] = useState<ProjectStage>(ProjectStage.EXCAVATION);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [regulatoryQuery, setRegulatoryQuery] = useState('');
  const [regulatoryAnswer, setRegulatoryAnswer] = useState<string | null>(null);
  
  // Camera & Master View State
  const [cameras, setCameras] = useState<CameraFeed[]>(MOCK_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Measurements State
  const [measurements, setMeasurements] = useState<SiteMeasurement[]>([
    { label: 'Total Area', value: '45,200', unit: 'sq.ft', delta: '+0%' },
    { label: 'Excavated Volume', value: '12,500', unit: 'cu.m', delta: '+12%' },
    { label: 'Max Depth', value: '8.4', unit: 'm', delta: '+0.5m' },
    { label: 'Soil Density', value: '1.85', unit: 'g/cc' },
  ]);

  // Layer Visibility State (Global Master State)
  const [layers, setLayers] = useState<LayerVisibility>({
    structural: true,
    pipes: false,
    electrical: false,
    interiors: false,
    facade: false,
    excavationRed: true,
    excavationGreen: true,
    excavationBlue: true, // Live progress
  });

  // Layer Metadata (Source & Connection) State
  const [layerMeta, setLayerMeta] = useState<Record<keyof LayerVisibility, LayerMetadata>>({
    structural: { id: 'structural', hasData: false, source: null },
    pipes: { id: 'pipes', hasData: false, source: null },
    electrical: { id: 'electrical', hasData: false, source: null },
    interiors: { id: 'interiors', hasData: false, source: null },
    facade: { id: 'facade', hasData: false, source: null },
    excavationRed: { id: 'excavationRed', hasData: true, source: 'ConAI' }, // Mock: Plan already connected
    excavationGreen: { id: 'excavationGreen', hasData: true, source: 'MANUAL' },
    excavationBlue: { id: 'excavationBlue', hasData: true, source: 'MANUAL' },
  });

  const toggleLayer = (key: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLayerUpload = (key: keyof LayerVisibility, source: DataSourceType) => {
    setLayerMeta(prev => ({
        ...prev,
        [key]: { ...prev[key], hasData: true, source }
    }));
    // Auto-enable visibility when data is added
    setLayers(prev => ({ ...prev, [key]: true }));
  };

  const handleRunDroneSurvey = async () => {
    // Simulate updating measurements after survey
    const newMeasurements = measurements.map(m => ({
        ...m,
        value: (parseFloat(m.value.replace(/,/g, '')) * 1.05).toFixed(1)
    }));
    setMeasurements(newMeasurements);
    
    // Call Gemini (Mocked interaction)
    const report = await analyzeSiteProgress(currentStage, 'mock-base64');
    console.log("New Survey Report:", report);
    alert("Survey Complete! Topography updated with latest drone metrics.");
  };

  const handleRestockRequest = (itemId: string, amount: number) => {
    alert(`Reorder request sent to authorized vendor for item ID: ${itemId}`);
    // Optimistic update
    setInventory(prev => prev.map(item => 
        item.id === itemId 
        ? { ...item, quantity: item.quantity + amount } // Simulating instant approval for demo
        : item
    ));
  };
  
  const handleRegulatoryAsk = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!regulatoryQuery.trim()) return;
      setRegulatoryAnswer("Consulting Indian Construction Code Database...");
      const ans = await getRegulatoryAdvice(regulatoryQuery);
      setRegulatoryAnswer(ans);
  };

  const activeCamera = selectedCameraId 
    ? cameras.find(c => c.id === selectedCameraId) || null 
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Side Navigation (Main App Nav) */}
      <nav className="w-16 md:w-20 flex-shrink-0 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-50">
        <div className="mb-8 p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Activity className="text-white" size={24} />
        </div>
        
        <div className="flex flex-col gap-6 w-full items-center">
            <button 
                onClick={() => setActiveTab('dashboard')}
                title="Dashboard"
                className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutDashboard size={24} />
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                title="Inventory"
                className={`p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-slate-800 text-purple-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>
                <Package size={24} />
            </button>
            {/* Project Progress Button */}
            <button 
                onClick={() => setActiveTab('progress')}
                title="Project Progress & BOQ"
                className={`p-3 rounded-xl transition-all ${activeTab === 'progress' ? 'bg-slate-800 text-green-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>
                <ClipboardList size={24} />
            </button>

            <button className="p-3 rounded-xl text-slate-500 hover:text-slate-300 transition-all">
                <Settings size={24} />
            </button>
        </div>

        <div className="mt-auto mb-4">
            <button className="p-3 rounded-xl text-slate-500 hover:text-slate-300 transition-all">
                <UserCircle size={24} />
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-40">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold tracking-tight text-white hidden md:block">
                    ConstructAI <span className="text-slate-600 font-light mx-2">|</span> <span className="text-cyan-400">{currentStage} Phase</span>
                </h1>
                
                {/* Stage Selector (Quick) */}
                <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                    {STAGES.map((s, i) => (
                        i < 3 && ( // Just showing first few for brevity in header
                             <button 
                                key={s}
                                onClick={() => setCurrentStage(s)}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${currentStage === s ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                {s}
                            </button>
                        )
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-green-400">SYSTEM OPERATIONAL</span>
                </div>
            </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 relative overflow-hidden flex">
            {activeTab === 'dashboard' ? (
                <>
                    {/* 3D Viewport Area */}
                    <div className="flex-1 relative p-4 bg-slate-950">
                        <ThreeDViewer 
                            stage={currentStage} 
                            layers={layers}
                            activeCamera={activeCamera}
                            cameras={cameras}
                            onSelectCamera={setSelectedCameraId}
                            onCameraCapture={() => alert("Capturing site image for AI analysis...")}
                        />
                        
                        {/* Regulatory Chat Overlay (Bottom Left) */}
                        <div className="absolute bottom-6 left-6 w-96 z-30">
                            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                                <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                        <span className="text-orange-400">⚡</span> Regulatory Assistant
                                    </h3>
                                </div>
                                <div className="p-3 max-h-32 overflow-y-auto text-xs text-slate-400">
                                    {regulatoryAnswer || "Ask about Indian Construction Codes (e.g. 'Min foundation depth for sandy soil?')"}
                                </div>
                                <form onSubmit={handleRegulatoryAsk} className="p-2 border-t border-slate-700 bg-slate-900">
                                    <input 
                                        type="text" 
                                        value={regulatoryQuery}
                                        onChange={(e) => setRegulatoryQuery(e.target.value)}
                                        placeholder="Type query..."
                                        className="w-full bg-slate-800 border-none rounded text-xs px-2 py-1 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <Sidebar 
                        currentStage={currentStage}
                        measurements={measurements}
                        layers={layers}
                        layerMeta={layerMeta}
                        cameras={cameras}
                        selectedCameraId={selectedCameraId}
                        toggleLayer={toggleLayer}
                        onRunDroneSurvey={handleRunDroneSurvey}
                        onLayerUpload={handleLayerUpload}
                        onSelectCamera={setSelectedCameraId}
                    />
                </>
            ) : activeTab === 'inventory' ? (
                <div className="w-full h-full">
                    <InventoryPanel 
                        inventory={inventory} 
                        onRestockRequest={handleRestockRequest}
                    />
                </div>
            ) : (
                <div className="w-full h-full">
                    <ProgressPanel />
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;