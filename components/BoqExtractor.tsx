
import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, Settings2, AlertCircle, Clock, 
  MessageSquare, Send, HelpCircle, Ruler, Info, Lightbulb, Check, Trash2, Edit3,
  ShieldCheck, ShieldAlert, Lock
} from 'lucide-react';
import { ThemeContext } from '../App';
import { extractBoqFromPlans } from '../services/geminiService';
import Tooltip from './Tooltip';
import ContactUsModal from './ContactUsModal';

interface BoqExtractorProps {
  onClose: () => void;
  onSyncToSuite: (data: any[], sourceFiles: string[], targetProjectId?: string, mode?: 'append' | 'replace') => void;
  userProjects: any[];
  isPremium?: boolean;
}

const BoqExtractor: React.FC<BoqExtractorProps> = ({ onClose, onSyncToSuite, userProjects, isPremium }) => {
  const { isDark } = useContext(ThemeContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Usage Logic
  const getCurrentMonthKey = () => `BOQ_USAGE_${new Date().getFullYear()}_${new Date().getMonth()}`;
  const [usageCount, setUsageCount] = useState(() => {
    return parseInt(localStorage.getItem(getCurrentMonthKey()) || '0');
  });

  const isLimitReached = !isPremium && usageCount >= 5;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLimitReached) {
      setShowContact(true);
      return;
    }
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  };

  const runExtraction = async (context: any[] = []) => {
    if (uploadedFiles.length === 0 || isLimitReached) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await extractBoqFromPlans(uploadedFiles, context);
      setBoqItems(result.boqItems || []);
      setClarifications(result.clarifications || []);
      
      // Update usage on first successful scan
      if (context.length === 0) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(getCurrentMonthKey(), newCount.toString());
      }
    } catch (err) {
      setError("The AI scan timed out. Try fewer drawings or check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    runExtraction(newHistory);
  };

  const solveClarification = (id: string, answer: string) => {
    if (!answer.trim()) return;
    const item = clarifications.find(c => c.id === id);
    const newHistory = [
      ...chatHistory, 
      { role: 'assistant_question', text: `Clarification for ${item?.item}: ${item?.missingInfo}` }, 
      { role: 'user', text: answer }
    ];
    setChatHistory(newHistory);
    runExtraction(newHistory);
  };

  const exportToExcel = () => {
    if (boqItems.length === 0) return;
    const headers = ["No", "Description", "Unit", "Calculation", "Quantity", "Ref", "Status"];
    const rows = boqItems.map((item, idx) => [
      item.itemNo || (idx + 1).toString(),
      `"${item.description?.replace(/"/g, '""')}"`,
      item.unit,
      `"${item.calculation?.replace(/"/g, '""')}"`,
      item.quantity,
      `"${item.drawingRef?.replace(/"/g, '""')}"`,
      item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BOQ_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden text-slate-900 dark:text-slate-100">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
            <Ruler size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Quantity <span className="text-indigo-500">Surveyor AI</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct Plan Extraction • Accuracy First</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isPremium && (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{5 - usageCount} Monthly Credits</span>
            </div>
          )}
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden bg-zinc-50 dark:bg-slate-950">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-zinc-200 dark:border-white/5 p-6 space-y-8 overflow-y-auto hidden lg:block custom-scrollbar">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Plan Data</h3>
           
           <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck size={16} />
                <h4 className="text-[11px] font-black uppercase italic">Extraction Policy</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Verified Net Quantities only. Verified against IS-1200.</p>
           </div>

           {isLimitReached && (
             <div className="p-6 bg-red-500/5 border-2 border-red-500/20 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                   <Lock size={16}/>
                   <span className="text-[10px] font-black uppercase tracking-widest">Limit Exhausted</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                   Professional accounts can process 5 plans per month.
                </p>
                <button onClick={() => setShowContact(true)} className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Request Extended Limits
                </button>
             </div>
           )}

           <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Uploaded Drawings</h4>
             {uploadedFiles.map((f, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-2xl shadow-sm">
                 <FileText size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-bold truncate">{f.name}</span>
               </div>
             ))}
             {!isLimitReached && (
               <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-zinc-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                  <Plus size={12}/> Add Plans
               </button>
             )}
           </div>
        </div>

        {/* Center */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {isProcessing && boqItems.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
                 <div className="relative">
                    <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-indigo-500" size={64} />
                    </div>
                    <Sparkles size={24} className="absolute top-0 right-0 text-indigo-500 animate-pulse" />
                 </div>
                 <div className="text-center">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Analyzing Drawings...</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Scaling and identifying schedule items</p>
                 </div>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center text-indigo-500">
                  <Calculator size={48} />
                </div>
                <div className="max-w-md">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">AI BOQ Extraction</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload blueprints to begin neural takeoff. New users get 5 plans/month.</p>
                </div>
                {!isLimitReached ? (
                  <div className="w-full max-w-xl bg-zinc-50 dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-indigo-500/50 group">
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png,.jpeg" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 w-full">
                      <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                        <UploadCloud size={40} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scan 2D Plans</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowContact(true)} className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                    <MessageSquare size={20}/> Connect with Support
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end bg-zinc-50 dark:bg-slate-900 p-8 rounded-[3.5rem] border border-zinc-200 dark:border-white/5 shadow-sm">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">BOQ <span className="text-indigo-500">Report</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">IS-1200 Methodology • {boqItems.length} Extracted Items</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => runExtraction(chatHistory)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16}/>} Refresh Scan
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-100 dark:bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-zinc-200 dark:border-white/10">
                        <tr>
                          <th className="px-8 py-6 w-16">No</th>
                          <th className="px-8 py-6">Particular Description</th>
                          <th className="px-8 py-6">Unit</th>
                          <th className="px-8 py-6 text-right">Quantity</th>
                          <th className="px-8 py-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {boqItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-indigo-500/5 transition-colors group">
                            <td className="px-8 py-7 font-mono text-[11px] font-bold text-slate-400">{item.itemNo || idx + 1}</td>
                            <td className="px-8 py-7">
                               <div className="text-[13px] font-bold leading-tight uppercase tracking-tight text-slate-900 dark:text-white">{item.description}</div>
                            </td>
                            <td className="px-8 py-7">
                               <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{item.unit}</span>
                            </td>
                            <td className="px-8 py-7 text-right font-mono text-sm font-black text-slate-900 dark:text-white">
                              {item.quantity?.toLocaleString()}
                            </td>
                            <td className="px-8 py-7">
                              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                item.status === 'Complete' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
                              }`}>
                                {item.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showContact && <ContactUsModal onClose={() => setShowContact(false)} reason="Requesting BOQ Limit Increase" />}
    </div>
  );
};

export default BoqExtractor;
