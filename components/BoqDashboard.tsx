
import React, { useState, useContext, useRef } from 'react';
import { 
  Calculator, X, Sun, Moon, FileUp, FileText, BarChart3, 
  UploadCloud, Plus, Loader2, Sparkles, Download, ArrowRight,
  LayoutDashboard, IndianRupee, ShieldCheck
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';
import Tooltip from './Tooltip';

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

interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const BoqDashboard: React.FC<any> = ({ onClose, onUpgrade }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<'overview' | 'sor' | 'upload'>('upload');
  const [uploadQueue, setUploadQueue] = useState<FileUploadProgress[]>([]);
  const [extractedBoq, setExtractedBoq] = useState<BoqItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showProgressLink, setShowProgressLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUploads = newFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }));

      setUploadQueue(prev => [...prev, ...newUploads]);

      newUploads.forEach((upload) => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 10;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setUploadQueue(current => 
              current.map(item => 
                item.file === upload.file ? { ...item, progress: 100, status: 'completed' } : item
              )
            );
          } else {
            setUploadQueue(current => 
              current.map(item => 
                item.file === upload.file ? { ...item, progress: currentProgress } : item
              )
            );
          }
        }, 200);
      });
    }
  };

  const handleExtractBoq = async () => {
    const readyFiles = uploadQueue.filter(u => u.status === 'completed');
    if (readyFiles.length === 0) return;
    
    setIsExtracting(true);
    try {
      const names = readyFiles.map(f => f.file.name);
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

  const exportCSV = () => {
    if (extractedBoq.length === 0) {
        alert("No BOQ data to export. Please generate a BOQ first.");
        return;
    }
    
    // Construct CSV String
    const headers = "SOR Code,Description,Category,Quantity,Unit,Rate (INR),Amount (INR)\n";
    const rows = extractedBoq.map(item => 
      `"${item.code}","${item.description.replace(/"/g, '""')}","${item.category}",${item.qty},"${item.unit}",${item.rate},${item.amount}`
    ).join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ConstructAI_BOQ_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  };

  const totalAmount = extractedBoq.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl shadow-xl">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic leading-none">AI PM <span className="text-orange-500">Suite</span></h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Plan Synthesis Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip text="Switch Theme">
            <button onClick={toggleTheme} className="p-3 bg-zinc-100 dark:bg-slate-800 rounded-2xl transition-all">
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </Tooltip>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white dark:bg-slate-900/40 border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col overflow-y-auto shrink-0">
          <nav className="space-y-2 mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operations</h3>
            <SidebarBtn active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<FileUp size={16}/>} label="Plan Ingestion" />
            <SidebarBtn active={activeTab === 'sor'} onClick={() => setActiveTab('sor')} icon={<FileText size={16}/>} label="BOQ Item Table" />
            <SidebarBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={16}/>} label="Cost Summary" />
          </nav>
          
          <div className="mt-auto p-5 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
            <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Upload at least 2 versions of plans for AI verification cross-checks.</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 bg-white dark:bg-slate-950 relative">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'upload' && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 bg-orange-500/10 text-orange-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl">
                  <UploadCloud size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Ingest Plans</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-10 text-sm leading-relaxed font-medium">Stage your architectural and structural drawings for automated quantity extraction following IS 1200.</p>

                <div className="w-full max-w-xl bg-zinc-50 dark:bg-slate-900 p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 shadow-2xl">
                  <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.dwg,.jpg,.png" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-16 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] hover:bg-zinc-100 dark:hover:bg-white/5 transition-all mb-8 group"
                  >
                    <Plus className="mx-auto text-slate-300 group-hover:text-orange-500 mb-4 transition-colors" size={56} />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Drop Plans Here</span>
                  </button>

                  <button 
                    onClick={handleExtractBoq}
                    disabled={isExtracting || uploadQueue.length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isExtracting ? "Synthesizing BOQ..." : "Generate AI BOQ"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sor' && (
              <div className="animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Bill of Quantities</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Verified against Indian Standard Code IS 1200</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={exportCSV}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-50 transition-all active:scale-95"
                        >
                            <Download size={14}/> Download CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-slate-800/20 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-zinc-200 dark:border-white/5">
                      <tr>
                        <th className="px-10 py-6">Code</th>
                        <th className="px-10 py-6">Description</th>
                        <th className="px-10 py-6 text-right">Quantity</th>
                        <th className="px-10 py-6 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {extractedBoq.map(item => (
                        <tr key={item.id} className="hover:bg-orange-500/5 transition-colors">
                          <td className="px-10 py-6 font-mono font-bold text-orange-600 dark:text-orange-400">{item.code}</td>
                          <td className="px-10 py-6">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.description}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{item.category}</div>
                          </td>
                          <td className="px-10 py-6 text-right font-mono text-slate-600 dark:text-slate-400">
                             {item.qty} <span className="text-[10px] uppercase">{item.unit}</span>
                          </td>
                          <td className="px-10 py-6 text-right font-mono font-black text-slate-900 dark:text-white">
                             {item.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-10 bg-zinc-50 dark:bg-slate-800/10 flex justify-between items-center border-t border-zinc-100 dark:border-white/5">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Estimated Budget</span>
                    <span className="text-4xl font-black text-orange-600 dark:text-orange-400">₹{totalAmount.toLocaleString('en-IN')}</span>
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

const SidebarBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-tight transition-all border ${active ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 shadow-xl' : 'text-slate-400 border-transparent hover:bg-zinc-100 dark:hover:bg-white/5'}`}
  >
    {icon} {label}
  </button>
);

export default BoqDashboard;
