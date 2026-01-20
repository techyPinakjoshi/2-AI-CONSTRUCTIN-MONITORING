
import React, { useState, useContext, useRef } from 'react';
import { 
  BarChart3, TrendingUp, Download, Share2, Filter, 
  X, Calculator, ShieldCheck, Crown, FileText, Calendar, 
  IndianRupee, CheckCircle2, Clock, Sun, Moon, UploadCloud,
  FileUp, Trash2, Loader2, Sparkles, LayoutDashboard, ArrowRight,
  Plus
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';

interface BoqItem {
  id: string;
  code: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  category: string;
}

const BoqDashboard: React.FC<any> = ({ onClose, onUpgrade }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<'overview' | 'sor' | 'upload'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedBoq, setExtractedBoq] = useState<BoqItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showProgressLink, setShowProgressLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtractBoq = async () => {
    if (uploadedFiles.length === 0) return;
    setIsExtracting(true);
    try {
      const names = uploadedFiles.map(f => f.name);
      const data = await extractBoqFromPlans(names);
      setExtractedBoq(data);
      setActiveTab('sor');
      setShowProgressLink(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const totalAmount = extractedBoq.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 transition-colors">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl shadow-xl">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">AI PM <span className="text-orange-500">Suite</span></h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Multi-Plan Synthesis Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-2xl transition-all">
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
          </button>
          {showProgressLink && (
            <button 
              onClick={onUpgrade}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all animate-bounce-short"
            >
              <LayoutDashboard size={14} /> Tracking Dashboard
            </button>
          )}
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar for Files & Navigation */}
        <aside className="w-80 bg-white dark:bg-slate-900/40 border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col overflow-y-auto">
          <nav className="space-y-2 mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operations</h3>
            <SidebarBtn active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<FileUp size={16}/>} label="Plan Ingestion" />
            <SidebarBtn active={activeTab === 'sor'} onClick={() => setActiveTab('sor')} icon={<FileText size={16}/>} label="BOQ Item Table" />
            <SidebarBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={16}/>} label="Cost Summary" />
          </nav>

          <div className="flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Document Queue ({uploadedFiles.length})</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={14} className="text-orange-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {uploadedFiles.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-2xl opacity-40">
                  <p className="text-[10px] font-bold uppercase">No files staged</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 grid-bg">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'upload' && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-orange-500/10 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <UploadCloud size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Multi-Plan Synthesis</h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
                    Ingest Architectural, Structural, and MEP plans to generate an AI-verified BOQ based on IS 1200.
                  </p>
                </div>

                <div className="w-full max-w-2xl bg-white dark:bg-slate-900/60 p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 shadow-2xl text-center">
                  <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.dwg,.jpg,.png" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-4 border-dashed border-zinc-100 dark:border-white/5 rounded-[2rem] hover:bg-zinc-50 dark:hover:bg-white/5 transition-all group mb-8"
                  >
                    <Plus className="mx-auto text-slate-300 group-hover:text-orange-500 mb-4 transition-colors" size={48} />
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Click to staging plans</span>
                  </button>

                  <button 
                    onClick={handleExtractBoq}
                    disabled={isExtracting || uploadedFiles.length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Synthesizing Multi-Plan BOQ...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate AI Extraction
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sor' && (
              <div className="animate-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-10 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Extracted <span className="text-orange-500">BOQ Items</span></h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-referenced from {uploadedFiles.length} plans</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="p-3 bg-zinc-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-zinc-200 transition-all">
                        <Download size={20} />
                      </button>
                      <button className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Export IS 1200</button>
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-slate-800/20 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-zinc-200 dark:border-white/5">
                      <tr>
                        <th className="px-10 py-6">SOR Code</th>
                        <th className="px-10 py-6">Description</th>
                        <th className="px-10 py-6 text-right">Qty</th>
                        <th className="px-10 py-6 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {extractedBoq.map(item => (
                        <tr key={item.id} className="hover:bg-orange-500/5 transition-colors group">
                          <td className="px-10 py-6"><span className="font-mono font-bold text-orange-600 dark:text-orange-400">{item.code}</span></td>
                          <td className="px-10 py-6">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.description}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{item.category}</div>
                          </td>
                          <td className="px-10 py-6 text-right font-mono text-slate-600 dark:text-slate-400">
                             {item.qty} <span className="text-[10px]">{item.unit}</span>
                          </td>
                          <td className="px-10 py-6 text-right font-mono font-black text-slate-900 dark:text-white">{item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-10 bg-zinc-50 dark:bg-slate-800/10 flex justify-between items-center">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Aggregate Project Cost</span>
                    <span className="text-3xl font-black text-orange-600 dark:text-orange-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {showProgressLink && (
                  <div className="mt-8 p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-between animate-pulse-slow">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase italic leading-none">Intelligence Synchronization Complete</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">Ready to link these quantities to live site monitoring for automated progress tracking.</p>
                      </div>
                    </div>
                    <button 
                      onClick={onUpgrade}
                      className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl group"
                    >
                      Connect Vision Dashboard <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                <StatBox label="Synthesized Budget" value={`₹${totalAmount.toLocaleString('en-IN')}`} icon={<IndianRupee/>} color="orange" />
                <StatBox label="Data Integrity" value="99.4%" icon={<ShieldCheck/>} color="blue" />
                <StatBox label="Plan Count" value={uploadedFiles.length.toString()} icon={<FileText/>} color="purple" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-tight transition-all ${active ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-xl' : 'text-slate-400 hover:bg-zinc-100 dark:hover:bg-white/5 border border-transparent'}`}
  >
    {icon} {label}
  </button>
);

const StatBox = ({ label, value, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 p-10 rounded-[3rem] shadow-xl group hover:scale-105 transition-all text-center">
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 mx-auto bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>{React.cloneElement(icon, { size: 28 })}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

export default BoqDashboard;
