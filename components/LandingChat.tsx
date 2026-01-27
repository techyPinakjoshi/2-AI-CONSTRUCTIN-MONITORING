
import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  Send, Bot, User, Building2, Waves, Milestone, FlaskConical, 
  Sparkles, Globe, Moon, Sun, ArrowRight, MessageSquare,
  Box, Calculator, Video, ShieldCheck, Plus, Mic, Loader2,
  LayoutDashboard, HardDrive, Briefcase, FileText, Presentation, Layers
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';
import { ThemeContext } from '../App';
import PitchDeck from './PitchDeck';
import BimSynthesisView from './BimSynthesisView';

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  imageUrl?: string;
}

const APP_LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f172a'/%3E%3Cpath d='M20 45 Q50 15 80 45 L80 55 Q50 35 20 55 Z' fill='%23f97316'/%3E%3Crect x='30' y='55' width='40' height='30' rx='8' fill='white'/%3E%3Ccircle cx='40' cy='70' r='4' fill='%2306b6d4'/%3E%3Ccircle cx='60' cy='70' r='4' fill='%2306b6d4'/%3E%3Cpath d='M45 80 Q50 85 55 80' stroke='%230f172a' fill='none' stroke-width='2'/%3E%3C/svg%3E`;
const FALLBACK_LOGO = "./logo.png";

const CATEGORIES = [
  { id: 'buildings', name: 'Buildings', icon: <Building2 size={14} />, color: 'bg-blue-600', prompt: 'Tell me about residential building codes (IS 456).' },
  { id: 'dams', name: 'Dams', icon: <Waves size={14} />, color: 'bg-cyan-600', prompt: 'What are the safety codes for gravity dams in India?' },
  { id: 'bridges', name: 'Bridges', icon: <Milestone size={14} />, color: 'bg-indigo-600', prompt: 'IRC standards for highway bridge construction.' },
  { id: 'testing', name: 'Materials', icon: <FlaskConical size={14} />, color: 'bg-amber-600', prompt: 'Standard tests for concrete grade M25 (IS 2386).' },
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
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [showBimSynthesis, setShowBimSynthesis] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() || isTyping) return;

    const userMsg = finalInput;
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const responseText = await getRegulatoryAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural link lost. Re-establishing connection to Regulatory database..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-white/5 flex col p-6 overflow-y-auto shrink-0 z-50 shadow-2xl relative">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500/30 shadow-lg bg-slate-900 flex items-center justify-center">
             <img 
               src={FALLBACK_LOGO} 
               alt="Logo" 
               className="w-full h-full object-contain" 
               onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }}
             />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic dark:text-white">Construct<span className="text-cyan-500">AI</span></span>
        </div>

        <nav className="space-y-6 flex-1">
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Enterprise Suite</h3>
              <div className="space-y-1">
                  <ServiceLink icon={<LayoutDashboard size={14}/>} label="Client Portal" onClick={onOpenBoqDashboard} active />
                  <ServiceLink icon={<HardDrive size={14}/>} label="CDE Vault" onClick={onOpenBoqDashboard} />
                  <ServiceLink icon={<Briefcase size={14}/>} label="Contract Ledger" onClick={onOpenBoqDashboard} />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Site Intelligence</h3>
              <div className="space-y-1">
                  <ServiceLink icon={<Box size={14}/>} label="BIM Synthesis" onClick={() => setShowBimSynthesis(true)} />
                  <ServiceLink icon={<Video size={14}/>} label="AI Vision Monitor" onClick={onEnterApp} />
                  <ServiceLink icon={<Calculator size={14}/>} label="2D to BOQ Engine" onClick={onOpenBoqExtractor} />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">iCreate Pitch</h3>
              <div className="space-y-1">
                  <ServiceLink 
                    icon={<Presentation size={14} className="text-purple-500" />} 
                    label="View Pitch Deck" 
                    onClick={() => setShowPitchDeck(true)} 
                    className="border border-purple-500/20 bg-purple-500/5"
                  />
              </div>
            </section>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-3">
           <button onClick={toggleTheme} className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-slate-800 text-slate-500 border border-zinc-200 dark:border-white/5 transition-all">
              <span className="text-[10px] font-bold uppercase tracking-widest">Theme</span>
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
           </button>
           <button onClick={onAuthRequired} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95">
              Secure Access
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-700 relative overflow-y-auto pt-20">
        
        {/* BRANDING */}
        <div className="flex flex-col items-center w-full max-w-2xl mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] bg-slate-950 mb-10 transition-transform hover:scale-105 duration-500 flex items-center justify-center p-2">
               <img 
                 src={FALLBACK_LOGO} 
                 alt="Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }}
               />
            </div>

            <span className="text-4xl md:text-6xl font-black uppercase tracking-[0.6em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.3)] mb-10">
              WEAUTOMATES
            </span>
            
            <div className={`transition-all duration-500 ${messages.length > 0 ? 'mb-4' : 'mb-0'}`}>
               <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug px-4">
                 Unified Project Management & Monitoring.
               </h1>
            </div>
        </div>

        {/* Chat Flow */}
        <div className={`w-full max-w-2xl transition-all duration-500 overflow-hidden flex flex-col ${messages.length > 0 ? 'flex-1 mb-4' : 'h-0 opacity-0'}`}>
            <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide py-2">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-slate-950 p-1`}>
                            {m.role === 'assistant' ? (
                                <img src={FALLBACK_LOGO} className="w-full h-full object-contain" alt="AI" onError={(e) => { e.currentTarget.src = APP_LOGO_SVG; }} />
                            ) : (
                                <div className="w-full h-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900"><User size={14} /></div>
                            )}
                        </div>
                        <div className={`flex flex-col gap-1.5 max-w-[85%] ${m.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed font-medium ${
                                m.role === 'assistant' 
                                ? 'bg-zinc-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-zinc-100 dark:border-white/10' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                            }`}>
                                {m.content}
                            </div>
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
        </div>

        {/* Input area */}
        <div className="w-full max-w-2xl px-4 pb-10">
            <form onSubmit={handleSend} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <Plus size={18} />
                   </button>
                </div>
                
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about project status or IS codes..."
                    className="w-full bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-full pl-12 pr-24 py-4 text-[14px] text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-xl font-medium"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isTyping}
                        className="w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30 shadow-lg"
                    >
                        <Send size={14} className="fill-current"/>
                    </button>
                </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60 hover:opacity-100 transition-opacity">
               {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => handleSend(undefined, cat.prompt)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-slate-900 border border-zinc-200 dark:border-white/5 hover:border-cyan-500 transition-all shadow-sm"
                  >
                    <div className="text-slate-500">{cat.icon}</div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{cat.name}</span>
                  </button>
               ))}
            </div>
        </div>

        {/* PROJECT ACTION CARDS */}
        {!messages.length && (
          <div className="mt-4 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-1000 space-y-4">
             
             {/* 2D TO BOQ CARD */}
             <button 
                onClick={onOpenBoqExtractor}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-2 border-amber-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all hover:border-amber-500 hover:scale-[1.01] active:scale-95"
             >
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl text-white shadow-xl shadow-amber-600/20">
                      <Calculator size={30} />
                   </div>
                   <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">2D to BOQ</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">AI Quantities & Material Extraction</p>
                   </div>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg">
                   <Plus size={24} />
                </div>
             </button>

             {/* 2D PLAN TO BIM MODEL CARD (NEW) */}
             <button 
                onClick={() => setShowBimSynthesis(true)}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl transition-all hover:border-cyan-500 hover:scale-[1.01] active:scale-95"
             >
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl text-white shadow-xl shadow-cyan-600/20">
                      <Box size={30} />
                   </div>
                   <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">2d plan to BIM model</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">AI-Powered 3D Digital Twin Generation</p>
                   </div>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-lg">
                   <ArrowRight size={24} />
                </div>
             </button>

             {/* PROJECT DASHBOARD CARD */}
             <button 
                onClick={onOpenBoqDashboard}
                className="w-full group relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 p-10 rounded-[2.5rem] flex items-center justify-between shadow-2xl transition-all hover:border-cyan-500 hover:scale-[1.01] active:scale-95"
             >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-700">
                   <LayoutDashboard size={140} className="text-cyan-500" />
                </div>
                <div className="relative z-10 flex items-center gap-8">
                   <div className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-xl shadow-cyan-500/20 text-white flex items-center justify-center">
                      <LayoutDashboard size={40} />
                   </div>
                   <div className="text-left">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Project Dashboard</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Access CDE, Workflows & Financials</p>
                   </div>
                </div>
                <div className="relative z-10 w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-cyan-500 group-hover:text-white group-hover:translate-x-2 transition-all shadow-lg">
                   <ArrowRight size={28} />
                </div>
             </button>
             
             <div className="grid grid-cols-2 gap-3 pb-20">
                <button onClick={onEnterApp} className="p-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-3xl flex items-center gap-4 hover:border-cyan-500/50 transition-all shadow-xl group">
                   <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500 group-hover:scale-110 transition-transform"><Video size={20}/></div>
                   <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 block">Vision Monitor</span>
                     <span className="text-[9px] text-slate-400 font-bold uppercase">Live Site View</span>
                   </div>
                </button>
                <button onClick={onEnterApp} className="p-5 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-3xl flex items-center gap-4 hover:border-purple-500/50 transition-all shadow-xl group">
                   <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform"><Layers size={20}/></div>
                   <div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 block">Digital Twins</span>
                     <span className="text-[9px] text-slate-400 font-bold uppercase">BIM Reconstruction</span>
                   </div>
                </button>
             </div>
          </div>
        )}
      </main>

      {showPitchDeck && <PitchDeck onClose={() => setShowPitchDeck(false)} />}
      {showBimSynthesis && <BimSynthesisView onClose={() => setShowBimSynthesis(false)} />}
      
      {children}
    </div>
  );
};

const ServiceLink = ({ icon, label, onClick, active, className }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${active ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:bg-zinc-100 dark:hover:bg-white/5'} ${className}`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-cyan-600 text-white' : 'bg-zinc-50 dark:bg-slate-800'} group-hover:scale-110 transition-transform shadow-sm shrink-0 flex items-center justify-center`}>{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-tight truncate">{label}</span>
  </button>
);

export default LandingChat;
