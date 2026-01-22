
import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  Send, Zap, Bot, User, Building2, Waves, Milestone, FlaskConical, 
  Sparkles, Globe, Moon, Sun, ArrowRight, X, ImageIcon, MessageSquare,
  Box, Calculator, Layout, Video, ShieldCheck, Cpu, Mic, Plus
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';
import { ThemeContext } from '../App';

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
  imageUrl?: string;
}

const CATEGORIES = [
  { id: 'buildings', name: 'Buildings', icon: <Building2 size={14} />, color: 'bg-blue-600', prompt: 'Tell me about residential building codes (IS 456).' },
  { id: 'dams', name: 'Dams', icon: <Waves size={14} />, color: 'bg-cyan-600', prompt: 'What are the safety codes for gravity dams in India?' },
  { id: 'bridges', name: 'Bridges', icon: <Milestone size={14} />, color: 'bg-indigo-600', prompt: 'IRC standards for highway bridge construction.' },
  { id: 'testing', name: 'Materials', icon: <FlaskConical size={14} />, color: 'bg-amber-600', prompt: 'Standard tests for concrete grade M25 (IS 2386).' },
];

const LandingChat: React.FC<any> = ({ onAuthRequired, onEnterApp, onOpenBoqDashboard, user, children }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      
      let responseImg: string | undefined = undefined;
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('concrete') || lowerMsg.includes('m25')) {
          responseImg = "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2070";
      } else if (lowerMsg.includes('dam')) {
          responseImg = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText, imageUrl: responseImg }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural link lost. Re-establishing..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative">
      
      {/* FIXED SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-white/5 flex-col p-6 overflow-y-auto shrink-0 z-50 shadow-2xl relative">
        <div className="mb-10 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl shadow-lg">
            <Zap size={18} className="text-white fill-white"/>
          </div>
          <span className="font-black text-lg tracking-tighter uppercase italic dark:text-white">Construct<span className="text-cyan-500">AI</span></span>
        </div>

        <nav className="space-y-4 flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Core Tools</h3>
            <div className="space-y-1">
                <ServiceLink icon={<MessageSquare size={14}/>} label="Neural Chat" active />
                <ServiceLink icon={<Calculator size={14}/>} label="BOQ Engine" onClick={onOpenBoqDashboard} />
                <ServiceLink icon={<Box size={14}/>} label="BIM Reconstruction" onClick={onEnterApp} />
                <ServiceLink icon={<Video size={14}/>} label="Vision Monitor" onClick={onEnterApp} />
            </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 flex flex-col gap-3">
           <button onClick={toggleTheme} className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-slate-800 text-slate-500 border border-zinc-200 dark:border-white/5 transition-all">
              <span className="text-[10px] font-bold uppercase tracking-widest">Theme</span>
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
           </button>
           <button onClick={onAuthRequired} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95">
              Portal Access
           </button>
        </div>
      </aside>

      {/* Main Container - Centered Alignment for Branding Symmetry */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-700 relative overflow-y-auto pt-20">
        
        {/* SYMMETRICAL BRANDING GROUP */}
        <div className="flex flex-col items-center w-full max-w-2xl mb-12 text-center">
            <span className="text-4xl md:text-5xl font-black uppercase tracking-[0.6em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse-slow mb-8">
              WEAUTOMATES
            </span>
            
            <div className={`transition-all duration-500 ${messages.length > 0 ? 'mb-4' : 'mb-0'}`}>
               <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug px-4">
                 Welcome! I’m your Construction AI Assistant. How can I help you monitor, analyze, or manage your project today?
               </h1>
            </div>
        </div>

        {/* Chat / Content Flow */}
        <div className={`w-full max-w-2xl transition-all duration-500 overflow-hidden flex flex-col ${messages.length > 0 ? 'flex-1 mb-4' : 'h-0 opacity-0'}`}>
            <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide py-2">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${m.role === 'assistant' ? 'bg-zinc-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
                            {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
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
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>

        {/* Search Bar Input */}
        <div className="w-full max-w-2xl px-4">
            <form onSubmit={handleSend} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button type="button" className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <Plus size={18} />
                   </button>
                </div>
                
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about IS codes or site progress..."
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
            
            <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60 hover:opacity-100 transition-opacity pb-8">
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

        {/* REFINED 2D PLAN TO boq ACTION */}
        {!messages.length && (
          <div className="mt-4 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-1000">
             <button 
                onClick={onOpenBoqDashboard}
                className="w-full group relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 p-8 rounded-[2rem] flex items-center justify-between shadow-2xl transition-all hover:border-fuchsia-500/50 hover:scale-[1.01] active:scale-95"
             >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                   <Calculator size={100} className="text-fuchsia-500" />
                </div>
                <div className="relative z-10 flex items-center gap-8">
                   <div className="p-5 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-amber-500 rounded-2xl shadow-xl shadow-fuchsia-500/20 text-white">
                      <Calculator size={32} />
                   </div>
                   <div className="text-left">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">2D PLAN TO boq</h3>
                   </div>
                </div>
                <div className="relative z-10 w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-fuchsia-500 group-hover:text-white group-hover:translate-x-2 transition-all">
                   <ArrowRight size={24} />
                </div>
             </button>
             
             <div className="grid grid-cols-2 gap-3 mt-3 pb-12">
                <button onClick={onEnterApp} className="p-4 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center gap-3 hover:border-cyan-500/50 transition-all shadow-xl group">
                   <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500 group-hover:scale-110 transition-transform"><ShieldCheck size={16}/></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 text-left">Regulatory Vault</span>
                </button>
                <button onClick={onEnterApp} className="p-4 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center gap-3 hover:border-amber-500/50 transition-all shadow-xl group">
                   <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 group-hover:scale-110 transition-transform"><Video size={16}/></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 text-left">Vision Monitor</span>
                </button>
             </div>
          </div>
        )}
      </main>
      
      {children}
    </div>
  );
};

const ServiceLink = ({ icon, label, onClick, active }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${active ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:bg-zinc-100 dark:hover:bg-white/5'}`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-cyan-600 text-white' : 'bg-zinc-50 dark:bg-slate-800'} group-hover:scale-110 transition-transform shadow-sm shrink-0`}>{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-tight truncate">{label}</span>
  </button>
);

export default LandingChat;
