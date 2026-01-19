
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectStage, CameraFeed, InventoryItem, TourSession, ViewMode, LayerVisibility, LayerMetadata, DataSourceType } from './types';
import { INITIAL_INVENTORY, MOCK_CAMERAS, INITIAL_TOUR_SESSIONS, MOCK_TASK_LOGS } from './constants';
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
import { LayoutDashboard, Package, Activity, LogOut, ShieldCheck, ClipboardList, Briefcase, Zap, Crown } from 'lucide-react';
import { fetchUserProjects, saveProjectData } from './services/dbService';
import { supabase } from './services/supabaseClient';

type UserState = {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
};

type ViewState = 'landing' | 'monitoring-app' | 'boq-pm-suite' | 'admin';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<UserState>({ user: null, loading: true, isAdmin: false, isSubscribed: false });
  const [view, setView] = useState<ViewState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'progress'>('dashboard');
  const [currentStage] = useState<ProjectStage>(ProjectStage.EXCAVATION);
  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [cameras, setCameras] = useState<CameraFeed[]>(MOCK_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('ORBIT');
  const [savedTours] = useState<TourSession[]>(INITIAL_TOUR_SESSIONS);
  const [playbackSession, setPlaybackSession] = useState<TourSession | null>(null);
  const [isMultiCameraModalOpen, setIsMultiCameraModalOpen] = useState(false);
  const [uploadedBimName, setUploadedBimName] = useState<string | null>(null);

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

  const handleLoginSuccess = useCallback(async (user: any) => {
    if (!user) return;
    
    // Stable Auth Update
    setAuthState(prev => {
        if (prev.user?.id === user.id) return prev;
        return { user, loading: false, isAdmin: user.email === 'admin@constructai.com', isSubscribed: false };
    });
    
    setShowAuth(false);
    try {
        const projects = await fetchUserProjects(user.id);
        setUserProjects(projects);
        if (projects.length > 0) {
          setAuthState(prev => ({ ...prev, isSubscribed: true }));
        }
    } catch (e) { console.error("Project fetch failed", e); }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, loading: false, isAdmin: false, isSubscribed: false });
    setView('landing');
    setUploadedBimName(null);
    setActiveProject(null);
    setUserProjects([]);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        if (session?.user) {
          handleLoginSuccess(session.user);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        handleLoginSuccess(session.user);
      } else if (_event === 'SIGNED_OUT') {
        handleLogout();
      }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, [handleLoginSuccess, handleLogout]);

  const startPremiumOnboarding = () => {
    if (!authState.user) {
      setShowAuth(true);
      return;
    }
    if (userProjects.length > 0 && !activeProject) {
        setActiveProject(userProjects[0]);
        setView('monitoring-app');
    } else {
        setShowProjectCreation(true);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    if (!authState.user) return;
    const result = await saveProjectData(authState.user.id, projectData);
    if (result.success) {
      const projects = await fetchUserProjects(authState.user.id);
      setUserProjects(projects);
      setActiveProject(projects[projects.length - 1]);
      setAuthState(prev => ({ ...prev, isSubscribed: true }));
      setView('monitoring-app');
      setShowProjectCreation(false);
    }
  };

  const toggleLayer = (key: keyof LayerVisibility) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  const handleLayerUpload = (key: keyof LayerVisibility, source: DataSourceType) => {
    setLayerMeta(prev => ({ ...prev, [key]: { ...prev[key], hasData: true, source } }));
    setLayers(prev => ({ ...prev, [key]: true }));
  };

  const activeCamera = selectedCameraId ? cameras.find(c => c.id === selectedCameraId) || null : null;

  if (authState.loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <Zap className="text-cyan-400 animate-pulse mb-4" size={48} />
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Establishing Neural Sync...</div>
      </div>
    );
  }

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
        <div className="mb-8 p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
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
            <button onClick={() => setView('boq-pm-suite')} className="p-3 rounded-xl text-slate-500 hover:text-orange-400 transition-all" title="Return to PM Dashboard"><Briefcase size={24} /></button>
            <button onClick={handleLogout} className="p-3 rounded-xl text-slate-500 hover:text-red-400 transition-all" title="Logout"><LogOut size={24} /></button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-600">{authState.user?.email?.[0].toUpperCase()}</div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex-shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-40">
            <h1 className="text-xl font-bold tracking-tight text-white hidden md:block uppercase italic">
              {activeProject?.name || "Premium Monitor"} 
              <span className="text-slate-600 font-light mx-2">|</span> 
              <span className="text-blue-400">{currentStage} AI-Vision Active</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Crown size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI QUANTUM MONITORING</span>
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
                      currentStage={currentStage} measurements={[]} layers={layers} layerMeta={layerMeta} cameras={cameras} selectedCameraId={selectedCameraId} viewMode={viewMode} savedTours={savedTours} 
                      onSetViewMode={setViewMode} toggleLayer={toggleLayer} onRunDroneSurvey={() => {}} onLayerUpload={handleLayerUpload} onSelectCamera={setSelectedCameraId} onPlayTour={setPlaybackSession} onDeleteTour={() => {}} onOpenMultiView={() => setIsMultiCameraModalOpen(true)} onAddCamera={() => {}} 
                      bimFileName={uploadedBimName} onBimFileSelect={setUploadedBimName}
                      isPremium={true}
                    />
                </>
            ) : activeTab === 'inventory' ? (
                <InventoryPanel inventory={inventory} onRestockRequest={() => {}} />
            ) : (
                <ProgressPanel taskLogs={MOCK_TASK_LOGS} aiLogs={[]} isPremium={true} />
            )}
        </main>
      </div>
      {isMultiCameraModalOpen && <MultiCameraModal cameras={cameras} onClose={() => setIsMultiCameraModalOpen(false)} onSelectCamera={(id) => setSelectedCameraId(id)} onRenameCamera={(id, name) => setCameras(prev => prev.map(c => c.id === id ? {...c, name} : c))} />}
      {playbackSession && <TourPlaybackModal session={playbackSession} onClose={() => setPlaybackSession(null)} />}
    </div>
  );
};

export default App;
