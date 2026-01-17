
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Bot, User, ArrowRight, ShieldCheck, ChevronRight, 
  Video, Layers, Package, Plane, BarChart3, MessageSquare 
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
    { role: 'assistant', content: 'Welcome to ConstructAI. I can assist with IS Code compliance, site productivity queries, or general project planning. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const limit = 5;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    if (chatCount >= limit && !user) {
      onAuthRequired();
      return;
    }

    const newMsgs = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);
    setChatCount(prev => prev + 1);

    const response = await getRegulatoryAdvice(input);
    setMessages([...newMsgs, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const services = [
    { icon: <Video size={16}/>, title: "AI Vision Monitoring", desc: "Live site analysis", color: "text-blue-400" },
    { icon: <Layers size={16}/>, title: "BIM 3D Digital Twin", desc: "Design vs Reality sync", color: "text-cyan-400" },
    { icon: <Package size={16}/>, title: "Smart Inventory", desc: "Automated BOQ & Audits", color: "text-purple-400" },
    { icon: <Plane size={16}/>, title: "Drone Topography", desc: "Precision aerial surveys", color: "text-green-400" },
  ];

  const handleServiceClick = () => {
    if (user) onEnterApp();
    else onAuthRequired();
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Discovery Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 flex-col p-5 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Zap size={20} className="text-white"/>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ConstructAI</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-4">Core Modules</h3>
            <div className="space-y-3">
              {services.map((s, i) => (
                <button 
                  key={i} 
                  onClick={handleServiceClick}
                  className="w-full group flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all text-left"
                >
                  <div className={`mt-0.5 ${s.color} group-hover:scale-110 transition-transform`}>{s.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">{s.title}</div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-4">Analytics</h3>
            <button onClick={handleServiceClick} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <BarChart3 size={16}/> <span className="text-xs font-medium">Productivity Benchmarking</span>
            </button>
            <button onClick={handleServiceClick} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <MessageSquare size={16}/> <span className="text-xs font-medium">IS Code Database</span>
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           {user ? (
             <div className="space-y-3">
               <div className="flex items-center gap-3 px-2 mb-4">
                 <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-cyan-400">
                   {user.email[0].toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                   <div className="text-xs font-bold truncate">{user.name || 'User'}</div>
                   <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                 </div>
               </div>
               <button onClick={onEnterApp} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 group transition-all shadow-lg shadow-cyan-600/20">
                 Go to Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
               </button>
             </div>
           ) : (
             <button onClick={onAuthRequired} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3 text-sm font-bold border border-slate-700 transition-all">
               Log In / Sign Up
             </button>
           )}
        </div>
      </aside>

      {/* Main Chat Area - Centered Layout */}
      <main className="flex-1 flex flex-col relative grid-bg">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-cyan-400"/>
              <span className="font-bold text-white tracking-tight">ConstructAI</span>
            </div>
            <button onClick={onAuthRequired} className="text-xs font-bold bg-cyan-600 px-4 py-1.5 rounded-lg">Get Started</button>
        </header>

        {/* Messaging Container */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-3xl px-4 md:px-6 py-10 md:py-20 flex-1 space-y-8">
            
            {/* Centered Welcome Header - Only visible when few messages */}
            {messages.length < 3 && (
              <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Bot size={32} className="text-cyan-400"/>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">AI Construction Assistant</h1>
                <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                  Analyze site progress, verify IS Code compliance, and optimize productivity with specialized civil engineering AI.
                </p>
              </div>
            )}

            {/* Chat Bubbles */}
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

              {/* Limit reached Call-to-Action */}
              {chatCount >= limit && !user && (
                <div className="bg-gradient-to-br from-orange-500/20 to-slate-900 border border-orange-500/30 p-8 rounded-3xl flex flex-col items-center text-center gap-6 animate-in zoom-in duration-500">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-orange-200">Session Limit Reached</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                      Upgrade to a full professional account to continue using the AI assistant and unlock live site monitoring.
                    </p>
                  </div>
                  <button onClick={onAuthRequired} className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2 group">
                    Register Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              )}
            </div>
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area - Fixed at bottom */}
        <div className="w-full bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 p-4 md:p-8">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about construction monitoring, IS Codes, or site productivity..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 pr-14 text-sm md:text-base text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-2xl group-hover:border-slate-700"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
              <Send size={20}/>
            </button>
          </form>
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center mt-4 px-2 gap-2">
            <p className="text-[10px] text-slate-600 flex items-center gap-1">
              <ShieldCheck size={12}/> Verified for IS Code: 456, 800, 1200, 1786
            </p>
            <p className="text-[10px] text-slate-700 italic">
              AI outputs must be verified by licensed engineers.
            </p>
          </div>
        </div>
      </main>
      {children}
    </div>
  );
};

export default LandingChat;
