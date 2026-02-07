
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { ProjectStage, CameraFeed, InventoryItem, TourSession, ViewMode, LayerVisibility, LayerMetadata, DataSourceType, ProjectDocument } from './types';
import { INITIAL_INVENTORY, MOCK_CAMERAS, INITIAL_TOUR_SESSIONS, MOCK_TASK_LOGS, MOCK_DOCUMENTS } from './constants';
import ThreeDViewer from './components/ThreeDViewer';
import Sidebar from './components/Sidebar';
import InventoryPanel from './components/InventoryPanel';
import ProgressPanel from './components/ProgressPanel';
import TourPlaybackModal from './components/TourPlaybackModal';
import MultiCameraModal from './components/MultiCameraModal';
import LandingChat from './components/LandingChat';
import AuthModal from './components/AuthModal';
import ProjectDashboard from './components/BoqDashboard'; 
import BoqExtractor from './components/BoqExtractor';
import ProjectCreationModal from './components/ProjectCreationModal';
import BillingModal from './components/BillingModal';
import Tooltip from './components/Tooltip';
import IntegrationsPanel from './components/IntegrationsPanel';
import { LayoutDashboard, Package, Activity, LogOut, ShieldCheck, ClipboardList, Briefcase, Zap, Crown, Sun, Moon, Shield, RefreshCw, AlertCircle, FolderHeart, ChevronRight, Folder, X, PlusCircle, Share2 } from 'lucide-react';
import { fetchUserProjects, saveProjectData } from './services/dbService';
import { supabase } from './services/supabaseClient';

export const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });
export const ConnectionContext = createContext({ isCodeAppLinked: false, setCodeAppLink: (v: boolean) => {} });

const APP_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f172a'/%3E%3Cpath d='M20 45 Q50 15 80 45 L80 55 Q50 35 20 55 Z' fill='%23f97316'/%3E%3Crect x='30' y='55' width='40' height='30' rx='8' fill='white'/%3E%3Ccircle cx='40' cy='70' r='4' fill='%2306b6d4'/%3E%3Ccircle cx='60' cy='70' r='4' fill='%2306b6d4'/%3E%3Cpath d='M45 80 Q50 85 55 80' stroke='%230f172a' fill='none' stroke-width='2'/%3E%3C/svg%3E`;
const FALLBACK_LOGO = "./logo.png";

type UserState = { user: any | null; loading: boolean; isAdmin: boolean; isSubscribed: boolean; };
type ViewState = 'landing' | 'monitoring-app' | 'project-suite' | 'boq-extractor' | 'admin';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isCodeAppLinked, setIsCodeAppLinked] = useState(false);
  const [authState, setAuthState] = useState<UserState>({ user: null, loading: true, isAdmin: false, isSubscribed: false });
  const [view, setView] = useState<ViewState>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'progress' | 'integrations'>('dashboard');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('ORBIT');
  const [playbackSession, setPlaybackSession] = useState<TourSession | null>(null);
  const [isMultiCameraModalOpen, setIsMultiCameraModalOpen] = useState(false);
  const [uploadedBimName, setUploadedBimName] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [stagedBoqData, setStagedBoqData] = useState<{data: any[], files: string[]} | null>(null);
  const [showSavedProjects, setShowSavedProjects] = useState(false);

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
    excavationRed: { id: 'excavationRed', hasData: false, source: null },
    excavationGreen: { id: 'excavationGreen', hasData: false, source: null },
    excavationBlue: { id: 'excavationBlue', hasData: false, source: null },
    bimSlice: { id: 'bimSlice', hasData: false, source: null },
  });

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
      if (projects.length > 0) {
          setAuthState(prev => ({ ...prev, isSubscribed: true }));
          if (!activeProject) setActiveProject(projects[projects.length - 1]);
      }
    } catch (e) { 
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [activeProject]);

  const handleLogout = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    setAuthState({ user: null, loading: false, isAdmin: false, isSubscribed: false });
    setView('landing');
    setActiveProject(null);
    setUserProjects([]);
  }, []);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => { if (authState.loading) setConnectionError(true); }, 8000);
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await handleLoginSuccess(session.user);
        else setAuthState(prev => ({ ...prev, loading: false }));
      } catch (e) { setAuthState(prev => ({ ...prev, loading: false })); }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleLoginSuccess(session.user);
      else if (_event === 'SIGNED_OUT') handleLogout();
    });
    return () => { clearTimeout(loadingTimeout); subscription.unsubscribe(); };
  }, [handleLoginSuccess, handleLogout, authState.loading]);

  const startPremiumOnboarding = () => {
    if (activeProject) { setView('monitoring-app'); }
    else if (userProjects.length > 0) { 
      setActiveProject(userProjects[userProjects.length - 1]); 
      setView('monitoring-app'); 
    }
    else setShowProjectCreation(true);
  };

  const handleCreateProject = async (projectData: any) => {
    setShowProjectCreation(false);
    
    // Default to the dashboard orchestrator for new projects
    setView('project-suite');
    
    const tempId = `PROJ-TEMP-${Date.now()}`;
    const finalProjectData = {
      ...projectData,
      id: tempId,
      boq: stagedBoqData?.data || [],
      rfis: [],
      contracts: [],
      inventory: [],
      taskLogs: [],
      documents: []
    };
    
    setUserProjects(prev => [...prev, finalProjectData]);
    setActiveProject(finalProjectData);

    if (authState.user) {
      try {
        const result = await saveProjectData(authState.user.id, finalProjectData);
        if (result.success) {
          setStagedBoqData(null);
          setAuthState(prev => ({ ...prev, isSubscribed: true }));
          const projects = await fetchUserProjects(authState.user.id);
          setUserProjects(projects);
          if (activeProject?.id === tempId && projects.length > 0) {
            setActiveProject(projects[projects.length - 1]);
          }
        }
      } catch (error) {
        console.error("Background project sync failed:", error);
      }
    }
  };

  const handleUpgradeSuccess = () => { setAuthState(prev => ({ ...prev, isSubscribed: true })); setShowBilling(false); };

  const handleBoqSync = async (boqData: any[], sourceFiles: string[], targetProjectId?: string, mode?: 'append' | 'replace') => {
    if (targetProjectId) {
      const projectToUpdate = userProjects.find(p => p.id === targetProjectId);
      if (projectToUpdate) {
        const existingBoq = mode === 'append' ? (projectToUpdate.boq || []) : [];
        const updatedProject = { ...projectToUpdate, boq: [...existingBoq, ...boqData] };
        
        setUserProjects(prev => prev.map(p => p.id === targetProjectId ? updatedProject : p));
        setActiveProject(updatedProject);
        setView('project-suite');

        if (authState.user) {
          try {
            await saveProjectData(authState.user.id, updatedProject);
          } catch (e) {
            console.error("Boq Sync DB error:", e);
          }
        }
      }
    } else { 
      setStagedBoqData({ data: boqData, files: sourceFiles }); 
      setShowProjectCreation(true); 
    }
  };

  const switchProject = (project: any) => { 
    setActiveProject(project); 
    setShowSavedProjects(false); 
    setView('project-suite');
  };

  if (authState.loading) return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500 animate-pulse mb-6 bg-slate-900 p-2 flex items-center justify-center">
         <img src={FALLBACK_LOGO} alt="Loading" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
      </div>
      {!connectionError ? (
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Neural Handshake...</div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500 max-w-xs">
          <div className="flex items-center gap-2 justify-center text-amber-500 mb-2"><AlertCircle size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Network latency detected</span></div>
          <button onClick={() => setAuthState(prev => ({ ...prev, loading: false }))} className="px-6 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto"><RefreshCw size={12} /> Continue Offline</button>
        </div>
      )}
    </div>
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConnectionContext.Provider value={{ isCodeAppLinked, setCodeAppLink: setIsCodeAppLinked }}>
        <div className={`${isDark ? 'dark' : 'light'} h-screen w-full bg-white dark:bg-slate-950 overflow-hidden`}>
          {view === 'landing' && (
            <LandingChat 
              onAuthRequired={() => {}} // Disabled auth portal
              onEnterApp={startPremiumOnboarding} 
              onOpenBoqDashboard={() => setView('project-suite')} 
              onOpenBoqExtractor={() => setView('boq-extractor')} 
              user={authState.user} 
              isCodeAppLinked={isCodeAppLinked}
            />
          )}

          {view === 'boq-extractor' && <BoqExtractor onClose={() => setView('landing')} onSyncToSuite={handleBoqSync} userProjects={userProjects} />}
          {view === 'project-suite' && (
            <ProjectDashboard 
              activeProject={activeProject} 
              onClose={() => setView('landing')} 
              onCreateNew={() => setShowProjectCreation(true)}
            />
          )}

          {view === 'monitoring-app' && (
            <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-slate-950 transition-colors duration-500">
              <nav className="w-20 flex-shrink-0 flex flex-col items-center py-6 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-800 z-50">
                <Tooltip text="Master Entry" position="right">
                  <div className="mb-8 w-12 h-12 bg-slate-900 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform overflow-hidden border-2 border-cyan-500 flex items-center justify-center p-1" onClick={() => setView('landing')}>
                    <img src={FALLBACK_LOGO} alt="Brand" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
                  </div>
                </Tooltip>

                <div className="flex flex-col gap-8 items-center">
                  <TabIcon active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} tooltip="Site Monitor" />
                  <TabIcon active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24} />} tooltip="AI Inventory" />
                  <TabIcon active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={<ClipboardList size={24} />} tooltip="Execution Logs" />
                  <TabIcon active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<Share2 size={24} />} tooltip="Integrations" />
                  <TabIcon active={showSavedProjects} onClick={() => setShowSavedProjects(!showSavedProjects)} icon={<FolderHeart size={24} />} tooltip="Switch Projects" />
                </div>

                <div className="mt-auto mb-4 flex flex-col gap-6 items-center">
                  <TabIcon active={false} onClick={() => setShowProjectCreation(true)} icon={<PlusCircle size={24} className="text-cyan-500" />} tooltip="New Project" />
                  <Tooltip text="Management Suite" position="right"><button onClick={() => setView('project-suite')} className="p-4 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-950 hover:scale-110 transition-all shadow-xl shadow-cyan-600/10 active:scale-95 border border-white/10"><Shield size={24} /></button></Tooltip>
                  <Tooltip text="Billing" position="right"><button onClick={() => setShowBilling(true)} className="p-3 rounded-2xl text-yellow-500 hover:bg-yellow-500/10 transition-all"><Crown size={24} /></button></Tooltip>
                  <Tooltip text="Logout" position="right"><button className="p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-all" onClick={handleLogout}><LogOut size={24} /></button></Tooltip>
                  <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-black border border-zinc-300 dark:border-slate-700">{authState.user?.email?.[0].toUpperCase() || 'G'}</div>
                </div>
              </nav>

              <div className="flex-1 flex flex-col min-w-0">
                <header className="h-20 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between px-8 z-40">
                  <div className="flex items-center gap-4">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight truncate max-w-lg">
                      {activeProject?.name || "Neural Instance"} <span className="text-slate-400 mx-2 font-light">/</span> <span className="text-cyan-600 dark:text-cyan-400">{activeTab.toUpperCase()}</span>
                    </h1>
                    {isCodeAppLinked && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">IS-Code Linked</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setView('project-suite')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white border border-white/10 rounded-2xl text-white dark:text-slate-900 shadow-lg">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">ISO Compliance Suite</span>
                    </button>
                  </div>
                </header>

                <main className="flex-1 flex overflow-hidden relative">
                  {showSavedProjects && (
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-white/5 z-[60] animate-in slide-in-from-left duration-300 shadow-2xl flex flex-col">
                      <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center"><h3 className="text-sm font-black uppercase italic tracking-tighter">My Active Sites</h3><button onClick={() => setShowSavedProjects(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button></div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {userProjects.map(proj => (
                          <button key={proj.id} onClick={() => switchProject(proj)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${activeProject?.id === proj.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'bg-zinc-50 dark:bg-slate-800 border-zinc-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-zinc-100'}`}>
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><Folder size={18}/></div>
                            <div className="flex-1 overflow-hidden"><div className="text-xs font-black uppercase tracking-tight truncate">{proj.name}</div><div className="text-[9px] font-bold opacity-60 uppercase">{proj.template}</div></div>
                            <ChevronRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'dashboard' ? (
                    <>
                      <div className="flex-1 relative p-6 bg-zinc-100 dark:bg-slate-950">
                        <ThreeDViewer stage={ProjectStage.EXCAVATION} layers={layers} activeCamera={MOCK_CAMERAS.find(c => c.id === selectedCameraId) || null} cameras={MOCK_CAMERAS} viewMode={viewMode} onSelectCamera={setSelectedCameraId} onCameraCapture={() => {}} onSaveTour={() => {}} bimFileName={uploadedBimName} />
                      </div>
                      <Sidebar currentStage={ProjectStage.EXCAVATION} measurements={[]} layers={layers} layerMeta={layerMeta} cameras={MOCK_CAMERAS} selectedCameraId={selectedCameraId} viewMode={viewMode} savedTours={INITIAL_TOUR_SESSIONS} onSetViewMode={setViewMode} toggleLayer={(k) => setLayers(p => ({...p, [k]: !p[k]}))} onRunDroneSurvey={() => {}} onLayerUpload={(k, s) => { setLayerMeta(prev => ({ ...prev, [k]: { ...prev[k], hasData: true, source: s, lastSynced: new Date().toISOString() } })); setLayers(p => ({ ...p, [k]: true })); }} onSelectCamera={setSelectedCameraId} onPlayTour={setPlaybackSession} onDeleteTour={() => {}} onOpenMultiView={() => setIsMultiCameraModalOpen(true)} onAddCamera={() => {}} bimFileName={uploadedBimName} onBimFileSelect={setUploadedBimName} isPremium={authState.isSubscribed} />
                    </>
                  ) : activeTab === 'inventory' ? (
                    <InventoryPanel inventory={activeProject?.inventory || []} onRestockRequest={() => {}} />
                  ) : activeTab === 'progress' ? (
                    <ProgressPanel taskLogs={activeProject?.taskLogs || []} aiLogs={[]} isPremium={authState.isSubscribed} />
                  ) : (
                    <div className="flex-1 overflow-y-auto p-12 bg-zinc-50 dark:bg-slate-950">
                      <div className="max-w-4xl mx-auto">
                         <IntegrationsPanel onSyncComplete={(app) => { if(app === 'IS-CODE-APP') setIsCodeAppLinked(true); }} />
                      </div>
                    </div>
                  )}
                  {isMultiCameraModalOpen && <MultiCameraModal cameras={MOCK_CAMERAS} onClose={() => setIsMultiCameraModalOpen(false)} onSelectCamera={setSelectedCameraId} onRenameCamera={() => {}} />}
                  {playbackSession && <TourPlaybackModal session={playbackSession} onClose={() => setPlaybackSession(null)} />}
                </main>
              </div>
            </div>
          )}
          
          {/* Global Modals */}
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLoginSuccess} />}
          {showBilling && <BillingModal onClose={() => setShowBilling(false)} onSuccess={handleUpgradeSuccess} />}
          {showProjectCreation && <ProjectCreationModal onClose={() => setShowProjectCreation(false)} onCreate={handleCreateProject} isAuthenticated={true} onAuthRequired={() => {}} />}
        </div>
      </ConnectionContext.Provider>
    </ThemeContext.Provider>
  );
};

const TabIcon = ({ active, onClick, icon, tooltip }: any) => (
  <Tooltip text={tooltip} position="right">
    <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon}
    </button>
  </Tooltip>
);

export default App;
