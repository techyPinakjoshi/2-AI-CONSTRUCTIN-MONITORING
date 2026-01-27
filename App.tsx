
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
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
import ProjectSuite from './components/BoqDashboard'; 
import BoqExtractor from './components/BoqExtractor';
import ProjectCreationModal from './components/ProjectCreationModal';
import BillingModal from './components/BillingModal';
import Tooltip from './components/Tooltip';
import { LayoutDashboard, Package, Activity, LogOut, ShieldCheck, ClipboardList, Briefcase, Zap, Crown, Sun, Moon, Shield } from 'lucide-react';
import { fetchUserProjects, saveProjectData } from './services/dbService';
import { supabase } from './services/supabaseClient';

// Theme Context
export const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

// Brand logo constant
const APP_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f172a'/%3E%3Cpath d='M20 45 Q50 15 80 45 L80 55 Q50 35 20 55 Z' fill='%23f97316'/%3E%3Crect x='30' y='55' width='40' height='30' rx='8' fill='white'/%3E%3Ccircle cx='40' cy='70' r='4' fill='%2306b6d4'/%3E%3Ccircle cx='60' cy='70' r='4' fill='%2306b6d4'/%3E%3Cpath d='M45 80 Q50 85 55 80' stroke='%230f172a' fill='none' stroke-width='2'/%3E%3C/svg%3E`;
const FALLBACK_LOGO = "./logo.png";

type UserState = { user: any | null; loading: boolean; isAdmin: boolean; isSubscribed: boolean; };
type ViewState = 'landing' | 'monitoring-app' | 'project-suite' | 'boq-extractor' | 'admin';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [authState, setAuthState] = useState<UserState>({ user: null, loading: true, isAdmin: false, isSubscribed: false });
  const [view, setView] = useState<ViewState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'progress'>('dashboard');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('ORBIT');
  const [playbackSession, setPlaybackSession] = useState<TourSession | null>(null);
  const [isMultiCameraModalOpen, setIsMultiCameraModalOpen] = useState(false);
  const [uploadedBimName, setUploadedBimName] = useState<string | null>(null);

  const [layers, setLayers] = useState<LayerVisibility>({
    structural: true, pipes: false, electrical: false, interiors: false, facade: false,
    excavationRed: true, excavationGreen: true, excavationBlue: true, bimSlice: false,
  });

  // Theme Logic
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLoginSuccess = useCallback(async (user: any) => {
    if (!user) return;
    setAuthState(prev => ({ ...prev, user, loading: false, isAdmin: user.email === 'admin@constructai.com' }));
    setShowAuth(false);
    try {
      const projects = await fetchUserProjects(user.id);
      setUserProjects(projects);
      if (projects.length > 0) setAuthState(prev => ({ ...prev, isSubscribed: true }));
    } catch (e) { console.error(e); }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, loading: false, isAdmin: false, isSubscribed: false });
    setView('landing');
    setActiveProject(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) handleLoginSuccess(session.user);
      else setAuthState(prev => ({ ...prev, loading: false }));
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleLoginSuccess(session.user);
      else if (_event === 'SIGNED_OUT') handleLogout();
    });
    return () => subscription.unsubscribe();
  }, [handleLoginSuccess, handleLogout]);

  const startPremiumOnboarding = () => {
    if (!authState.user) { setShowAuth(true); return; }
    if (userProjects.length > 0) { setActiveProject(userProjects[0]); setView('monitoring-app'); }
    else setShowProjectCreation(true);
  };

  const handleCreateProject = async (projectData: any) => {
    if (!authState.user) return;
    const result = await saveProjectData(authState.user.id, projectData);
    if (result.success) {
      const projects = await fetchUserProjects(authState.user.id);
      setUserProjects(projects);
      const newProject = projects[projects.length - 1];
      setActiveProject(newProject);
      
      if (projectData.defaultLayers) {
        setLayers(prev => ({ ...prev, ...projectData.defaultLayers }));
      }

      setAuthState(prev => ({ ...prev, isSubscribed: true }));
      setView('monitoring-app');
      setShowProjectCreation(false);
    }
  };

  const handleUpgradeSuccess = () => {
    setAuthState(prev => ({ ...prev, isSubscribed: true }));
    setShowBilling(false);
  };

  const handleBoqSync = (boqData: any) => {
    // Logic to save BOQ to active project in DB
    console.log("Syncing BOQ to Project Suite:", boqData);
    setView('project-suite');
    // Here we could trigger a toast or notification
  };

  if (authState.loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500 animate-pulse mb-6 bg-slate-900 p-2 flex items-center justify-center">
         <img src={FALLBACK_LOGO} alt="Loading" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
      </div>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Handshake...</div>
    </div>
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`${isDark ? 'dark' : 'light'} h-screen w-full bg-white dark:bg-slate-950 overflow-hidden`}>
        {view === 'landing' && (
          <LandingChat 
            onAuthRequired={() => setShowAuth(true)} 
            onEnterApp={startPremiumOnboarding}
            onOpenBoqDashboard={() => setView('project-suite')}
            onOpenBoqExtractor={() => setView('boq-extractor')}
            user={authState.user}
          >
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLoginSuccess} />}
            {showProjectCreation && <ProjectCreationModal onClose={() => setShowProjectCreation(false)} onCreate={handleCreateProject} />}
          </LandingChat>
        )}

        {view === 'boq-extractor' && (
          <BoqExtractor onClose={() => setView('landing')} onSyncToSuite={handleBoqSync} />
        )}

        {view === 'project-suite' && <ProjectSuite onClose={() => setView('landing')} onUpgrade={startPremiumOnboarding} />}

        {view === 'monitoring-app' && (
          <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-slate-950 transition-colors duration-500">
            <nav className="w-20 flex-shrink-0 flex flex-col items-center py-6 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-800 z-50">
              <Tooltip text="Master Entry" position="right">
                <div className="mb-8 w-12 h-12 bg-slate-900 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform overflow-hidden border-2 border-cyan-500 flex items-center justify-center p-1" onClick={() => setView('landing')}>
                  <img src={FALLBACK_LOGO} alt="Brand" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
                </div>
              </Tooltip>

              <div className="flex flex-col gap-8 items-center">
                <Tooltip text="Site Monitor" position="right">
                  <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600'}`}><LayoutDashboard size={24} /></button>
                </Tooltip>
                
                <Tooltip text="AI Inventory" position="right">
                  <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}><Package size={24} /></button>
                </Tooltip>
                
                <Tooltip text="Execution Logs" position="right">
                  <button onClick={() => setActiveTab('progress')} className={`p-3 rounded-2xl transition-all ${activeTab === 'progress' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600'}`}><ClipboardList size={24} /></button>
                </Tooltip>
              </div>

              <div className="mt-auto mb-4 flex flex-col gap-6 items-center">
                <Tooltip text="Management Suite" position="right">
                  <button onClick={() => setView('project-suite')} className="p-4 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-950 hover:scale-110 transition-all shadow-xl shadow-cyan-600/10 active:scale-95 border border-white/10"><Shield size={24} /></button>
                </Tooltip>
                
                <Tooltip text="Billing" position="right">
                  <button onClick={() => setShowBilling(true)} className="p-3 rounded-2xl text-yellow-500 hover:bg-yellow-500/10 transition-all"><Crown size={24} /></button>
                </Tooltip>

                <Tooltip text="Logout" position="right">
                  <button onClick={handleLogout} className="p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><LogOut size={24} /></button>
                </Tooltip>
                
                <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black border border-zinc-300 dark:border-slate-700">{authState.user?.email?.[0].toUpperCase()}</div>
              </div>
            </nav>

            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-20 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between px-8 z-40">
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                  {activeProject?.name || "ConstructAI"} <span className="text-slate-400 mx-2 font-light">/</span> <span className="text-cyan-600 dark:text-cyan-400">Vision Core</span>
                </h1>
                <div className="flex items-center gap-4">
                  <Tooltip text="Project Suite Sync">
                    <button onClick={() => setView('project-suite')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white border border-white/10 rounded-2xl text-white dark:text-slate-900">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Management Suite</span>
                    </button>
                  </Tooltip>
                </div>
              </header>

              <main className="flex-1 flex overflow-hidden">
                {activeTab === 'dashboard' ? (
                  <>
                    <div className="flex-1 relative p-6 bg-zinc-100 dark:bg-slate-950">
                      <ThreeDViewer 
                        stage={ProjectStage.EXCAVATION} layers={layers} activeCamera={MOCK_CAMERAS.find(c => c.id === selectedCameraId) || null} 
                        cameras={MOCK_CAMERAS} viewMode={viewMode} onSelectCamera={setSelectedCameraId} onCameraCapture={() => {}} onSaveTour={() => {}} bimFileName={uploadedBimName}
                      />
                    </div>
                    <Sidebar 
                      currentStage={ProjectStage.EXCAVATION} measurements={[]} layers={layers} layerMeta={{}} cameras={MOCK_CAMERAS} 
                      selectedCameraId={selectedCameraId} viewMode={viewMode} savedTours={INITIAL_TOUR_SESSIONS} onSetViewMode={setViewMode} 
                      toggleLayer={(k) => setLayers(p => ({...p, [k]: !p[k]}))} onRunDroneSurvey={() => {}} onLayerUpload={() => {}} 
                      onSelectCamera={setSelectedCameraId} onPlayTour={setPlaybackSession} onDeleteTour={() => {}} onOpenMultiView={() => setIsMultiCameraModalOpen(true)} onAddCamera={() => {}} 
                      bimFileName={uploadedBimName} onBimFileSelect={setUploadedBimName} isPremium={authState.isSubscribed}
                    />
                  </>
                ) : activeTab === 'inventory' ? (
                  <InventoryPanel inventory={INITIAL_INVENTORY} onRestockRequest={() => {}} />
                ) : (
                  <ProgressPanel taskLogs={MOCK_TASK_LOGS} aiLogs={[]} isPremium={authState.isSubscribed} />
                )}
              </main>
            </div>
            {isMultiCameraModalOpen && <MultiCameraModal cameras={MOCK_CAMERAS} onClose={() => setIsMultiCameraModalOpen(false)} onSelectCamera={setSelectedCameraId} onRenameCamera={() => {}} />}
            {playbackSession && <TourPlaybackModal session={playbackSession} onClose={() => setPlaybackSession(null)} />}
            {showBilling && <BillingModal onClose={() => setShowBilling(false)} onSuccess={handleUpgradeSuccess} />}
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
