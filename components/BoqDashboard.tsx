
import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  Calculator, X, Sun, Moon, FileText, UploadCloud, Plus, Loader2, 
  LayoutDashboard, ShieldCheck, Folder, HardDrive, ChevronRight, CheckCircle2,
  Clock, AlertCircle, TrendingUp, Users, DollarSign, Share2, ShieldAlert,
  ArrowRight, Activity, Zap, Shield, Search, Link2, Ruler, MessageSquare, 
  History, GanttChart as GanttIcon, Database, Camera, Image as ImageIcon, 
  Check, Trash2, CameraOff, Play, Eye, FileSpreadsheet, MoreVertical, 
  Download, Settings, Fuel, Gauge, Construction, FileType, Printer, 
  ArrowUpRight, ArrowDownLeft, FileOutput
} from 'lucide-react';
import { ThemeContext } from '../App';
import Tooltip from './Tooltip';
import { generateDailyReport } from '../services/geminiService';

type DashboardTab = 'overview' | 'plans' | 'inventory' | 'timeline' | 'boq' | 'gallery' | 'reports';

interface Task {
  id: string;
  name: string;
  start: number;
  end: number;
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REMAINING';
}

interface Machine {
  id: string;
  name: string;
  stage: string;
  condition: 'ACTIVE' | 'IDLE' | 'NON-USE';
  fuelCons: string;
  health: string;
}

interface MaterialTransaction {
  id: string;
  name: string;
  qty: number;
  unit: string;
  type: 'INWARD' | 'OUTWARD';
  timestamp: string;
}

interface MediaRemark {
  text: string;
  timestamp: string;
  author: string;
  qty?: number;
  unit?: string;
}

interface SiteMedia {
  id: string;
  url: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: string;
  remarks: MediaRemark[];
}

interface DailyReport {
  id: string;
  date: string;
  content: string;
  status: 'DRAFT' | 'FINALIZED';
}

const ProjectDashboard: React.FC<any> = ({ activeProject, onClose, onCreateNew }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [userRole, setUserRole] = useState<'MAKER' | 'CHECKER'>('MAKER');

  // Dynamic State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [machineries, setMachineries] = useState<Machine[]>([]);
  const [inventory, setInventory] = useState<MaterialTransaction[]>([]);
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);

  if (!activeProject) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="p-10 bg-slate-900 dark:bg-white rounded-[3rem] shadow-2xl inline-block">
            <Shield size={64} className="text-white dark:text-slate-900" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">No Project Hub Active</h2>
          <button onClick={onCreateNew} className="px-12 py-5 bg-cyan-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 italic transition-all hover:scale-105 active:scale-95">
             <Plus size={24} /> Create New Instance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden text-slate-900 dark:text-slate-100">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl shadow-xl">
            <Shield className="text-white dark:text-slate-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase italic leading-none">
              Project <span className="text-cyan-500">Orchestrator</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeProject.name} • {userRole} MODE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-100 dark:bg-slate-800 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
            <button 
              onClick={() => setUserRole('MAKER')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${userRole === 'MAKER' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600' : 'text-slate-400'}`}
            >
              Maker
            </button>
            <button 
              onClick={() => setUserRole('CHECKER')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${userRole === 'CHECKER' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              Checker
            </button>
          </div>
          <button onClick={toggleTheme} className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-2xl transition-all border border-zinc-200 dark:border-white/5">
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
          </button>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-white/5 flex flex-col shrink-0">
          <div className="p-6 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Site Management</h3>
              <nav className="space-y-1">
                <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
                <NavBtn active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<Folder size={18}/>} label="Plans & Files" />
                <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Database size={18}/>} label="Inventory DB" />
              </nav>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Progress & Evidence</h3>
              <nav className="space-y-1">
                <NavBtn active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<GanttIcon size={18}/>} label="Gantt Timeline" />
                <NavBtn active={activeTab === 'boq'} onClick={() => setActiveTab('boq')} icon={<Calculator size={18}/>} label="BOQ / Tender" />
                <NavBtn active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<Camera size={18}/>} label="Site Gallery" count={media.length} />
              </nav>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Governance</h3>
              <nav className="space-y-1">
                <NavBtn active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileSpreadsheet size={18}/>} label="Daily Reports" count={reports.length} />
              </nav>
            </section>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-zinc-50/50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            {activeTab === 'overview' && <OverviewTab tasks={tasks} media={media} />}
            {activeTab === 'plans' && <PlansTab />}
            {activeTab === 'inventory' && <InventoryTab inventory={inventory} setInventory={setInventory} machineries={machineries} setMachineries={setMachineries} role={userRole} />}
            {activeTab === 'timeline' && <TimelineTab tasks={tasks} setTasks={setTasks} role={userRole} />}
            {activeTab === 'boq' && <BoqTab items={boqItems} setItems={setBoqItems} role={userRole} />}
            {activeTab === 'gallery' && <GalleryTab media={media} setMedia={setMedia} role={userRole} />}
            {activeTab === 'reports' && <ReportsTab activeProject={activeProject} media={media} machineries={machineries} reports={reports} setReports={setReports} />}
          </div>
        </main>
      </div>
    </div>
  );
};

/* Tabs Content Components */

const OverviewTab = ({ tasks, media }: any) => {
  const completedCount = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Project Status</h2>
          <p className="text-slate-500 font-medium italic mt-2">Aggregated site metrics and real-time vision sync.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Overall Progress" value={`${progress}%`} sub={`${tasks.length} Tasks Tracked`} icon={<Clock className="text-cyan-500"/>} />
        <StatCard label="WBS Health" value={tasks.length > 0 ? 'ACTIVE' : 'IDLE'} sub="Schedule State" icon={<GanttIcon className="text-orange-500"/>} />
        <StatCard label="Live Evidence" value={media.length} sub="Captures Logged" icon={<Camera className="text-indigo-500"/>} />
        <StatCard label="Site Safety" value="VERIFIED" sub="IS-Code Compliant" icon={<ShieldCheck className="text-emerald-500"/>} />
      </div>
    </div>
  );
};

const PlansTab = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter">CDE Repository</h2>
      <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
        <UploadCloud size={16}/> Upload New Plan
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <FolderCard name="Structural" count={0} icon={<Folder className="text-cyan-500"/>} />
      <FolderCard name="Architectural" count={0} icon={<Folder className="text-indigo-500"/>} />
      <FolderCard name="MEP" count={0} icon={<Folder className="text-orange-500"/>} />
      <FolderCard name="Site Reports" count={0} icon={<Folder className="text-emerald-500"/>} />
    </div>
  </div>
);

const InventoryTab = ({ inventory, setInventory, machineries, setMachineries, role }: any) => {
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddMachine, setShowAddMachine] = useState(false);
  
  // Forms
  const [matName, setMatName] = useState('');
  const [matQty, setMatQty] = useState<number>(0);
  const [matUnit, setMatUnit] = useState('Bags');
  const [matType, setMatType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  
  const [macName, setMacName] = useState('');
  const [macStage, setMacStage] = useState('');
  const [macCond, setMacCond] = useState<'ACTIVE' | 'IDLE' | 'NON-USE'>('IDLE');
  const [macFuel, setMacFuel] = useState('0L/hr');

  const addMaterial = () => {
    if (!matName) return;
    const newEntry: MaterialTransaction = {
      id: `MAT-${Date.now()}`,
      name: matName,
      qty: matQty,
      unit: matUnit,
      type: matType,
      timestamp: new Date().toISOString()
    };
    setInventory([newEntry, ...inventory]);
    setShowAddMaterial(false);
    setMatName(''); setMatQty(0);
  };

  const addMachine = () => {
    if (!macName) return;
    const newMachine: Machine = {
      id: `MCH-${Date.now()}`,
      name: macName,
      stage: macStage || 'Unassigned',
      condition: macCond,
      fuelCons: macFuel,
      health: 'Good'
    };
    setMachineries([...machineries, newMachine]);
    setShowAddMachine(false);
    setMacName(''); setMacStage('');
  };

  const exportInventory = () => {
    const headers = "Date,Time,Material,Qty,Unit,Type\n";
    const rows = inventory.map(item => 
      `${new Date(item.timestamp).toLocaleDateString()},${new Date(item.timestamp).toLocaleTimeString()},${item.name},${item.qty},${item.unit},${item.type}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Inventory_Report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const exportMachinery = () => {
    const headers = "Machine,Stage,Condition,Fuel Consumption\n";
    const rows = machineries.map(m => `${m.name},${m.stage},${m.condition},${m.fuelCons}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Machinery_Status_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Material Timeline</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Inward & Outward Movements</p>
          </div>
          <div className="flex gap-3">
             <button onClick={exportInventory} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-zinc-200 dark:border-white/5">
                <FileOutput size={16}/> Export Ledger
             </button>
             {role === 'MAKER' && (
               <button onClick={() => setShowAddMaterial(!showAddMaterial)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                {showAddMaterial ? <X size={16}/> : <Plus size={16}/>} Log Transaction
               </button>
             )}
          </div>
        </div>

        {showAddMaterial && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-emerald-500/30 shadow-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top-4">
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Material Name</label>
                <input value={matName} onChange={e => setMatName(e.target.value)} placeholder="e.g. Cement Bags" className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Qty</label>
                <input type="number" value={matQty} onChange={e => setMatQty(parseFloat(e.target.value))} className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Unit</label>
                <input value={matUnit} onChange={e => setMatUnit(e.target.value)} placeholder="Bags, Cum..." className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Type</label>
                <select value={matType} onChange={e => setMatType(e.target.value as any)} className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none appearance-none">
                   <option value="INWARD">Received (Inward)</option>
                   <option value="OUTWARD">Used (Outward)</option>
                </select>
             </div>
             <button onClick={addMaterial} className="bg-emerald-600 text-white h-11 rounded-xl text-[10px] font-black uppercase">Confirm Log</button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="px-8 py-6">Timestamp</th>
                  <th className="px-8 py-6">Material</th>
                  <th className="px-8 py-6">Action</th>
                  <th className="px-8 py-6">Quantity</th>
                  <th className="px-8 py-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-500/5 group">
                    <td className="px-8 py-5">
                       <div className="text-[10px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</div>
                       <div className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-8 py-5"><span className="text-sm font-bold">{item.name}</span></td>
                    <td className="px-8 py-5">
                       <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.type === 'INWARD' ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {item.type === 'INWARD' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                          {item.type}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="font-mono text-lg font-black">{item.qty}</span>
                       <span className="ml-2 text-[10px] font-black text-slate-400 uppercase">{item.unit}</span>
                    </td>
                    <td className="px-8 py-5 text-right"><CheckCircle2 size={16} className="text-emerald-500 inline-block opacity-40"/></td>
                  </tr>
                ))}
              </tbody>
           </table>
           {inventory.length === 0 && (
             <div className="p-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-40">Awaiting Material Logs...</div>
           )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Machinery Assets</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operating Status & Fuel Monitoring</p>
          </div>
          <div className="flex gap-3">
             <button onClick={exportMachinery} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase border border-zinc-200 dark:border-white/5">
                <FileOutput size={16}/> Status Export
             </button>
             {role === 'MAKER' && (
               <button onClick={() => setShowAddMachine(!showAddMachine)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl flex items-center gap-2">
                 {showAddMachine ? <X size={16}/> : <Plus size={16}/>} Deploy Asset
               </button>
             )}
          </div>
        </div>

        {showAddMachine && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-500/30 shadow-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in slide-in-from-top-4">
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Machine Name</label>
                <input value={macName} onChange={e => setMacName(e.target.value)} placeholder="e.g. Excavator EX200" className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Usage Stage</label>
                <input value={macStage} onChange={e => setMacStage(e.target.value)} placeholder="e.g. Excavation Phase 1" className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Fuel Cons.</label>
                <input value={macFuel} onChange={e => setMacFuel(e.target.value)} placeholder="12L/hr" className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-indigo-500"/>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 px-1">Initial Condition</label>
                <select value={macCond} onChange={e => setMacCond(e.target.value as any)} className="w-full bg-zinc-100 dark:bg-slate-800 rounded-xl p-3 text-xs outline-none">
                   <option value="ACTIVE">Active</option>
                   <option value="IDLE">Idle</option>
                   <option value="NON-USE">Non-Use</option>
                </select>
             </div>
             <button onClick={addMachine} className="bg-indigo-600 text-white h-11 rounded-xl text-[10px] font-black uppercase italic">Deploy to Site</button>
          </div>
        )}
        
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-zinc-200 dark:border-white/5 overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="px-8 py-6">Asset Name</th>
                  <th className="px-8 py-6">Operating Stage</th>
                  <th className="px-8 py-6">Condition</th>
                  <th className="px-8 py-6">Fuel Cons.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {machineries.map((m: Machine) => (
                  <tr key={m.id} className="hover:bg-indigo-500/5 group">
                    <td className="px-8 py-6">
                       <span className="font-bold text-sm text-slate-900 dark:text-white uppercase italic">{m.name}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 italic">
                         <Construction size={14}/> {m.stage}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        disabled={role !== 'MAKER'}
                        value={m.condition} 
                        onChange={(e) => setMachineries(machineries.map(it => it.id === m.id ? { ...it, condition: e.target.value as any } : it))}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest appearance-none outline-none border transition-colors ${
                          m.condition === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' :
                          m.condition === 'IDLE' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' :
                          'bg-slate-100 dark:bg-slate-800 border-zinc-200 dark:border-white/10 text-slate-500'
                        }`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="IDLE">Idle</option>
                        <option value="NON-USE">Non-Use</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-mono font-black text-xs text-orange-500">
                        <Fuel size={14}/> {m.fuelCons}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           {machineries.length === 0 && (
             <div className="p-20 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-40">No Assets Deployed.</div>
           )}
        </div>
      </div>
    </div>
  );
};

const TimelineTab = ({ tasks, setTasks, role }: any) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const addTask = () => {
    if (!newTaskName) return;
    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      name: newTaskName,
      start: 10,
      end: 40,
      progress: 0,
      status: 'REMAINING'
    };
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setShowAddTask(false);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t: any) => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">WBS Timeline</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Interactive Gantt Scheduling</p>
        </div>
        {role === 'MAKER' && (
          <button onClick={() => setShowAddTask(!showAddTask)} className="px-6 py-3 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 italic">
            {showAddTask ? <X size={16}/> : <Plus size={16}/>} Add Work Package
          </button>
        )}
      </div>

      {showAddTask && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-cyan-500/30 flex gap-4 animate-in slide-in-from-top-4">
           <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Package Name..." className="flex-1 bg-zinc-100 dark:bg-slate-800 rounded-xl px-4 text-sm font-bold outline-none"/>
           <button onClick={addTask} className="px-8 py-3 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase">Schedule</button>
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-x-auto custom-scrollbar">
         <div className="min-w-[1200px] space-y-4">
            <div className="grid grid-cols-[350px_1fr] border-b border-zinc-100 dark:border-white/10 pb-6 mb-6">
               <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Activity Description</div>
               <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  {['PHASE 1', 'PHASE 2', 'PHASE 3', 'PHASE 4', 'PHASE 5', 'PHASE 6'].map(m => <span key={m}>{m}</span>)}
               </div>
            </div>
            
            {tasks.map((task: Task) => (
              <div key={task.id} className="grid grid-cols-[350px_1fr] gap-8 group items-center">
                <div className="flex items-center gap-4 px-4">
                  {role === 'MAKER' ? (
                    <input 
                      value={task.name} 
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      className="bg-transparent border-b border-zinc-100 dark:border-white/10 font-bold text-[13px] uppercase italic outline-none focus:border-cyan-500 w-full"
                    />
                  ) : <span className="font-bold text-[13px] uppercase italic">{task.name}</span>}
                  
                  <select 
                    disabled={role !== 'MAKER'}
                    value={task.status} 
                    onChange={(e) => updateTask(task.id, { status: e.target.value as any, progress: e.target.value === 'COMPLETED' ? 100 : task.progress })}
                    className="text-[8px] font-black uppercase px-2 py-1 rounded bg-zinc-100 dark:bg-slate-800"
                  >
                    <option value="REMAINING">Remaining</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div className="relative h-10 bg-zinc-50 dark:bg-slate-950/50 rounded-2xl overflow-hidden border border-zinc-100 dark:border-white/5">
                   <div 
                     className={`absolute inset-y-0 rounded-xl shadow-lg flex items-center justify-end px-4 transition-all duration-700 ${
                       task.status === 'COMPLETED' ? 'bg-emerald-500' :
                       task.status === 'IN_PROGRESS' ? 'bg-cyan-500' :
                       'bg-slate-300 dark:bg-slate-800'
                     }`}
                     style={{ left: `${task.start}%`, right: `${100 - task.end}%` }}
                   >
                      {role === 'MAKER' && (
                        <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity px-2">
                           <input type="range" min="0" max="100" value={task.start} onChange={(e) => updateTask(task.id, { start: parseInt(e.target.value) })} className="w-8 h-8 opacity-0 cursor-ew-resize"/>
                           <input type="range" min="0" max="100" value={task.end} onChange={(e) => updateTask(task.id, { end: parseInt(e.target.value) })} className="w-8 h-8 opacity-0 cursor-ew-resize"/>
                        </div>
                      )}
                      <span className="text-[10px] font-black text-white relative z-10">{task.status === 'COMPLETED' ? '100%' : `${task.progress}%`}</span>
                      <div className="absolute inset-0 bg-black/20" style={{ width: `${100 - task.progress}%`, left: `${task.progress}%` }}></div>
                   </div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="p-20 text-center opacity-30 italic font-bold">No packages scheduled.</div>
            )}
         </div>
      </div>
    </div>
  );
};

const BoqTab = ({ items, setItems, role }: any) => (
  <div className="space-y-8 flex flex-col items-center justify-center p-20 opacity-30">
    <Calculator size={64}/>
    <h3 className="text-xl font-black uppercase italic mt-4">BOQ Repository Empty</h3>
  </div>
);

const GalleryTab = ({ media, setMedia, role }: any) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      
      const newMedia: SiteMedia = {
        id: `CAP-${Date.now()}`,
        url,
        date: new Date().toISOString(),
        status: 'PENDING',
        user: 'Current Maker',
        remarks: [{ text: 'Initial capture.', timestamp: new Date().toISOString(), author: 'Maker', qty: 0, unit: 'N/A' }]
      };
      
      setMedia([newMedia, ...media]);
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCapturing(true);
    } catch (err) { alert("Camera denied."); }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCapturing(false);
  };

  const updateMediaStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setMedia(media.map((m: any) => m.id === id ? { ...m, status } : m));
  };

  const addRemark = (id: string, text: string, qty?: number, unit?: string) => {
    setMedia(media.map((m: any) => {
      if (m.id === id) {
        return { 
          ...m, 
          remarks: [{ text, timestamp: new Date().toISOString(), author: role, qty, unit }, ...m.remarks] 
        };
      }
      return m;
    }));
  };

  const sortedDates = Object.keys(
    media.reduce((acc: any, item: any) => {
      const date = new Date(item.date).toDateString();
      acc[date] = true;
      return acc;
    }, {})
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Site Gallery</h2>
        {role === 'MAKER' && !isCapturing && (
          <button onClick={startCamera} className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 italic">
            <Camera size={20} /> Field Capture
          </button>
        )}
      </div>

      {isCapturing && (
        <div className="bg-slate-900 p-10 rounded-[4rem] border-4 border-cyan-500 shadow-2xl space-y-8 animate-in zoom-in-95">
           <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video rounded-3xl object-cover bg-black" />
           <div className="flex justify-center gap-8">
              <button onClick={stopCamera} className="p-5 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-all"><X size={28}/></button>
              <button onClick={captureFrame} className="p-8 bg-cyan-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white/20"><Camera size={40}/></button>
           </div>
        </div>
      )}

      <div className="space-y-16">
        {sortedDates.map(date => (
          <section key={date} className="space-y-8">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-6">
              <div className="h-px bg-zinc-200 dark:bg-slate-800 flex-1"></div>
              {date}
              <div className="h-px bg-zinc-200 dark:bg-slate-800 flex-1"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {media.filter(m => new Date(m.date).toDateString() === date).map((item: any) => (
                 <MediaCard key={item.id} item={item} role={role} onAddRemark={addRemark} onStatusUpdate={updateMediaStatus} />
               ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

const ReportsTab = ({ activeProject, media, machineries, reports, setReports }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    const today = new Date().toLocaleDateString();
    const approvedToday = media.filter((m: any) => m.status === 'APPROVED' && new Date(m.date).toLocaleDateString() === today);
    
    const content = await generateDailyReport({
      project: activeProject,
      date: today,
      approvedMedia: approvedToday,
      activeMachinery: machineries
    });

    const newReport: DailyReport = {
      id: `REP-${Date.now()}`,
      date: today,
      content,
      status: 'FINALIZED'
    };

    setReports([newReport, ...reports]);
    setSelectedReport(newReport);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 h-full">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black uppercase italic tracking-tighter">Neural Daily Reports</h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Verified Audit-Ready Documents</p>
        </div>
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="px-10 py-4 bg-cyan-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20} className="fill-white"/>}
          Generate Today's WIP
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full min-h-[600px]">
        <div className="lg:col-span-1 space-y-4">
           {reports.map((r: any) => (
             <button 
               key={r.id} 
               onClick={() => setSelectedReport(r)}
               className={`w-full p-6 rounded-3xl border text-left transition-all ${selectedReport?.id === r.id ? 'bg-white dark:bg-slate-900 border-cyan-500 shadow-xl' : 'bg-zinc-100 dark:bg-slate-950 border-transparent opacity-60'}`}
             >
                <p className="text-[9px] font-black text-slate-400 uppercase">{r.id}</p>
                <h4 className="text-sm font-bold mt-1 uppercase italic">{r.date}</h4>
                <div className="flex items-center gap-2 mt-2">
                   <CheckCircle2 size={12} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase">{r.status}</span>
                </div>
             </button>
           ))}
           {reports.length === 0 && (
             <div className="text-center p-12 bg-zinc-100 dark:bg-slate-900 rounded-3xl opacity-20 border-2 border-dashed border-slate-500">
                <FileText size={48} className="mx-auto" />
                <p className="text-[10px] font-black mt-4 uppercase">No Reports Available</p>
             </div>
           )}
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[4rem] shadow-2xl p-12 overflow-y-auto max-h-[80vh] custom-scrollbar relative">
           {selectedReport ? (
             <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-start mb-12 border-b border-zinc-100 dark:border-white/10 pb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-slate-900 dark:bg-white rounded-2xl"><FileType className="text-white dark:text-slate-900" size={32}/></div>
                      <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">WIP Report #{selectedReport.id}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Generated by Construction AI Engine</p>
                      </div>
                   </div>
                   <button onClick={() => window.print()} className="p-4 bg-zinc-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-cyan-500 transition-colors">
                      <Printer size={20} />
                   </button>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                   <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {selectedReport.content}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-10">
                <History size={120} />
                <h3 className="text-4xl font-black uppercase italic mt-8">Select Report to View</h3>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

/* Atomic Components */

const MediaCard = ({ item, role, onAddRemark, onStatusUpdate }: any) => {
  const [newRemark, setNewRemark] = useState('');
  const [newQty, setNewQty] = useState<number>(0);
  const [newUnit, setNewUnit] = useState('Cum');
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl group flex flex-col md:flex-row h-full">
       <div className="md:w-1/2 aspect-square relative overflow-hidden bg-black">
          <img src={item.url} className="w-full h-full object-cover" alt="Site" />
          <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
            {new Date(item.date).toLocaleTimeString()}
          </div>
       </div>
       <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged By</p>
              <p className="text-xs font-black uppercase italic text-cyan-600">{item.user}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 
              item.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {item.status}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[150px] scrollbar-hide">
            {item.remarks[0] && (
              <div className="p-4 bg-zinc-50 dark:bg-slate-950/50 rounded-2xl border border-zinc-100 dark:border-white/5">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 italic">"{item.remarks[0].text}"</p>
                {item.remarks[0].qty > 0 && (
                   <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Quantity:</span>
                      <span className="text-[10px] font-mono font-bold">{item.remarks[0].qty} {item.remarks[0].unit}</span>
                   </div>
                )}
                <p className="text-[8px] font-black text-slate-400 uppercase mt-2">{new Date(item.remarks[0].timestamp).toLocaleString()} • {item.remarks[0].author}</p>
              </div>
            )}
            {showHistory && item.remarks.slice(1).map((r: any, idx: number) => (
              <div key={idx} className="p-4 bg-zinc-100 dark:bg-slate-800/50 rounded-2xl opacity-60">
                <p className="text-[10px] font-medium italic text-slate-500">"{r.text}"</p>
                {r.qty > 0 && <p className="text-[9px] font-mono mt-1">{r.qty} {r.unit}</p>}
              </div>
            ))}
          </div>

          <button onClick={() => setShowHistory(!showHistory)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 hover:text-cyan-500 transition-colors flex items-center gap-1">
             <History size={10}/> {showHistory ? 'Hide History' : `Show History (${item.remarks.length - 1})`}
          </button>

          {role === 'MAKER' && (
            <div className="mt-6 space-y-3">
              <div className="flex gap-2">
                 <input 
                  type="number" 
                  placeholder="Qty" 
                  value={newQty || ''} 
                  onChange={(e) => setNewQty(parseFloat(e.target.value))}
                  className="w-20 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3 text-xs outline-none font-mono"
                 />
                 <input 
                  placeholder="Unit (Cum, Kg, etc)" 
                  value={newUnit} 
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-24 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-xl px-3 text-xs outline-none"
                 />
              </div>
              <div className="flex gap-2">
                <input 
                  placeholder="Work description remark..." 
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 text-xs italic outline-none"
                />
                <button 
                  onClick={() => { if(newRemark.trim()){ onAddRemark(item.id, newRemark, newQty, newUnit); setNewRemark(''); setNewQty(0); }}}
                  className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg active:scale-90 transition-all"
                >
                  <Zap size={16}/>
                </button>
              </div>
            </div>
          )}

          {role === 'CHECKER' && item.status === 'PENDING' && (
            <div className="mt-6 flex gap-2">
              <button onClick={() => onStatusUpdate(item.id, 'APPROVED')} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Approve Evidence</button>
              <button onClick={() => onStatusUpdate(item.id, 'REJECTED')} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Reject</button>
            </div>
          )}
       </div>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${active ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-600/20' : 'text-slate-500 hover:bg-zinc-100 dark:hover:bg-slate-800'}`}>
    <div className="flex items-center gap-4">
      {icon}
      <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
    </div>
    {count > 0 && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white text-cyan-600' : 'bg-red-500 text-white'}`}>{count}</span>}
  </button>
);

const StatCard = ({ label, value, sub, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[3rem] shadow-sm group hover:border-cyan-500 transition-all">
    <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-1">{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-[9px] text-slate-500 font-bold uppercase">{sub}</div>
  </div>
);

const FolderCard = ({ name, count, icon }: any) => (
  <div className="p-8 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-sm hover:scale-105 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl group-hover:bg-cyan-500 transition-colors group-hover:text-white">{icon}</div>
      <MoreVertical size={16} className="text-slate-300" />
    </div>
    <h4 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">{name}</h4>
    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{count} Linked Documents</p>
  </div>
);

export default ProjectDashboard;
