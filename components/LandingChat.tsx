
import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  Send, Bot, User, Building2, Waves, Milestone, FlaskConical, 
  Sparkles, Globe, Moon, Sun, ArrowRight, MessageSquare,
  Box, Calculator, Video, ShieldCheck, Plus, Mic, Loader2,
  LayoutDashboard, HardDrive, Briefcase, FileText, Layers, ChevronRight, Zap
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';
import { ThemeContext } from '../App';
import BimSynthesisView from './BimSynthesisView';

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  imageUrl?: string;
}

const APP_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f172a'/%3E%3Cpath d='M20 45 Q50 15 80 45 L80 55 Q50 35 20 55 Z' fill='%23f97316'/%3E%3Crect x='30' y='55' width='40' height='30' rx='8' fill='white'/%3E%3Ccircle cx='40' cy='70' r='4' fill='%2306b6d4'/%3E%3Ccircle cx='60' cy='70' r='4' fill='%2306b6d4'/%3E%3Cpath d='M45 80 Q50 85 55 80' stroke='%230f172a' fill='none' stroke-width='2'/%3E%3C/svg%3E`;
const FALLBACK_LOGO = "./logo.png";

const CATEGORIES = [
  { id: 'buildings', name: 'Buildings', icon: <Building2 size={12} />, prompt: 'Tell me about residential building codes (IS 456).' },
  { id: 'dams', name: 'Dams', icon: <Waves size={12} />, prompt: 'What are the safety codes for gravity dams in India?' },
  { id: 'testing', name: 'Materials', icon: <FlaskConical size={12} />, prompt: 'Standard tests for concrete grade M25 (IS 2386).' },
];

interface LandingChatProps {
  onAuthRequired: () => void;
  onEnterApp: () => void;
  onOpenBoqDashboard: () => void;
  onOpenBoqExtractor: () => void;
  user: any;
  children?: React.ReactNode;
}

const LandingChat: React.FC<LandingChatProps> = ({ onAuthRequired, onEnterApp, onOpenBoqDashboard, onOpenBoqExtractor, user, children }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBimSynthesis, setShowBimSynthesis] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() || isTyping) return;

    if (!showChatWindow) setShowChatWindow(true);

    const userMsg = finalInput;
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const responseText = await getRegulatoryAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural link lost. Re-establishing connection..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
      
      {/* GLOBAL NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-[60] bg-white/10 dark:bg-slate-950/10 backdrop-blur-md border-b border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-1 border border-cyan-500/30">
             <img src={FALLBACK_LOGO} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic dark:text-white">WEAUTOMATES</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-slate-800 text-slate-500 transition-all border border-zinc-200 dark:border-white/5">
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
          <button onClick={onAuthRequired} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
            {user ? 'Account' : 'Secure Entry'}
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex flex-col md:flex-row h-full pt-20">
        
        {/* LEFT: HERO & FEATURES */}
        <div className={`flex-1 overflow-y-auto px-6 md:px-12 py-10 transition-all duration-700 ${showChatWindow ? 'md:max-w-xl lg:max-w-2xl' : 'max-w-full'}`}>
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-left-6 duration-1000">
            
            <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-500">
                <Sparkles size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Site Intelligence</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[0.95] uppercase italic tracking-tighter">
                Unified <span className="text-cyan-500">Monitoring</span> & Operations.
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl font-medium leading-relaxed italic">
                Bridging the gap between 2D plans, BIM design, and real-time site reality with Weautomates Vision AI.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={onEnterApp}
                  className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-cyan-600/20 active:scale-95 transition-all flex items-center gap-3 italic"
                >
                  <Video size={20} /> Start Site Monitor
                </button>
                <button 
                  onClick={onOpenBoqDashboard}
                  className="px-8 py-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 text-slate-900 dark:text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-all shadow-xl flex items-center gap-3"
                >
                  <LayoutDashboard size={20} /> Project Dashboard
                </button>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature: 2D TO BIM */}
              <div 
                onClick={() => setShowBimSynthesis(true)}
                className="group p-8 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-xl hover:border-cyan-500 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Box size={120} /></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 mb-6 group-hover:scale-110 transition-transform">
                    <Box size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">2D to BIM Model</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Neural 3D Reconstruction</p>
                  <div className="mt-8 flex items-center text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                    Initialize Engine <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Feature: 2D TO BOQ */}
              <div 
                onClick={onOpenBoqExtractor}
                className="group p-8 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-xl hover:border-amber-500 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Calculator size={120} /></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                    <Calculator size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">2D to BOQ Extraction</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">IS-1200 Material Audit</p>
                  <div className="mt-8 flex items-center text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                    Run Analysis <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT: REGULATORY CHAT ASSISTANT */}
        <div className={`relative flex flex-col bg-zinc-50 dark:bg-slate-900 transition-all duration-700 border-l border-zinc-200 dark:border-white/5 ${showChatWindow ? 'flex-1' : 'w-16 md:w-24'}`}>
           {!showChatWindow ? (
             <div className="flex flex-col items-center py-10 gap-8 h-full">
                <button 
                  onClick={() => setShowChatWindow(true)}
                  className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl hover:scale-110 transition-all"
                >
                   <MessageSquare size={24} />
                </button>
                <div className="flex-1 flex flex-col items-center gap-10">
                   <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">IS-CODE ASSISTANT ACTIVE</div>
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
                <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg"><Bot size={18}/></div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">IS-Code Expert</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Online Guidance</span>
                        </div>
                      </div>
                   </div>
                   <button onClick={() => setShowChatWindow(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ChevronRight size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-6 opacity-40">
                         <MessageSquare size={48} className="text-slate-400" />
                         <p className="text-sm font-medium italic">"Ask me about IS-456 standards, concrete curing, or safety compliance on GIFT City projects."</p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center p-1.5 ${m.role === 'assistant' ? 'bg-slate-950 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-zinc-200 dark:border-white/5'}`}>
                                {m.role === 'assistant' ? <Bot size={14}/> : <User size={14}/>}
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${m.role === 'assistant' ? 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-zinc-200 dark:border-white/5' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-1 items-center pl-10">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-slate-900">
                    <div className="flex flex-wrap gap-2 mb-4">
                       {CATEGORIES.map(cat => (
                          <button 
                            key={cat.id} 
                            onClick={() => handleSend(undefined, cat.prompt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-white/5 hover:border-cyan-500 transition-all"
                          >
                            <span className="text-slate-400">{cat.icon}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{cat.name}</span>
                          </button>
                       ))}
                    </div>
                    <form onSubmit={handleSend} className="relative">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a query..."
                            className="w-full bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-[12px] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 shadow-lg"
                        >
                            <Send size={14} className="fill-current"/>
                        </button>
                    </form>
                </div>
             </div>
           )}
        </div>
      </main>

      {showBimSynthesis && <BimSynthesisView onClose={() => setShowBimSynthesis(false)} />}
      
      {children}
    </div>
  );
};

export default LandingChat;
