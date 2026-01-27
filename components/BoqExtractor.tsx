
import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, Settings2, AlertCircle, Clock, 
  MessageSquare, Send, HelpCircle, Ruler, Info, Lightbulb, Check
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
  const [questions, setQuestions] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [lastExtractionTime, setLastExtractionTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>('new');
  const [syncMode, setSyncMode] = useState<'append' | 'replace'>('append');
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
      setQuestions(result.clarificationQuestions || []);
      setLastExtractionTime(new Date().toLocaleTimeString());
    } catch (err) {
      setError("AI Vision Timeout. The drawings might be too complex for a single scan.");
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

  const answerQuestion = (question: string, answer: string) => {
    const newHistory = [...chatHistory, { role: 'assistant_question', text: question }, { role: 'user', text: answer }];
    setChatHistory(newHistory);
    runExtraction(newHistory);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      <header className="h-20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
            <Ruler size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Material <span className="text-indigo-500">Mapper</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Exhaustive Material Extraction • Zero Monetary Value</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden bg-zinc-50 dark:bg-slate-950">
        {/* Left Sidebar: Calibration Checklist */}
        <div className="w-80 border-r border-zinc-200 dark:border-white/5 p-6 space-y-8 overflow-y-auto hidden lg:block">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Calibration Toolkit</h3>
           
           <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Lightbulb size={16} />
                <h4 className="text-[11px] font-black uppercase italic">Refinement Guide</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">2D plans lack Z-axis data. To refine the BOQ, type these values in the chat:</p>
              <ul className="space-y-2">
                 <CheckItem label="Standard Floor Height" />
                 <CheckItem label="Slab Thickness (mm)" />
                 <CheckItem label="Concrete Grade (M25/M30)" />
                 <CheckItem label="Brick Size (Inches)" />
              </ul>
           </div>

           <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Uploaded Plans</h4>
             {uploadedFiles.map((f, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-zinc-100 dark:border-white/5 rounded-2xl">
                 <FileText size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{f.name}</span>
               </div>
             ))}
             <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border border-dashed border-zinc-300 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">Add More Plans</button>
           </div>
        </div>

        {/* Center: BOQ Display */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {isProcessing && boqItems.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
                 <div className="relative">
                    <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                      <Loader2 className="animate-spin text-indigo-500" size={64} />
                    </div>
                    <Sparkles size={24} className="absolute top-0 right-0 text-indigo-500 animate-pulse" />
                 </div>
                 <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Analyzing Material Scope</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Scaling Area x Logic = Quantity Output</p>
                 </div>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center text-indigo-500">
                  <FileSpreadsheet size={48} />
                </div>
                <div className="max-w-md">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Technical Extraction</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload blueprints to map all required materials (Cement, Steel, Brick count, etc.). If the model needs more data, use the <b>Clarification Console</b>.</p>
                </div>
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-indigo-500/50 group">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png,.jpeg" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-zinc-50 dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <UploadCloud size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scan Master Plans</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-zinc-200 dark:border-white/5 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12"><Ruler size={140} /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Material Mapping Active</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">BOQ <span className="text-indigo-500">Extraction</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{boqItems.length} Material Groups Identified • IS-1200 Logic</p>
                  </div>
                  <button onClick={() => runExtraction()} className="relative z-10 flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                    <Zap size={16}/> Re-Analyze plans
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-6">Material Description & Reasoning</th>
                        <th className="px-8 py-6">Category</th>
                        <th className="px-8 py-6 text-right">Computed Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {boqItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-indigo-500/5 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.description}</div>
                             <div className="text-[10px] text-slate-400 font-medium italic flex items-center gap-2">
                               <Info size={12} className="text-indigo-400" /> {item.reasoning}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase border border-zinc-200 dark:border-white/5">{item.category}</span>
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-sm font-black text-indigo-600">
                            {item.qty?.toLocaleString()} <span className="text-[10px] text-slate-400 font-black ml-1 uppercase">{item.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-indigo-500/5 p-8 rounded-[3rem] border border-indigo-500/10">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg"><Settings2 size={24}/></div>
                      <div>
                        <h4 className="text-lg font-black text-indigo-900 dark:text-indigo-100 uppercase italic leading-none">Integrate to Suite</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Sync mapped quantities to Project Dashboard for procurement tracking</p>
                      </div>
                   </div>
                   <button onClick={() => onSyncToSuite(boqItems, uploadedFiles.map(f => f.name), targetProjectId === 'new' ? undefined : targetProjectId, syncMode)} className="flex items-center gap-4 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                      <ArrowRight size={18} /> Sync Mapping
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Console: Clarification & Refinement Chat */}
        <div className="w-[450px] flex flex-col bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-white/5">
          <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-slate-950/30">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
               <HelpCircle size={16} className="text-indigo-500"/> Clarification Console
            </h3>
            
            <div className="space-y-3">
              {questions.length > 0 ? (
                questions.map((q, i) => (
                  <div key={i} className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{q}"</p>
                    <div className="flex gap-2">
                       <input 
                         placeholder="Type clarification here..." 
                         className="flex-1 bg-white dark:bg-slate-950 border border-amber-500/30 rounded-xl py-2 px-4 text-[11px] text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 outline-none" 
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             answerQuestion(q, (e.target as HTMLInputElement).value);
                             (e.target as HTMLInputElement).value = '';
                           }
                         }}
                       />
                       <button className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"><ArrowRight size={14}/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] opacity-30">
                  <div className="bg-emerald-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mapping Context Sufficient</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-950/10 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <MessageSquare size={12}/> Refinement Thread
               </span>
               <button onClick={() => setChatHistory([])} className="text-[9px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest">Clear History</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 space-y-6 opacity-30">
                   <Sparkles size={48} className="text-indigo-400" />
                   <div className="space-y-2">
                     <p className="text-[11px] font-black uppercase tracking-widest">Interactive Calibration</p>
                     <p className="text-[10px] font-medium leading-relaxed italic text-slate-500">Provide missing Z-axis data (like slab thickness or floor height) to increase quantity accuracy.</p>
                   </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-3xl text-[11px] leading-relaxed shadow-md ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-zinc-200 dark:border-white/5 rounded-tl-none italic'
                  }`}>
                    {msg.role === 'assistant_question' && <span className="block text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">Technical Inquiry</span>}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-slate-950 border-t border-zinc-200 dark:border-white/5">
              <form onSubmit={handleChatSubmit} className="relative">
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask to refine quantities or provide heights..."
                  className="w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-6 pr-16 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm transition-all"
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
    </div>
  );
};

const CheckItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
    <div className="w-4 h-4 rounded-full border border-amber-500/40 flex items-center justify-center">
      <Check size={10} className="text-amber-500 opacity-50" />
    </div>
    {label}
  </div>
);

export default BoqExtractor;
