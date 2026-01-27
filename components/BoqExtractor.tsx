
import React, { useState, useRef, useContext } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, IndianRupee, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, History, Folder, Settings2, AlertCircle, Clock, TrendingUp
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';
import Tooltip from './Tooltip';

interface BoqExtractorProps {
  onClose: () => void;
  onSyncToSuite: (data: any[], sourceFiles: string[], targetProjectId?: string, mode?: 'append' | 'replace') => void;
  userProjects: any[];
}

const BoqExtractor: React.FC<BoqExtractorProps> = ({ onClose, onSyncToSuite, userProjects }) => {
  const { isDark } = useContext(ThemeContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [boqData, setBoqData] = useState<any[]>([]);
  const [lastExtractionTime, setLastExtractionTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>('new');
  const [syncMode, setSyncMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lacs`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Fix: Added handleFileSelect to process uploaded files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  };

  const runExtraction = async () => {
    if (uploadedFiles.length === 0) return;
    setBoqData([]); 
    setIsProcessing(true);
    setError(null);
    try {
      const data = await extractBoqFromPlans(uploadedFiles);
      if (data && data.length > 0) {
        setBoqData(data);
        setLastExtractionTime(new Date().toLocaleTimeString());
      } else {
        setError("Scaling analysis failed. Please ensure drawings have clear dimensions.");
      }
    } catch (err) {
      setError("Extraction timeout. The plans may be too complex for a single scan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = boqData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Market <span className="text-blue-500">Estimator</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Current Benchmark Index • Neural Scaling</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
          {isProcessing ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
               <div className="relative">
                  <div className="w-32 h-32 border-4 border-blue-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                    <Loader2 className="animate-spin text-blue-500" size={64} />
                  </div>
                  <TrendingUp size={24} className="absolute top-0 right-0 text-blue-500 animate-pulse" />
               </div>
               <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Analyzing Project Scale</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Benchmarking Market Rates • Calibrating BUA Quantities</p>
               </div>
            </div>
          ) : boqData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-blue-500/10 rounded-[3rem] flex items-center justify-center text-blue-500 shadow-inner border border-blue-500/20">
                <FileSpreadsheet size={48} />
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Market-First Intelligence</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload architectural/structural plans. Our AI will determine built-up area and apply <b>current market benchmarks</b> for A-grade construction.</p>
              </div>
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3"><AlertCircle size={20}/><p className="text-[10px] font-black uppercase">{error}</p></div>}
              <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-blue-500/50 group">
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png,.jpeg" />
                {uploadedFiles.length === 0 ? (
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-zinc-50 dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                      <UploadCloud size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scan Project Blueprints</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                      {uploadedFiles.map((f, i) => (<div key={i} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-600 uppercase flex items-center gap-2"><FileText size={14}/>{f.name}</div>))}
                    </div>
                    <button onClick={runExtraction} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all italic"><Zap size={20}/>Estimate Market Value</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8 pb-32">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-zinc-200 dark:border-white/5 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><Calculator size={200} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Scale Verified • Market Benchmarked</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Market <span className="text-blue-500">Valuation</span></h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{uploadedFiles.length} Plans Analyzed • Real-time Cost Index applied</p>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total Outlay</div>
                  <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{formatCurrency(totalAmount)}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6">Description & Component</th>
                      <th className="px-8 py-6">Category</th>
                      <th className="px-8 py-6 text-right">Project Area</th>
                      <th className="px-8 py-6 text-right">Market Rate</th>
                      <th className="px-8 py-6 text-right">Component Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {boqData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                        <td className="px-8 py-6">
                           <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.code}</div>
                           <div className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase border border-zinc-200 dark:border-white/5">{item.category}</span>
                        </td>
                        <td className="px-8 py-6 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">{item.qty?.toLocaleString()} <span className="text-[9px] text-slate-400 font-black">{item.unit}</span></td>
                        <td className="px-8 py-6 text-right font-mono text-xs text-slate-400">₹{item.rate?.toLocaleString()}</td>
                        <td className="px-8 py-6 text-right font-mono text-xs font-black text-blue-600">₹{item.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between gap-4 pb-20">
                <button onClick={() => { setBoqData([]); setUploadedFiles([]); }} className="px-10 py-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 text-slate-500 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:border-red-500 transition-all shadow-lg">Reset Selection</button>
                <button onClick={() => onSyncToSuite(boqData, uploadedFiles.map(f => f.name), targetProjectId === 'new' ? undefined : targetProjectId, syncMode)} className="flex items-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all italic">
                    <ArrowRight size={18} /> Sync Valuation to Suite
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoqExtractor;
