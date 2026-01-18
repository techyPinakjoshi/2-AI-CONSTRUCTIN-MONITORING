
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Bot, User, ArrowRight, ShieldCheck, 
  FileText, Layout, UploadCloud, Loader2, CheckCircle2,
  Calendar, Clock, BarChart3, Calculator, MessageSquare, Lock, Crown
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
    { role: 'assistant', content: 'Welcome to ConstructAI. I can assist with IS Code compliance (IS 456, 800, 1200) or general project planning. How can I help you today?' }
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
        onOpenBoqDashboard(); // Open the NEW project management dashboard
      }, 3000);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 bg-slate-900 border-r border-slate-800 flex-col p-5 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Zap size={20} className="text-white"/>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ConstructAI</span>
        </div>
        
        <div className="space-y-8 flex-1">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-5">Enterprise Suite</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 group hover:border-orange-500/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator size={14} className="text-orange-400" />
                  <span className="text-xs font-bold">PWD SOR 2025-26</span>
                </div>
                <p className="text-[10px] text-slate-500">Official Schedule of Rates Engine.</p>
              </div>
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 group hover:border-cyan-500/50 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-cyan-400" />
                  <span className="text-xs font-bold">Timeline Synth</span>
                </div>
                <p className="text-[10px] text-slate-500">Predictive Project Scheduling.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">AI Integration Level</h3>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-slate-400">Compliance Sync</span>
                 <span className="text-[10px] font-bold text-green-500">Live</span>
               </div>
               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500 w-full"></div>
               </div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-3">
           {user ? (
             <button onClick={onEnterApp} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 group transition-all shadow-xl shadow-blue-600/20">
               <Crown size={16} className="text-yellow-400" /> Unlock AI Monitoring <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
             </button>
           ) : (
             <button onClick={onAuthRequired} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 text-sm font-bold border border-slate-700 transition-all shadow-lg active:scale-95">
               Register Account
             </button>
           )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative grid-bg overflow-y-auto">
        <header className="lg:hidden p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-cyan-400"/>
              <span className="font-bold text-white tracking-tight">ConstructAI</span>
            </div>
            <button onClick={onAuthRequired} className="text-xs font-bold bg-cyan-600 px-4 py-1.5 rounded-lg">Log In</button>
        </header>

        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-3xl px-4 md:px-6 py-10 md:py-20 flex-1 space-y-8">
            {/* Centered Intro */}
            {messages.length < 3 && (
              <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot size={32} className="text-cyan-400"/>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase italic">CONSTRUCT<span className="text-cyan-400">AI</span> 2026</h1>
                <p className="text-slate-500 text-sm font-bold tracking-[0.3em] uppercase mb-4">India's Premier BIM-Vision Engine</p>
                <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                  Real-time IS Code auditing and automated BOQ generation. Upload blueprints to initialize your project dashboard.
                </p>
              </div>
            )}

            {/* Chat History */}
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'assistant' ? 'bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/50 shadow-xl' : 'px-5 md:px-8'}`}>
                  <div className={`w-8 md:w-10 h-8 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'assistant' ? 'bg-gradient-to-br from-cyan-600 to-blue-700' : 'bg-slate-700 border border-slate-600'}`}>
                    {m.role === 'assistant' ? <Bot size={20} className="text-white"/> : <User size={20} className="text-white"/>}
                  </div>
                  <div className="text-sm md:text-base leading-relaxed text-slate-300 flex-1 pt-1 md:pt-2">
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4 md:gap-6 bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-800/50 shadow-xl">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={20} className="text-white"/>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="relative group pt-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query IS 456 compliance or material quantity takeoffs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 pr-14 text-sm md:text-base text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-2xl group-hover:border-slate-700"
              />
              <button type="submit" className="absolute right-3 bottom-2.5 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                <Send size={20}/>
              </button>
            </form>

            <div ref={chatEndRef} className="pb-8" />

            {/* 2D to BOQ Tool */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group mt-12 mb-10 transition-all hover:border-orange-500/30">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layout size={180} />
              </div>
              
              <div className="relative z-10 text-center max-w-xl mx-auto">
                <div className="inline-flex p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Calculator size={32} className="text-orange-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight uppercase italic">
                  2D-to-BOQ <span className="text-orange-400">Synthesis Engine</span>
                </h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Transform structural blueprints into precise, PWD SOR 2025-26 compliant quantities and execution timelines. 
                </p>
                
                {user ? (
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button 
                      onClick={handleBOQUploadClick}
                      disabled={isProcessingBOQ}
                      className="flex-1 max-w-xs bg-orange-600 hover:bg-orange-500 text-white rounded-2xl py-5 px-8 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-600/20"
                    >
                      {isProcessingBOQ ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                      {isProcessingBOQ ? 'Scanning Architectural Layers...' : 'Initialize Conversion'}
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
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-2xl font-bold border border-slate-700 transition-all"
                  >
                    <Lock size={16} /> Sign In to Generate Dashboard
                  </button>
                )}
                
                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                   <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">IS 1200</span>
                   <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PWD SOR</span>
                   <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CPWD 2026</span>
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

export default LandingChat;
