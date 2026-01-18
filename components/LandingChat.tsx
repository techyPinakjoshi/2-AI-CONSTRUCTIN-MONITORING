
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Bot, User, ArrowRight, ShieldCheck, 
  FileText, Layout, UploadCloud, Loader2, CheckCircle2,
  Calendar, Clock, BarChart3, Calculator, MessageSquare, Lock
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LandingChatProps {
  onAuthRequired: () => void;
  onEnterApp: () => void;
  user: any;
  children: React.ReactNode;
}

const LandingChat: React.FC<LandingChatProps> = ({ onAuthRequired, onEnterApp, user, children }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to ConstructAI. I can assist with IS Code compliance (IS 456, 800, 1200) or general project planning. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingBOQ, setIsProcessingBOQ] = useState(false);
  const [showBOQPreview, setShowBOQPreview] = useState(false);
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
    fileInputRef.current?.click();
  };

  const handleBOQFileChange = () => {
    setIsProcessingBOQ(true);
    setTimeout(() => {
      setIsProcessingBOQ(false);
      setShowBOQPreview(true);
    }, 2500);
  };

  const boqData = [
    { item: '1.1', desc: 'Earthwork in excavation (IS 1200-I)', qty: 450, unit: 'cum', rate: 250, amount: 112500 },
    { item: '2.4', desc: 'PCC 1:4:8 in foundation (IS 1200-II)', qty: 85, unit: 'cum', rate: 4200, amount: 357000 },
    { item: '3.1', desc: 'TMT Reinforcement (IS 1786)', qty: 4.5, unit: 'mt', rate: 65000, amount: 292500 },
  ];

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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-5">Core Capabilities</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator size={14} className="text-orange-400" />
                  <span className="text-xs font-bold">IS 1200 Compliant</span>
                </div>
                <p className="text-[10px] text-slate-500">Standard measurement methods for Indian projects.</p>
              </div>
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-cyan-400" />
                  <span className="text-xs font-bold">4D Timeline</span>
                </div>
                <p className="text-[10px] text-slate-500">Scheduled execution vs Real-time reality.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Project Roadmap</h3>
            <div className="relative pl-4 border-l border-slate-800 space-y-4">
              <div className="relative"><div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]"></div><span className="text-[10px] font-bold block text-slate-300">Phase 1: Planning</span><span className="text-[9px] text-slate-500 italic">2D Plan -> BOQ</span></div>
              <div className="relative"><div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700"></div><span className="text-[10px] font-bold block text-slate-500">Phase 2: Execution</span><span className="text-[9px] text-slate-500 italic">AI Vision Tracking</span></div>
              <div className="relative"><div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700"></div><span className="text-[10px] font-bold block text-slate-500">Phase 3: Handover</span><span className="text-[9px] text-slate-500 italic">Digital Twin Sync</span></div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           {user ? (
             <button onClick={onEnterApp} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 group transition-all shadow-lg shadow-cyan-600/20">
               Go to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
             </button>
           ) : (
             <button onClick={onAuthRequired} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 text-sm font-bold border border-slate-700 transition-all shadow-lg active:scale-95">
               Register to Build
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
            {/* Centered Intro as requested by previous version style */}
            {messages.length < 3 && (
              <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot size={32} className="text-cyan-400"/>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Indian Civil AI</h1>
                <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                  Instant IS Code advice and 2D Plan auditing. Register to access the 3D Digital Twin and BOQ generation tools.
                </p>
              </div>
            )}

            {/* Chat History in Middle */}
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

            {/* Chat Input Floating in Middle Zone */}
            <form onSubmit={handleSend} className="relative group pt-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about IS 456, BOQ formats, or material quantities..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 pr-14 text-sm md:text-base text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-2xl group-hover:border-slate-700"
              />
              <button type="submit" className="absolute right-3 bottom-2 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                <Send size={20}/>
              </button>
            </form>

            <div ref={chatEndRef} className="pb-8" />

            {/* 2D to BOQ Tool Beneath Chatbot */}
            <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group mt-12 mb-10">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText size={140} />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight flex items-center gap-2">
                  <Calculator size={24} className="text-orange-400" />
                  2D Plan to <span className="text-orange-400">BOQ Tool</span>
                </h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-lg">
                  Automate quantity take-offs. Upload blueprints to generate instant IS 1200 compliant bills. 
                  {!user && <span className="block mt-2 font-bold text-orange-400 flex items-center gap-1"><Lock size={12}/> Login required to start conversion.</span>}
                </p>
                
                {!showBOQPreview ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={handleBOQUploadClick}
                      disabled={isProcessingBOQ}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-600/20"
                    >
                      {isProcessingBOQ ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                      {isProcessingBOQ ? 'Extracting Measurements...' : 'Upload 2D Plan'}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleBOQFileChange} />
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden mb-6">
                      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Draft BOQ (IS 1200)</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <table className="w-full text-[10px] md:text-xs text-left">
                        <thead className="text-slate-500 uppercase font-bold border-b border-slate-800">
                          <tr><th className="p-3">Item</th><th className="p-3">Description</th><th className="p-3 text-right">Estimate</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {boqData.map((b, i) => (
                            <tr key={i} className="text-slate-300">
                              <td className="p-3 font-mono">{b.item}</td>
                              <td className="p-3">{b.desc}</td>
                              <td className="p-3 text-right font-bold text-white">₹{b.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button 
                      onClick={onEnterApp} 
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      Go to Project Dashboard <ArrowRight size={16} />
                    </button>
                  </div>
                )}
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
