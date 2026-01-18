
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Bot, User, ArrowRight, ShieldCheck, 
  FileText, Layout, UploadCloud, Loader2, CheckCircle2,
  Calendar, Clock, BarChart3, Calculator, MessageSquare, Lock, Crown,
  Layers, Video, ClipboardList
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LandingChatProps {
  onAuthRequired: () => void;
  onEnterApp: () => void;
  onOpenBoqDashboard: () => void;
  user: any;
  children: React.ReactNode;
}

const LandingChat: React.FC<LandingChatProps> = ({ onAuthRequired, onEnterApp, onOpenBoqDashboard, user, children }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to ConstructAI. I am your expert assistant for IS Code compliance, material takeoffs, and project monitoring. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingBOQ, setIsProcessingBOQ] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const newMsgs = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    const response = await getRegulatoryAdvice(input);
    setMessages([...newMsgs, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const handleBOQUploadClick = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBOQFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingBOQ(true);
      setTimeout(() => {
        setIsProcessingBOQ(false);
        onOpenBoqDashboard();
      }, 3000);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar - Upgraded with clear service offerings */}
      <aside className="hidden lg:flex w-80 bg-slate-950 border-r border-white/5 flex-col p-8 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Zap size={24} className="text-white fill-white"/>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Construct<span className="text-cyan-400">AI</span></span>
        </div>
        
        <div className="space-y-12 flex-1">
          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-8 px-1">Our Core Services</h3>
            <div className="space-y-4">
              <ServiceItem 
                icon={<MessageSquare size={16} className="text-cyan-400" />}
                title="AI Construction Chatbot"
                desc="Instant IS Code & PWD Query Engine"
              />
              <ServiceItem 
                icon={<Calculator size={16} className="text-orange-400" />}
                title="2D Plan to BOQ"
                desc="Automated Quantity Takeoffs"
              />
              <ServiceItem 
                icon={<ClipboardList size={16} className="text-green-400" />}
                title="Manual Monitoring"
                desc="Task-based PM Dashboard"
              />
              <ServiceItem 
                icon={<Video size={16} className="text-blue-400" />}
                title="AI Monitoring Services"
                desc="Live Vision & Anomaly Detection"
              />
              <ServiceItem 
                icon={<Layers size={16} className="text-purple-400" />}
                title="2D Plan to BIM"
                desc="AI-Driven 3D Model Generation"
              />
            </div>
          </section>

          <section className="bg-gradient-to-br from-slate-900/50 to-transparent p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={18} className="text-cyan-400" />
              <span className="text-xs font-black uppercase text-white">Trust & Compliance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Every calculation is verified against IS 456, 800, and 1200 standards to ensure structural and financial integrity.
            </p>
          </section>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
           {user ? (
             <button onClick={onEnterApp} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl py-5 text-xs font-black flex items-center justify-center gap-3 group transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest italic">
               <Crown size={16} className="text-yellow-400" /> Unlock AI Monitoring <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
             </button>
           ) : (
             <button onClick={onAuthRequired} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl py-5 text-xs font-black border border-white/5 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
               Get Started Free
             </button>
           )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative grid-bg overflow-y-auto selection:bg-cyan-500/30">
        {/* Mobile Header */}
        <header className="lg:hidden p-6 border-b border-white/5 flex justify-between items-center bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Zap size={22} className="text-cyan-400 fill-cyan-400"/>
              <span className="font-black text-2xl text-white tracking-tighter uppercase italic">ConstructAI</span>
            </div>
            <button onClick={onAuthRequired} className="text-[10px] font-black uppercase tracking-widest bg-cyan-600 px-6 py-2.5 rounded-xl text-white shadow-lg">Sign In</button>
        </header>

        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-4xl px-8 md:px-12 py-16 md:py-28 flex-1 space-y-16">
            {/* Hero Section - Refined for "ConstructAI" */}
            {messages.length < 3 && (
              <div className="text-center mb-24 animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="w-24 h-24 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full"></div>
                  <Bot size={48} className="text-cyan-400 relative z-10"/>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic">
                  Construct<span className="text-cyan-400">AI</span>
                </h1>
                <p className="text-slate-500 text-sm font-black tracking-[0.6em] uppercase mb-8 flex items-center justify-center gap-4">
                  <span className="w-12 h-px bg-slate-800"></span> 
                  Intelligent Construction Management
                  <span className="w-12 h-px bg-slate-800"></span>
                </p>
                <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
                  The future of civil engineering. From AI-driven BOQs to real-time site vision, we power India's modern infrastructure.
                </p>
              </div>
            )}

            {/* Chat Interaction - Premium Polish */}
            <div className="space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ${m.role === 'assistant' ? 'bg-white/[0.02] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl' : 'px-8 md:px-12'}`}>
                  <div className={`w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${m.role === 'assistant' ? 'bg-gradient-to-br from-cyan-600 to-blue-700' : 'bg-slate-800 border border-white/10'}`}>
                    {m.role === 'assistant' ? <Bot size={28} className="text-white"/> : <User size={28} className="text-white"/>}
                  </div>
                  <div className="text-lg md:text-xl leading-relaxed text-slate-300 flex-1 pt-2 font-medium">
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-6 md:gap-10 bg-white/[0.02] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
                  <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={28} className="text-white"/>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="relative group pt-8">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query IS Code 456 or request a cost estimation..."
                className="w-full bg-[#0a1128]/80 backdrop-blur-3xl border border-white/10 rounded-[2.2rem] px-10 py-7 pr-20 text-lg md:text-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 outline-none transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-white/20"
              />
              <button type="submit" className="absolute right-5 bottom-4 p-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-all shadow-2xl active:scale-90 disabled:opacity-50">
                <Send size={28}/>
              </button>
            </form>

            <div ref={chatEndRef} className="pb-16" />

            {/* Redesigned 2D Plan to BOQ Section */}
            <section className="bg-gradient-to-br from-slate-900/60 to-black border border-white/10 rounded-[3.5rem] p-12 md:p-20 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group mt-20 mb-20 transition-all hover:border-orange-500/40">
              <div className="absolute top-0 right-0 p-20 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Layout size={400} />
              </div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex p-6 bg-orange-500/10 rounded-[2rem] border border-orange-500/20 mb-10 group-hover:scale-110 transition-transform duration-700 shadow-3xl">
                  <Calculator size={48} className="text-orange-400" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight uppercase italic">
                  2D Plan to <span className="text-orange-400">BOQ</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl mb-14 leading-relaxed font-medium">
                  Upload your structural drawings to generate PWD-standard quantity takeoffs in seconds. Accurate, compliant, and ready for tender.
                </p>
                
                {user ? (
                  <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <button 
                      onClick={handleBOQUploadClick}
                      disabled={isProcessingBOQ}
                      className="flex-1 max-w-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-[1.8rem] py-7 px-12 font-black uppercase tracking-widest flex items-center justify-center gap-5 transition-all active:scale-95 shadow-2xl shadow-orange-900/50 italic text-sm"
                    >
                      {isProcessingBOQ ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
                      {isProcessingBOQ ? 'Analyzing Drawings...' : 'Start Extraction'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleBOQFileChange} 
                      accept=".pdf,.dwg,.jpg,.png" 
                    />
                  </div>
                ) : (
                  <button 
                    onClick={onAuthRequired}
                    className="inline-flex items-center gap-4 bg-white/5 hover:bg-white/10 text-slate-200 px-12 py-6 rounded-2xl font-black uppercase tracking-widest border border-white/10 transition-all shadow-2xl text-xs"
                  >
                    <Lock size={18} className="text-orange-400" /> Access Synthesis Tool
                  </button>
                )}
                
                <div className="mt-16 flex items-center justify-center gap-12 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                   <span className="text-xs font-black tracking-[0.4em] text-slate-400 uppercase">IS 1200</span>
                   <span className="text-xs font-black tracking-[0.4em] text-slate-400 uppercase">PWD SOR</span>
                   <span className="text-xs font-black tracking-[0.4em] text-slate-400 uppercase">BIM 2026</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {children}
    </div>
  );
};

const ServiceItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all cursor-default">
    <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 group-hover:bg-cyan-500/10 transition-colors">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
    </div>
  </div>
);

export default LandingChat;
