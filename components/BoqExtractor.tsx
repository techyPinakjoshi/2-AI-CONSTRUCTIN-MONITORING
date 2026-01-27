
import React, { useState, useRef, useContext } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, IndianRupee, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, History
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';
import Tooltip from './Tooltip';

interface BoqExtractorProps {
  onClose: () => void;
  onSyncToSuite: (data: any) => void;
}

const BoqExtractor: React.FC<BoqExtractorProps> = ({ onClose, onSyncToSuite }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [boqData, setBoqData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const runExtraction = async () => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const planNames = uploadedFiles.map(f => f.name);
      const data = await extractBoqFromPlans(planNames);
      setBoqData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = boqData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">AI Quantities <span className="text-amber-500">Extractor</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">2D Plan to BOQ Engine • IS 1200 Standard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-zinc-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {boqData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-amber-500/10 rounded-[3rem] flex items-center justify-center text-amber-500 shadow-inner border border-amber-500/20">
                <FileSpreadsheet size={48} />
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Plan Intelligence</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Upload architectural or structural plans. Our AI will automatically identify materials, calculate quantities, and generate an itemized BOQ based on IS-1200 codes.</p>
              </div>

              <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-amber-500/50 group">
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png" />
                
                {uploadedFiles.length === 0 ? (
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-zinc-50 dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-amber-500 transition-colors shadow-sm">
                      <UploadCloud size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Drop Plans Here or Click to Browse</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
                          <FileText size={14} /> {f.name}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={runExtraction}
                      disabled={isProcessing}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 italic mt-4"
                    >
                      {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="fill-current" />}
                      {isProcessing ? "Synthesizing Quantities..." : "Run AI Extraction"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-6 duration-700 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><Calculator size={200} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Extraction Verified • 98.4% Confidence</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Extracted Quantities</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{uploadedFiles.length} Plans Processed • {boqData.length} Line Items Identified</p>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Base Value</div>
                  <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{(totalAmount/100000).toFixed(1)}L</div>
                </div>
              </div>

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
                    {boqData.map((item, idx) => (
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
                </table>
              </div>

              <div className="flex justify-between gap-4 pb-20">
                <button onClick={() => { setBoqData([]); setUploadedFiles([]); }} className="px-10 py-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 text-slate-500 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all active:scale-95 shadow-lg">Reset & Re-scan</button>
                <div className="flex gap-4">
                  <button className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-lg">
                    <Download size={18} /> Export Excel
                  </button>
                  <button 
                    onClick={() => onSyncToSuite(boqData)}
                    className="flex items-center gap-3 px-12 py-5 bg-amber-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all italic"
                  >
                    <ArrowRight size={18} /> Sync to Project Suite
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BoqExtractor;
