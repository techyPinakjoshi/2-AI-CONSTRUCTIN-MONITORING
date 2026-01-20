
import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  Send, Zap, Bot, User, MessageSquare, 
  Calculator, Layout, Video, Sun, Moon,
  ArrowRight, ShieldCheck, Sparkles, Globe
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';
import { ThemeContext } from '../App';

interface Message { role: 'user' | 'assistant'; content: string; }

const LandingChat: React.FC<any> = ({ onAuthRequired, onEnterApp, onOpenBoqDashboard, user, children }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "ConstructAI System Online. I'm your IS Code expert. How can I assist today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    try {
      const response = await getRegulatoryAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sync error. Check connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-500">
      {/* Sidebar - Professional Width */}
      <aside className="hidden lg:flex w-72 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-zinc-200 dark:border-white/5 flex-col p-6 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-xl">
              <Zap size={20} className="text-white fill-white"/>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic dark:text-white">Construct<span className="text-cyan-500">AI</span></span>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-zinc-200 dark:hover:bg-slate-800 rounded-xl transition-all">
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </div>

        <div className="space-y-8 flex-1">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Globe size={12} /> Portal Services
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <ServiceItem icon={<MessageSquare size={16}/>} title="IS Specialist AI" color="text-cyan-500" onClick={() => {}} />
              <ServiceItem icon={<Calculator size={16}/>} title="BOQ Extraction" color="text-orange-500" onClick={onOpenBoqDashboard} />
              <ServiceItem icon={<Layout size={16}/>} title="Site Dashboard" color="text-emerald-500" onClick={onEnterApp} />
              <ServiceItem icon={<Video size={16}/>} title="AI Monitoring" color="text-blue-500" onClick={onEnterApp} />
            </div>
          </section>

          {!user && (
            <section className="bg-cyan-500/5 p-5 rounded-2xl border border-cyan-500/10">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-tight uppercase font-bold tracking-tight">Login required for live monitoring access.</p>
              <button onClick={onAuthRequired} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all">
                Sign In
              </button>
            </section>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative grid-bg overflow-y-auto scrollbar-hide">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-4xl px-8 py-10 flex flex-col items-center">
            
            {/* Professional Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                <Sparkles size={12} className="text-cyan-600 dark:text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Operational v4.0 Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase italic leading-none">
                Construct<span className="text-cyan-500 drop-shadow-2xl">AI</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
                Bridge architectural precision with real-world site execution and automated IS Code compliance.
              </p>
            </div>

            {/* Chat Area - ULTRA COMPACT (Fixed Height: 180px) */}
            <div className="w-full max-w-xl bg-white/70 dark:bg-slate-900/60 rounded-[2rem] p-3 shadow-2xl border border-zinc-200 dark:border-white/5 mb-8 flex flex-col h-[180px] transition-all">
              <div className="flex-1 space-y-2 overflow-y-auto mb-1 pr-2 scrollbar-hide">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-md ${m.role === 'assistant' ? 'bg-cyan-600' : 'bg-slate-800'}`}>
                      {m.role === 'assistant' ? <Bot size={14} className="text-white"/> : <User size={14} className="text-white"/>}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[13px] leading-snug font-medium max-w-[85%] ${m.role === 'assistant' ? 'bg-zinc-100 dark:bg-white/5 text-slate-800 dark:text-slate-200' : 'bg-cyan-600 text-white shadow-md'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-1.5 items-center pl-1 pt-0.5">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Tighter Input Section - No margin above */}
              <form onSubmit={handleSend} className="relative pt-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask IS Code 456 queries..."
                  className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-5 py-3 pr-14 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-1.5 top-[18px] p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all active:scale-90 shadow-lg">
                  <Send size={16}/>
                </button>
              </form>
            </div>

            {/* Quick Actions - Modern Bento Grid */}
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard 
                icon={<Calculator size={20}/>} 
                title="Auto BOQ Extractor" 
                desc="Generate PWD schedule bills from 2D plans instantly."
                color="orange"
                onClick={onOpenBoqDashboard}
              />
              <ActionCard 
                icon={<ShieldCheck size={20}/>} 
                title="IS Compliance Guard" 
                desc="Real-time site verification against Indian Standards."
                color="emerald"
                onClick={onEnterApp}
              />
            </div>
          </div>
        </div>
      </main>
      {children}
    </div>
  );
};

const ServiceItem = ({ icon, title, color, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-white/5 transition-all group text-left">
    <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-slate-800 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
    <span className="text-xs font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{title}</span>
  </button>
);

const ActionCard = ({ icon, title, desc, color, onClick }: any) => {
  const styles = {
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  };
  return (
    <button onClick={onClick} className="flex flex-col p-6 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-zinc-200 dark:border-white/5 text-left hover:scale-[1.02] transition-all group shadow-xl">
      <div className={`p-3 rounded-2xl w-fit mb-4 ${styles[color as keyof typeof styles]}`}>{icon}</div>
      <h4 className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-cyan-500 transition-colors">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-2">{desc}</p>
      <div className="mt-4 flex items-center gap-2 text-slate-400 dark:text-slate-600 group-hover:text-cyan-500 transition-colors">
        <span className="text-[10px] font-black uppercase tracking-widest">Get Operational</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default LandingChat;
