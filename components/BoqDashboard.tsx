
import React, { useState, useContext, useRef, ChangeEvent, useMemo } from 'react';
import { 
  Calculator, X, Sun, Moon, FileUp, FileText, BarChart3, 
  UploadCloud, Plus, Loader2, Sparkles, Download, ArrowRight,
  LayoutDashboard, IndianRupee, ShieldCheck, Folder, HardDrive, 
  Search, Filter, ChevronRight, File, MoreVertical, CheckCircle2,
  Clock, AlertCircle, Briefcase, TrendingUp, Users, DollarSign,
  Grid, List, Layers, Shield, FileSpreadsheet, UserCheck, ShieldAlert,
  UserPlus, UserMinus, Key, Settings, MessageSquare, ClipboardCheck, Trello
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';
import { MOCK_DOCUMENTS, MOCK_FOLDERS, MOCK_RFIS, MOCK_VENDORS, MOCK_CONTRACTS, MOCK_SUBMITTALS } from '../constants';
import Tooltip from './Tooltip';
import { UserRole, ProjectDocument, WorkflowType } from '../types';

type DashboardTab = 'overview' | 'cde' | 'workflows' | 'procurement' | 'financials' | 'approvals' | 'team' | 'boq';
type WorkflowView = 'board' | 'list';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INVITED';
  joinedDate: string;
}

const ProjectSuite: React.FC<any> = ({ activeProject, onClose, onUpgrade }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview'); 
  const [activeWorkflowType, setActiveWorkflowType] = useState<WorkflowType>('RFI');
  const [workflowView, setWorkflowView] = useState<WorkflowView>('board');
  const [userRole, setUserRole] = useState<UserRole>('CHECKER'); 
  
  // File Upload Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Use real data from activeProject if available
  const docs = useMemo(() => {
    if (activeProject?.documents && activeProject.documents.length > 0) {
      return [...activeProject.documents, ...MOCK_DOCUMENTS];
    }
    return MOCK_DOCUMENTS;
  }, [activeProject]);

  const boqData = useMemo(() => activeProject?.boq || [], [activeProject]);

  const totalBoqValue = useMemo(() => {
    return boqData.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  }, [boqData]);

  const [team, setTeam] = useState<TeamMember[]>([
    { id: 'u1', name: 'Arjun Sharma', email: 'arjun.s@lnt.com', role: 'CHECKER', status: 'ACTIVE', joinedDate: '2023-10-01' },
    { id: 'u2', name: 'Rajesh K.', email: 'rajesh.k@contractor.in', role: 'MAKER', status: 'ACTIVE', joinedDate: '2023-11-15' },
    { id: 'u3', name: 'Sita Verma', email: 'sita.v@arch.com', role: 'VIEWER', status: 'ACTIVE', joinedDate: '2023-11-20' },
  ]);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('MAKER');

  const totalBudget = MOCK_CONTRACTS.reduce((acc, c) => acc + c.value, 0) + totalBoqValue;

  const handleApprove = (id: string) => {
    // Local state management for approvals if needed
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      // Logic handled in App.tsx via staged data if synced, 
      // but here we just simulate for immediate feedback
      setIsUploading(false);
    }, 1500);
  };

  const handleAddTeamMember = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `u-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setTeam(prev => [...prev, newMember]);
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {/* Universal Header */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl shadow-xl">
            <Shield className="text-white dark:text-slate-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">
              Project <span className="text-cyan-500">Suite</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">{activeProject?.name || 'ConstructAI Master Hub'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mr-4">
             <div className="flex items-center gap-2">
               <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{userRole} ACCESS</span>
             </div>
             <div className="w-px h-4 bg-emerald-500/20 mx-2"></div>
             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">ISO 19650 ACTIVE</span>
          </div>
          <Tooltip text="Switch Theme">
            <button onClick={toggleTheme} className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-2xl transition-all">
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </Tooltip>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-white/5 flex flex-col shrink-0">
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Coordination</h3>
              <nav className="space-y-1">
                <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<TrendingUp size={16}/>} label="Executive Overview" />
                <NavBtn active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')} icon={<Clock size={16}/>} label="Workflow Engine" />
                <NavBtn active={activeTab === 'cde'} onClick={() => setActiveTab('cde')} icon={<HardDrive size={16}/>} label="CDE / Documents" />
                <NavBtn active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} icon={<ShieldAlert size={16}/>} label="Approval Center" />
              </nav>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Site & Admin</h3>
              <nav className="space-y-1">
                <NavBtn active={activeTab === 'boq'} onClick={() => setActiveTab('boq')} icon={<Calculator size={16}/>} label="BOQ Ledger" />
                <NavBtn active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} icon={<DollarSign size={16}/>} label="Contract Ledger" />
                <NavBtn active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={16}/>} label="Team & Access" />
              </nav>
            </section>
          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-white/5">
            <button onClick={onUpgrade} className="w-full group bg-slate-900 dark:bg-white p-4 rounded-2xl text-white dark:text-slate-900 flex items-center justify-between shadow-xl transition-all hover:scale-[1.02] active:scale-95">
               <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Sync</span>
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-slate-950 p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-8">Executive Project Command</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Project Valuation" value={`₹${(totalBudget/100000).toFixed(1)}L`} sub="Extracted + MOCK" icon={<IndianRupee className="text-emerald-500"/>} />
                  <StatCard label="CDE Records" value={docs.length} sub="ISO 19650 Vaulted" icon={<HardDrive className="text-blue-500"/>} />
                  <StatCard label="Critical RFIs" value={MOCK_RFIS.filter(r => r.status === 'OPEN').length} sub="Pending Action" icon={<AlertCircle className="text-orange-500"/>} />
                  <StatCard label="BOQ Line Items" value={boqData.length || 'N/A'} sub="AI Extracted" icon={<Calculator className="text-purple-500"/>} />
                </div>
              </div>
            )}

            {activeTab === 'boq' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">BOQ Ledger</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Synced Quantities & AI Material Audit • Standard IS 1200</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700">
                         <Download size={14}/> Export IS-1200
                      </button>
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                         <Plus size={14}/> Import Items
                      </button>
                    </div>
                  </div>
                  
                  {boqData.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                        <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                            <th className="px-8 py-6">SOR Code & Item Description</th>
                            <th className="px-8 py-6">Category</th>
                            <th className="px-8 py-6 text-right">Quantity</th>
                            <th className="px-8 py-6 text-right">Rate</th>
                            <th className="px-8 py-6 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                          {boqData.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-amber-500/5 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.code || 'UNCODED'}</div>
                                <div className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-zinc-200 dark:border-white/5">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">{item.qty} <span className="text-[9px] text-slate-400 font-black">{item.unit}</span></td>
                              <td className="px-8 py-6 text-right font-mono text-xs text-slate-400">₹{item.rate?.toLocaleString()}</td>
                              <td className="px-8 py-6 text-right font-mono text-xs font-black text-amber-600">₹{item.amount?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-zinc-50 dark:bg-slate-950/50">
                          <tr>
                            <td colSpan={4} className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Base Quantities Valuation</td>
                            <td className="px-8 py-6 text-right text-lg font-black text-amber-500 italic">₹{totalBoqValue.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 text-center">
                       <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6">
                          <FileSpreadsheet size={32} />
                       </div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2">Quantities Repository Empty</h3>
                       <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto leading-relaxed italic">Use the "AI Quantities Extractor" from the landing page to populate this ledger with spatially verified project items.</p>
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'workflows' && (
              <div className="animate-in slide-in-from-left-4 duration-500 space-y-8 h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                   <div className="space-y-1">
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Workflow Command</h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Collaborative Coordination Engine • SLA Tracking Active</p>
                   </div>
                   <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                      <WorkflowTab active={activeWorkflowType === 'RFI'} onClick={() => setActiveWorkflowType('RFI')} icon={<MessageSquare size={14}/>} label="RFIs" count={MOCK_RFIS.length} />
                      <WorkflowTab active={activeWorkflowType === 'SUBMITTAL'} onClick={() => setActiveWorkflowType('SUBMITTAL')} icon={<FileUp size={14}/>} label="Submittals" count={MOCK_SUBMITTALS.length} />
                      <WorkflowTab active={activeWorkflowType === 'INSPECTION'} onClick={() => setActiveWorkflowType('INSPECTION')} icon={<ClipboardCheck size={14}/>} label="Inspections" count={0} />
                   </div>
                   <div className="flex gap-2">
                      <div className="flex bg-zinc-100 dark:bg-slate-800 rounded-xl p-1 border border-zinc-200 dark:border-white/5 mr-2">
                        <button onClick={() => setWorkflowView('board')} className={`p-2 rounded-lg transition-all ${workflowView === 'board' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400'}`}><Trello size={14}/></button>
                        <button onClick={() => setWorkflowView('list')} className={`p-2 rounded-lg transition-all ${workflowView === 'list' ? 'bg-white dark:bg-slate-700 text-cyan-500 shadow-sm' : 'text-slate-400'}`}><List size={14}/></button>
                      </div>
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                         <Plus size={14}/> Create New {activeWorkflowType}
                      </button>
                   </div>
                </div>

                {workflowView === 'board' ? (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[500px]">
                      {['OPEN', 'UNDER_REVIEW', 'CLOSED'].map(status => (
                         <div key={status} className="bg-zinc-100/50 dark:bg-slate-900/50 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col shadow-inner">
                            <div className="flex justify-between items-center mb-6 px-2">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{status.replace('_', ' ')}</h4>
                              <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-zinc-200 dark:border-white/5 shadow-sm">
                                {activeWorkflowType === 'RFI' ? MOCK_RFIS.filter(r => r.status === (status === 'UNDER_REVIEW' ? 'PENDING_APPROVAL' : status)).length : MOCK_SUBMITTALS.filter(s => s.status === status).length}
                              </span>
                            </div>
                            
                            <div className="space-y-4 overflow-y-auto pr-1 scrollbar-hide flex-1">
                               {activeWorkflowType === 'RFI' ? (
                                 MOCK_RFIS.filter(r => r.status === (status === 'UNDER_REVIEW' ? 'PENDING_APPROVAL' : status)).map(rfi => (
                                    <WorkflowCard key={rfi.id} title={rfi.title} id={rfi.id} priority={rfi.priority} assignee={rfi.assignedTo} dueDate={rfi.dueDate} />
                                 ))
                               ) : (
                                 MOCK_SUBMITTALS.filter(s => s.status === status).map(sub => (
                                    <WorkflowCard key={sub.id} title={sub.title} id={sub.id} priority={sub.priority} assignee={sub.assignedTo} dueDate={sub.dueDate} meta={sub.specSection} />
                                 ))
                               )}

                               {((activeWorkflowType === 'RFI' && MOCK_RFIS.filter(r => r.status === (status === 'UNDER_REVIEW' ? 'PENDING_APPROVAL' : status)).length === 0) || 
                                 (activeWorkflowType === 'SUBMITTAL' && MOCK_SUBMITTALS.filter(s => s.status === status).length === 0)) && (
                                 <div className="py-20 flex flex-col items-center justify-center opacity-10 italic">
                                    <CheckCircle2 size={32} />
                                    <span className="text-[9px] font-black uppercase mt-2">No Items</span>
                                 </div>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                         <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                               <th className="px-8 py-5">Reference & Title</th>
                               <th className="px-8 py-5">Status</th>
                               <th className="px-8 py-5">Assignee</th>
                               <th className="px-8 py-5">SLA Due Date</th>
                               <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {(activeWorkflowType === 'RFI' ? MOCK_RFIS : MOCK_SUBMITTALS).map((item: any) => (
                               <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><FileText size={18}/></div>
                                        <div>
                                           <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.id}</div>
                                           <div className="text-[10px] text-slate-500 font-bold mt-0.5 truncate max-w-[300px]">{item.title}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-600 uppercase tracking-widest rounded-full">{item.status.replace('_', ' ')}</span>
                                  </td>
                                  <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{item.assignedTo}</td>
                                  <td className="px-8 py-5 text-xs font-mono text-slate-500">{item.dueDate}</td>
                                  <td className="px-8 py-5 text-right">
                                     <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ChevronRight size={18}/></button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cde' && (
              <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-[calc(100vh-14rem)] bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20"><HardDrive size={20}/></div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Common Data Environment</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ISO 19650 Project Vault</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={triggerUpload} disabled={isUploading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16}/>} 
                      {isUploading ? 'Syncing...' : 'Upload Asset'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  <aside className="w-72 border-r border-zinc-100 dark:border-white/5 p-6 overflow-y-auto space-y-6">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2 italic">Standard Folders</h4>
                      <div className="space-y-1">
                        {MOCK_FOLDERS.map(f => (
                          <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-slate-600 dark:text-slate-400 transition-all group">
                            <Folder size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <span className="text-xs font-black uppercase tracking-tight">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </aside>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                        <tr>
                          <th className="px-8 py-5">Metadata</th>
                          <th className="px-8 py-5">ISO Status</th>
                          <th className="px-8 py-5">Approval</th>
                          <th className="px-8 py-5">Modified</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {docs.map((doc: any) => (
                          <tr key={doc.id} className="hover:bg-blue-600/5 transition-colors group cursor-pointer">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                  {doc.extension === 'PDF' ? <FileText size={18}/> : <File size={18}/>}
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight">{doc.name}.{doc.extension}</div>
                                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Maker: {doc.author} • {doc.size}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                               <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-600 uppercase tracking-widest w-fit shadow-sm rounded-full">
                                 {doc.status}
                               </span>
                            </td>
                            <td className="px-8 py-5">
                               <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit shadow-sm border ${
                                 doc.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                 doc.approvalStatus === 'PENDING_REVIEW' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                               }`}>
                                 {doc.approvalStatus.replace('_', ' ')}
                               </div>
                            </td>
                            <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.lastModified}</td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  {doc.approvalStatus === 'PENDING_REVIEW' && userRole === 'CHECKER' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleApprove(doc.id); }} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg"><CheckCircle2 size={16}/></button>
                                  )}
                                  <button className="p-2 text-slate-400 hover:text-blue-600"><Download size={16}/></button>
                                  <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><MoreVertical size={16}/></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="animate-in slide-in-from-left-4 duration-500 space-y-8">
                 <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Approval Center</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">ISO 19650 Compliance Workflows (Checker Module)</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {docs.filter((d: any) => d.approvalStatus === 'PENDING_REVIEW').length > 0 ? (
                      docs.filter((d: any) => d.approvalStatus === 'PENDING_REVIEW').map((doc: any) => (
                        <div key={doc.id} className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm group hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                               <div className="p-5 bg-amber-500/10 rounded-3xl text-amber-500">
                                  <FileText size={28} />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-none">{doc.name}.{doc.extension}</h4>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">RAISED BY MAKER: {doc.author} • {doc.lastModified}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <button className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all" onClick={() => handleApprove(doc.id)}>Publish (S2)</button>
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-32 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-zinc-200 dark:border-white/10 rounded-[4rem] text-slate-400 opacity-50">
                          <CheckCircle2 size={64} className="mb-4 text-emerald-500/50" />
                          <h3 className="text-lg font-black uppercase italic tracking-widest">Workflow Clear</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest mt-1">No pending audits for your role</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="animate-in fade-in duration-500 space-y-10">
                <div className="bg-slate-900 dark:bg-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-4xl font-black text-white dark:text-slate-950 uppercase italic tracking-tighter leading-none">Access Control</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest italic">Maker/Checker Hierarchy for ISO Governance</p>
                    </div>
                    <div className="mt-8 md:mt-0 relative z-10">
                       <button className="px-10 py-5 bg-cyan-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all italic">Add Key Partner</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   {/* Invite Section */}
                   <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-10 rounded-[3rem] shadow-sm">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-8">Invite Workforce</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                           <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@lnt.com" className="w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 px-6 text-sm text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {['MAKER', 'CHECKER'].map((r) => (
                             <button key={r} onClick={() => setInviteRole(r as any)} className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${inviteRole === r ? 'bg-cyan-500 text-white border-cyan-500 shadow-xl' : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 text-slate-500'}`}>{r === 'MAKER' ? 'Maker' : 'Checker'}</button>
                           ))}
                        </div>
                        <button onClick={handleAddTeamMember} className="w-full bg-slate-900 dark:bg-white py-5 rounded-[1.5rem] text-white dark:text-slate-900 font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><UserPlus size={18} /> Send Access Key</button>
                      </div>
                   </div>

                   {/* Team List Section */}
                   <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-10 rounded-[3rem] shadow-sm">
                      <div className="flex justify-between items-center mb-8 px-2">
                         <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Active Workforce</h3>
                         <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full"><ShieldCheck size={12} className="text-emerald-500" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secured</span></div>
                      </div>
                      <div className="space-y-4">
                        {team.map((member) => (
                          <div key={member.id} className="p-6 bg-zinc-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-between border border-transparent hover:border-cyan-500/20 transition-all group">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-sm">{member.name[0]}</div>
                                <div>
                                   <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic leading-none">{member.name}</div>
                                   <div className="text-[10px] text-slate-400 font-bold mt-1.5">{member.email}</div>
                                </div>
                             </div>
                             <div className="flex items-center gap-10">
                                <div className="text-right">
                                   <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${member.role === 'CHECKER' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400'}`}>{member.role}</div>
                                   <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-2">{member.status} • JOINED {member.joinedDate}</div>
                                </div>
                                <button className="p-3 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><UserMinus size={18} /></button>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-tight transition-all border ${active ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 shadow-xl' : 'text-slate-400 border-transparent hover:bg-zinc-100 dark:hover:bg-white/5'}`}
  >
    <div className={`shrink-0 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</div>
    {label}
  </button>
);

const WorkflowTab = ({ active, onClick, icon, label, count }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${active ? 'bg-white/20' : 'bg-zinc-100 dark:bg-slate-800'}`}>{count}</span>
  </button>
);

const WorkflowCard = ({ title, id, priority, assignee, dueDate, meta }: any) => (
  <div className="p-6 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/10 rounded-3xl hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-xl">
    <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{id}</span>
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
          {priority}
        </div>
    </div>
    <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-blue-600 transition-colors mb-4 leading-tight">{title}</div>
    {meta && <div className="text-[9px] font-bold text-slate-400 uppercase mb-4 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">{meta}</div>}
    
    <div className="flex justify-between items-center pt-4 border-t border-zinc-50 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500">{assignee[0]}</div>
          <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[80px]">{assignee}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <Clock size={10} className="text-blue-500"/> {dueDate.split('-').slice(1).join('/')}
        </div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[3rem] shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all cursor-default group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl shadow-inner border border-zinc-100 dark:border-white/5 group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div>
      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 italic leading-none">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{sub}</div>
    </div>
  </div>
);

export default ProjectSuite;
