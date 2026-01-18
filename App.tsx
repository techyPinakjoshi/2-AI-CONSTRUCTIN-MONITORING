
import React, { useState, useEffect } from 'react';
import { ProjectStage, CameraFeed, TaskLog, AiLogEntry, InventoryItem, SiteMeasurement, LayerVisibility, LayerMetadata, DataSourceType, TourSession, ViewMode } from './types';
import { INITIAL_INVENTORY, STAGES, MOCK_CAMERAS, INITIAL_TOUR_SESSIONS, MOCK_TASK_LOGS } from './constants';
import ThreeDViewer from './components/ThreeDViewer';
import Sidebar from './components/Sidebar';
import InventoryPanel from './components/InventoryPanel';
import ProgressPanel from './components/ProgressPanel';
import TourPlaybackModal from './components/TourPlaybackModal';
import MultiCameraModal from './components/MultiCameraModal';
import LandingChat from './components/LandingChat';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import BoqDashboard from './components/BoqDashboard';
import ProjectCreationModal from './components/ProjectCreationModal';
import { LayoutDashboard, Package, Activity, LogOut, ShieldCheck, ClipboardList, Briefcase, Zap, Crown, Plus } from 'lucide-react';
import { fetchUserProjects, saveProjectData } from './services/dbService';

type UserState = {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
};

type ViewState = 'landing' | 'monitoring-app' | 'boq-pm-suite' | 'admin';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<UserState>({ user: null, loading: false, isAdmin: false, isSubscribed: false });
  const [view, setView] = useState<ViewState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'progress'>('dashboard');
  const [currentStage, setCurrentStage] = useState<ProjectStage>(ProjectStage.EXCAVATION);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [cameras, setCameras] = useState<CameraFeed[]>(MOCK_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('ORBIT');
  const [savedTours, setSavedTours] = useState<TourSession[]>(INITIAL_TOUR_SESSIONS);
  const [playbackSession, setPlaybackSession] = useState<TourSession | null>(null);
  const [isMultiCameraModalOpen, setIsMultiCameraModalOpen] = useState(false);
  const [uploadedBimName, setUploadedBimName] = useState<string | null>(null);

  const [measurements, setMeasurements] = useState<SiteMeasurement[]>([
    { label: 'Total Area', value: '45,200', unit: 'sq.ft', delta: '+0%' },
    { label: 'Excavated Volume', value: '12,500', unit: 'cu.m', delta: '+12%' },
    { label: 'Max Depth', value: '8.4', unit: 'm', delta: '+0.5m' },
    { label: 'Soil Density', value: '1.85', unit: 'g/cc' },
  ]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(MOCK_TASK_LOGS);
  const [aiLogs, setAiLogs] = useState<AiLogEntry[]>([]);
  const [layers, setLayers] = useState<LayerVisibility>({
    structural: true, pipes: false, electrical: false, interiors: false, facade: false,
    excavationRed: true, excavationGreen: true, excavationBlue: true, bimSlice: false,
  });
  const [layerMeta, setLayerMeta] = useState<Record<keyof LayerVisibility, LayerMetadata>>({
    structural: { id: 'structural', hasData: false, source: null },
    pipes: { id: 'pipes', hasData: false, source: null },
    electrical: { id: 'electrical', hasData: false, source: null },
    interiors: { id: 'interiors', hasData: false, source: null },
    facade: { id: 'facade', hasData: false, source: null },
    excavationRed: { id: 'excavationRed', hasData: true, source: 'ConAI' },
    excavationGreen: { id: 'excavationGreen', hasData: true, source: 'MANUAL' },
    excavationBlue: { id: 'excavationBlue', hasData: true, source: 'MANUAL' },
    bimSlice: { id: 'bimSlice', hasData: true, source: 'BIM' },
  });

  const handleLoginSuccess = (user: any) => {
    const isAdmin = user.email === 'admin@constructai.com';
    setAuthState({ user, loading: false, isAdmin, isSubscribed: false });
    setShowAuth(false);
  };

  const handleLogout = () => {
    setAuthState({ user: null, loading: false, isAdmin: false, isSubscribed: false });
    setView('landing');
    setUploadedBimName(null);
    setActiveProject(null);
  };

  const startPremiumOnboarding = () => {
    if (!authState.user) {
      setShowAuth(true);
      return;
    }
    setShowProjectCreation(true);
  };

  const handleCreateProject = (projectData: any) => {
    const newProject = { ...projectData, id: Date.now().toString() };
    setUserProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    setAuthState(prev => ({ ...prev, isSubscribed: true }));
    setView('monitoring-app');
    setShowProjectCreation(false);
  };

  const handleRenameCamera = (id: string, newName: string) => {
    setCameras(prev => prev.map(cam => cam.id === id ? { ...cam, name: newName } : cam));
  };

  const toggleLayer = (key: keyof LayerVisibility) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  const handleLayerUpload = (key: keyof LayerVisibility, source: DataSourceType) => {
    setLayerMeta(prev => ({ ...prev, [key]: { ...prev[key], hasData: true, source } }));
    setLayers(prev => ({ ...prev, [key]: true }));
  };

  const activeCamera = selectedCameraId ? cameras.find(c => c.id === selectedCameraId) || null : null;

  if (view === 'landing') {
    return (
      <LandingChat 
        onAuthRequired={() => setShowAuth(true)} 
        onEnterApp={startPremiumOnboarding}
        onOpenBoqDashboard={() => setView('boq-pm-suite')}
        user={authState.user}
      >
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLoginSuccess} />}
        {showProjectCreation && <ProjectCreationModal onClose={() => setShowProjectCreation(false)} onCreate={handleCreateProject} />}
      </LandingChat>
    );
  }

  if (view === 'boq-pm-suite') {
    return <BoqDashboard onClose={() => setView('landing')} onUpgrade={startPremiumOnboarding} />;
  }

  if (view === 'admin' && authState.isAdmin) {
    return <AdminDashboard onClose={() => setView('monitoring-app')} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-200 font-sans">
      <nav className="w-16 md:w-20 flex-shrink-0 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 z-50">
        <div className="mb-8 p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Activity className="text-white" size={24} />
        </div>
        <div className="flex flex-col gap-6 w-full items-center">
            <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`} title="Main Twin"><LayoutDashboard size={24} /></button>
            <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-slate-800 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`} title="Inventory"><Package size={24} /></button>
            <button onClick={() => setActiveTab('progress')} className={`p-3 rounded-xl transition-all ${activeTab === 'progress' ? 'bg-slate-800 text-green-400' : 'text-slate-500 hover:text-slate-300'}`} title="Reports"><ClipboardList size={24} /></button>
            {authState.isAdmin && (
              <button onClick={() => setView('admin')} className="p-3 rounded-xl text-orange-400 hover:bg-slate-800" title="Admin"><ShieldCheck size={24} /></button>
            )}
        </div>
        <div className="mt-auto mb-4 flex flex-col gap-4 items-center">
            <button 
              onClick={() => setView('boq-pm-suite')} 
              className="p-3 rounded-xl text-slate-500 hover:text-orange-400 transition-all" 
              title="Return to PM Dashboard"
            >
              <Briefcase size={24} />
            </button>
            <button onClick={handleLogout} className="p-3 rounded-xl text-slate-500 hover:text-red-400 transition-all" title="Logout"><LogOut size={24} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-600">{authState.user?.email?.[0].toUpperCase()}</div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex-shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-40">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold tracking-tight text-white hidden md:block uppercase italic">
                  {activeProject?.name || "Premium Monitor"} 
                  <span className="text-slate-600 font-light mx-2">|</span> 
                  <span className="text-blue-400">
                    {currentStage} AI-Vision Active
                  </span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <Crown size={14} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest tracking-tighter">AI QUANTUM MONITORING</span>
                  </div>
            </div>
        </header>

        <main className="flex-1 relative overflow-hidden flex">
            {activeTab === 'dashboard' ? (
                <>
                    <div className="flex-1 relative p-4 bg-slate-950">
                        <ThreeDViewer 
                          stage={currentStage} layers={layers} activeCamera={activeCamera} cameras={cameras} 
                          viewMode={viewMode} onSelectCamera={setSelectedCameraId} onCameraCapture={() => {}} onSaveTour={() => {}} 
                          bimFileName={uploadedBimName}
                        />
                    </div>
                    <Sidebar 
                      currentStage={currentStage} measurements={measurements} layers={layers} layerMeta={layerMeta} cameras={cameras} selectedCameraId={selectedCameraId} viewMode={viewMode} savedTours={savedTours} 
                      onSetViewMode={setViewMode} toggleLayer={toggleLayer} onRunDroneSurvey={() => {}} onLayerUpload={handleLayerUpload} onSelectCamera={setSelectedCameraId} onPlayTour={setPlaybackSession} onDeleteTour={() => {}} onOpenMultiView={() => setIsMultiCameraModalOpen(true)} onAddCamera={() => {}} 
                      bimFileName={uploadedBimName} onBimFileSelect={setUploadedBimName}
                      isPremium={true}
                    />
                </>
            ) : activeTab === 'inventory' ? (
                <InventoryPanel inventory={inventory} onRestockRequest={() => {}} />
            ) : (
                <ProgressPanel taskLogs={taskLogs} aiLogs={aiLogs} isPremium={true} />
            )}
        </main>
      </div>
      {isMultiCameraModalOpen && <MultiCameraModal cameras={cameras} onClose={() => setIsMultiCameraModalOpen(false)} onSelectCamera={(id) => setSelectedCameraId(id)} onRenameCamera={handleRenameCamera} />}
      {playbackSession && <TourPlaybackModal session={playbackSession} onClose={() => setPlaybackSession(null)} />}
      {showProjectCreation && <ProjectCreationModal onClose={() => setShowProjectCreation(false)} onCreate={handleCreateProject} />}
    </div>
  );
};

export default App;
