
import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, Settings2, AlertCircle, Clock, 
  MessageSquare, Send, HelpCircle, Ruler, Info, Lightbulb, Check, Trash2, Edit3,
  ShieldCheck, ShieldAlert
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
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  };

  const runExtraction = async (context: any[] = []) => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await extractBoqFromPlans(uploadedFiles, context);
      setBoqItems(result.boqItems || []);
      setClarifications(result.clarifications || []);
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
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden bg-zinc-50 dark:bg-slate-950">
        {/* Left Sidebar: Settings & Files */}
        <div className="w-80 border-r border-zinc-200 dark:border-white/5 p-6 space-y-8 overflow-y-auto hidden lg:block custom-scrollbar">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Plan Data</h3>
           
           <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck size={16} />
                <h4 className="text-[11px] font-black uppercase italic">Extraction Policy</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">I extract data only from labeled plans. I don't guess missing dimensions.</p>
              <ul className="space-y-2">
                 <CheckItem label="IS-1200 Compliant" />
                 <CheckItem label="Net Quantities Only" />
                 <CheckItem label="Verified Evidence" />
              </ul>
           </div>

           <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Uploaded Drawings</h4>
             {uploadedFiles.map((f, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-2xl shadow-sm">
                 <FileText size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-bold truncate">{f.name}</span>
               </div>
             ))}
             <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-zinc-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                <Plus size={12}/> Add Plans
             </button>
           </div>
        </div>

        {/* Center: BOQ Table Formate */}
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
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Audit-Ready BOQ</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload blueprints to begin. Use the chat to <span className="text-indigo-600 font-bold">add or remove</span> items manually as needed.</p>
                </div>
                <div className="w-full max-w-xl bg-zinc-50 dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-indigo-500/50 group">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png,.jpeg" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4 w-full">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                      <UploadCloud size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scan 2D Plans</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end bg-zinc-50 dark:bg-slate-900 p-8 rounded-[3.5rem] border border-zinc-200 dark:border-white/5 shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Surveyor Ready</span>
                    </div>
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
                          <th className="px-8 py-6">Calculation Detail</th>
                          <th className="px-8 py-6 text-right">Quantity</th>
                          <th className="px-8 py-6">Drawing Ref</th>
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
                               <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">{item.unit}</span>
                            </td>
                            <td className="px-8 py-7 max-w-xs">
                               <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 italic truncate" title={item.calculation}>
                                  {item.calculation || 'Direct Count'}
                                </div>
                            </td>
                            <td className="px-8 py-7 text-right font-mono text-sm font-black text-slate-900 dark:text-white">
                              {item.quantity?.toLocaleString()}
                            </td>
                            <td className="px-8 py-7 text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[120px]" title={item.drawingRef}>
                              {item.drawingRef || 'Ref-N/A'}
                            </td>
                            <td className="px-8 py-7">
                              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                item.status === 'Complete' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                item.status === 'Partial' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                'bg-red-500/10 border-red-500/20 text-red-600'
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

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-indigo-500/5 p-8 rounded-[3.5rem] border border-indigo-500/10">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg"><FileSpreadsheet size={24}/></div>
                      <div>
                          <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-100 uppercase italic leading-none">Sync & Export</h4>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Download results as Excel or push to your project dashboard</p>
                      </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-8 py-5 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-zinc-50 transition-all active:scale-95">
                        <Download size={18} /> Export Excel
                    </button>
                    <button onClick={() => onSyncToSuite(boqItems, uploadedFiles.map(f => f.name))} className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                        <CheckCircle2 size={18} /> Finalize BOQ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Consoles */}
        <div className="w-[450px] flex flex-col bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-white/5">
          {/* Clarification Console */}
          <div className="flex flex-col h-[40%] min-h-[350px] border-b border-zinc-100 dark:border-white/5">
            <div className="p-6 shrink-0 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900 dark:text-white">
                 <ShieldAlert size={16} className="text-red-500"/> Clarification Console
              </h3>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{clarifications.length} Issues</div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
              {clarifications.length > 0 ? (
                clarifications.map((c, i) => (
                  <div key={i} className="p-5 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-[2rem] space-y-3 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.id} • {c.item}</span>
                        <span className="text-[9px] font-black text-red-500 uppercase px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-full">{c.impact}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{c.missingInfo}"</p>
                    <div className="flex gap-2">
                       <input 
                         placeholder="Your answer..." 
                         className="flex-1 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-4 text-[11px] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500/30" 
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             solveClarification(c.id, (e.target as HTMLInputElement).value);
                             (e.target as HTMLInputElement).value = '';
                           }
                         }}
                       />
                       <button className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-90"><ArrowRight size={14}/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem]">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No issues detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Chatbot Manual Overrides */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 bg-slate-950/10 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between shrink-0">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <MessageSquare size={12}/> Manual Adjustments
               </span>
               <button onClick={() => setChatHistory([])} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 space-y-6 opacity-30">
                   <Edit3 size={48} className="text-indigo-400" />
                   <div className="space-y-2">
                     <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Add/Remove Items</p>
                     <p className="text-[10px] font-medium leading-relaxed italic text-slate-500">Tell me to <span className="text-indigo-600 font-bold">add</span> or <span className="text-red-600 font-bold">remove</span> specific items from the table above.</p>
                   </div>
                   <div className="flex flex-col gap-2 w-full">
                      <button onClick={() => setChatInput("Add 400 sqm of tiling for lobby area.")} className="text-[9px] font-black p-3 bg-zinc-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-slate-500 uppercase tracking-widest">Add Item</button>
                      <button onClick={() => setChatInput("Remove the excavation quantity for footing F2.")} className="text-[9px] font-black p-3 bg-zinc-100 dark:bg-slate-800 rounded-xl hover:bg-red-500 hover:text-white transition-all text-slate-500 uppercase tracking-widest">Remove Item</button>
                   </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-zinc-200 dark:border-white/5 rounded-tl-none italic font-medium'
                  }`}>
                    {msg.role === 'assistant_question' && <span className="block text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">QS Inquiry</span>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isProcessing && (
                 <div className="flex justify-start">
                   <div className="bg-zinc-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none italic text-[11px] text-slate-400 flex items-center gap-2">
                     <Loader2 size={12} className="animate-spin" /> Updating BOQ...
                   </div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-slate-950 border-t border-zinc-200 dark:border-white/5 shrink-0">
              <form onSubmit={handleChatSubmit} className="relative">
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask to add/remove particulars..."
                  className="w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-6 pr-16 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-sm"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isProcessing}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 shadow-xl shadow-indigo-600/30"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

const CheckItem: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
    <div className="w-4 h-4 rounded-full border border-indigo-500/40 flex items-center justify-center">
      <Check size={10} className="text-indigo-500 opacity-50" />
    </div>
    {label}
  </div>
);

export default BoqExtractor;
