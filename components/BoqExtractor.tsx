
import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Calculator, X, UploadCloud, Loader2, Sparkles, FileText, 
  Download, ArrowRight, Database, ChevronRight,
  CheckCircle2, Plus, FileSpreadsheet, Zap, Settings2, AlertCircle, Clock, 
  MessageSquare, Send, HelpCircle, Ruler, Info
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
      setError("Analysis timeout. Please try again with clearer files.");
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
    
    // Re-run extraction with the user's new input as context
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
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Quantity <span className="text-indigo-500">Mapper</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Geometric Audit • Zero Pricing Uncertainty</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden bg-zinc-50 dark:bg-slate-950">
        {/* Left Column: Extraction Result */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-zinc-200 dark:border-white/5">
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
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Analyzing Geometry</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Scale • Extracting Linear & Volumetric Units</p>
                 </div>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center text-indigo-500">
                  <FileSpreadsheet size={48} />
                </div>
                <div className="max-w-md">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">Geometric Mapping</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Upload plans to map items. Our AI focuses strictly on <b>accurate measurements</b>. If the scale is unclear, the model will ask for clarification.</p>
                </div>
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-4 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] p-12 transition-all hover:border-indigo-500/50 group">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.dwg,.jpg,.png,.jpeg" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-zinc-50 dark:bg-slate-800 rounded-3xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <UploadCloud size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Scan Blueprints</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-white/5 shadow-xl">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Quantity Audit Complete</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Mapped <span className="text-indigo-500">Quantities</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{boqItems.length} Mapped Elements • IS-1200 Compliant</p>
                  </div>
                  <button onClick={() => runExtraction()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                    <Zap size={16}/> Re-Scan Plan
                  </button>
                </div>

                {/* Main BOQ Table */}
                <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-8 py-6">ID & Item Description</th>
                        <th className="px-8 py-6">Category</th>
                        <th className="px-8 py-6 text-right">Quantity</th>
                        <th className="px-8 py-6 text-center">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {boqItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-indigo-500/5 transition-colors">
                          <td className="px-8 py-6">
                             <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.code || `ITM-${idx+1}`}</div>
                             <div className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.description}</div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase border border-zinc-200 dark:border-white/5">{item.category}</span>
                          </td>
                          <td className="px-8 py-6 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {item.qty?.toLocaleString()} <span className="text-[9px] text-slate-400 font-black">{item.unit}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="w-12 h-1.5 bg-zinc-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                              <div className={`h-full ${item.confidence > 0.9 ? 'bg-emerald-500' : item.confidence > 0.7 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(item.confidence || 0.8) * 100}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"><Settings2 size={20}/></div>
                      <div>
                        <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase italic">Integrate Result</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Sync mapped items to project Suite</p>
                      </div>
                   </div>
                   <button onClick={() => onSyncToSuite(boqItems, uploadedFiles.map(f => f.name), targetProjectId === 'new' ? undefined : targetProjectId, syncMode)} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                      <ArrowRight size={18} /> Sync Mapping
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Clarification Console & Chat */}
        <div className="w-[450px] flex flex-col bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-white/5">
          {/* Status Panel */}
          <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-slate-950/30">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
               <HelpCircle size={16} className="text-indigo-500"/> AI Clarification Console
            </h3>
            
            <div className="space-y-3">
              {questions.length > 0 ? (
                questions.map((q, i) => (
                  <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">"{q}"</p>
                    <div className="flex gap-2">
                       <input 
                         placeholder="Enter answer..." 
                         className="flex-1 bg-white dark:bg-slate-900 border border-amber-500/30 rounded-lg py-1 px-3 text-[10px] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none" 
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             answerQuestion(q, (e.target as HTMLInputElement).value);
                             (e.target as HTMLInputElement).value = '';
                           }
                         }}
                       />
                       <button className="p-1 text-amber-500 hover:bg-amber-500/10 rounded-lg"><ArrowRight size={14}/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[2rem] opacity-40">
                  <div className="bg-emerald-500/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">No Ambiguities Detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Refinement Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-950/10 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <MessageSquare size={12}/> Refinement Thread
               </span>
               <button onClick={() => setChatHistory([])} className="text-[9px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest">Clear History</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4 opacity-30">
                   <Sparkles size={32} className="text-indigo-400" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Chat with AI to refine square footage or identify missing items.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-zinc-200 dark:border-white/5 rounded-tl-none italic'
                  }`}>
                    {msg.role === 'assistant_question' && <span className="block text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Clarification Requested</span>}
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
                  placeholder="Ask AI to adjust sqft or recount items..."
                  className="w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 shadow-lg shadow-indigo-600/20"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoqExtractor;
