
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Bot, User, ArrowRight, ShieldCheck, 
  FileText, Layout, UploadCloud, Loader2, CheckCircle2,
  Calendar, Clock, BarChart3, Calculator, MessageSquare, Lock, Crown,
  Layers, Video, ClipboardList, History, Plus
} from 'lucide-react';
import { getRegulatoryAdvice } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
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
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingBOQ, setIsProcessingBOQ] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('construct_chat_history');
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('construct_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setIsTyping(true);

    const newMsgs = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMsgs);

    try {
      // Add a timeout or safety catch to ensure UI doesn't hang
      const response = await Promise.race([
        getRegulatoryAdvice(userMsg),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), 15000))
      ]);
      
      const finalMsgs = [...newMsgs, { role: 'assistant', content: response } as Message];
      setMessages(finalMsgs);
      updateHistory(userMsg, finalMsgs);
    } catch (error) {
      setMessages([...newMsgs, { role: 'assistant', content: "I'm having trouble connecting to the network. Please check your connection or try again in a moment." } as Message]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateHistory = (firstUserMsg: string, allMsgs: Message[]) => {
    const title = firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg;
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title,
      messages: allMsgs,
      timestamp: new Date().toLocaleString()
    };
    setChatHistory(prev => [newSession, ...prev.slice(0, 9)]);
  };

  const startNewChat = () => {
    setMessages([{ role: 'assistant', content: 'New session started. How can I assist your site operations?' }]);
  };

  const loadChat = (session: ChatSession) => {
    setMessages(session.messages);
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
      <aside className="hidden lg:flex w-80 bg-slate-950 border-r border-white/5 flex-col p-6 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg">
              <Zap size={20} className="text-white fill-white"/>
            </div>
            <span className="font-black text-xl tracking-tighter text-white uppercase italic">Construct<span className="text-cyan-400">AI</span></span>
        </div>

        <button 
          onClick={startNewChat}
          className="w-full flex items-center gap-3 p-3 mb-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all active:scale-95"
        >
          <Plus size={16} className="text-cyan-400" /> New Discussion
        </button>
        
        <div className="space-y-10 flex-1">
          <section>
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-6 px-1 flex items-center gap-2">
               <History size={12} /> Recent Chats
            </h3>
            <div className="space-y-2">
              {chatHistory.length > 0 ? chatHistory.map((chat) => (
                <button 
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-300 truncate group-hover:text-cyan-400">{chat.title}</div>
                  <div className="text-[9px] text-slate-600 mt-1 font-mono">{chat.timestamp}</div>
                </button>
              )) : (
                <div className="px-1 text-[10px] text-slate-600 italic">No recent history. Your compliance queries will appear here.</div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-6 px-1">Services</h3>
            <div className="space-y-3">
              <ServiceItem icon={<MessageSquare size={14} className="text-cyan-400" />} title="AI Chatbot" />
              <ServiceItem icon={<Calculator size={14} className="text-orange-400" />} title="2D Plan to BOQ" />
              <ServiceItem icon={<ClipboardList size={14} className="text-green-400" />} title="Dashboard" />
              <ServiceItem icon={<Video size={14} className="text-blue-400" />} title="AI Vision" />
            </div>
          </section>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
           {user ? (
             <button onClick={onEnterApp} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl py-4 text-[10px] font-black flex items-center justify-center gap-3 group transition-all shadow-2xl uppercase tracking-widest italic">
               <Crown size={14} className="text-yellow-400" /> Unlock AI Monitoring
             </button>
           ) : (
             <button onClick={onAuthRequired} className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-4 text-[10px] font-black border border-white/5 transition-all uppercase tracking-widest">
               Get Started
             </button>
           )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative grid-bg overflow-y-auto selection:bg-cyan-500/30">
        <header className="lg:hidden p-5 border-b border-white/5 flex justify-between items-center bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-cyan-400 fill-cyan-400"/>
              <span className="font-black text-xl text-white tracking-tighter uppercase italic">ConstructAI</span>
            </div>
            <button onClick={onAuthRequired} className="text-[10px] font-black uppercase tracking-widest bg-cyan-600 px-5 py-2 rounded-lg text-white">Sign In</button>
        </header>

        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-3xl px-6 py-8 md:py-12 flex-1 flex flex-col">
            <div className="text-center mb-10 animate-in fade-in duration-700">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase italic">
                Construct<span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-black tracking-[0.4em] uppercase mb-3 flex items-center justify-center gap-3">
                Intelligent Construction Management
              </p>
              <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-medium">
                The future of civil engineering. From AI-driven BOQs to real-time site vision, we power India's modern infrastructure.
              </p>
            </div>

            <div className="space-y-6 mb-8 flex-1">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ${m.role === 'assistant' ? 'bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-xl' : 'px-6'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'assistant' ? 'bg-gradient-to-br from-cyan-600 to-blue-700' : 'bg-slate-800 border border-white/10'}`}>
                    {m.role === 'assistant' ? <Bot size={18} className="text-white"/> : <User size={18} className="text-white"/>}
                  </div>
                  <div className="text-sm md:text-base leading-relaxed text-slate-300 flex-1 pt-1.5 font-medium">
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4 md:gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-xl">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={18} className="text-white"/>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="sticky bottom-0 pb-6 bg-[#020617]/50 backdrop-blur-sm pt-4">
              <form onSubmit={handleSend} className="relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask IS Code 456 queries..."
                  className="w-full bg-[#0a1128]/80 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-5 pr-14 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/40 outline-none transition-all shadow-2xl"
                  disabled={isTyping}
                />
                <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-3 bottom-2.5 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-xl active:scale-90 disabled:opacity-50">
                  <Send size={18}/>
                </button>
              </form>
            </div>

            <section className="bg-gradient-to-br from-slate-900/40 to-black border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group transition-all hover:border-orange-500/20 mb-10">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                  <Calculator size={32} className="text-orange-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-black text-white mb-2 uppercase italic tracking-tight">
                    2D Plan to <span className="text-orange-400">BOQ</span>
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">
                    Generate PWD-standard quantity takeoffs from structural drawings in seconds.
                  </p>
                </div>
                
                {user ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={handleBOQUploadClick}
                      disabled={isProcessingBOQ}
                      className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-3 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 italic"
                    >
                      {isProcessingBOQ ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                      {isProcessingBOQ ? 'Analysing...' : 'Upload Plan'}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleBOQFileChange} accept=".pdf,.dwg,.jpg,.png" />
                  </div>
                ) : (
                  <button onClick={onAuthRequired} className="bg-white/5 hover:bg-white/10 text-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all shadow-2xl">
                    <Lock size={14} className="text-orange-400 mr-2 inline" /> Login to Extract
                  </button>
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

const ServiceItem = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-cyan-500/20 transition-all cursor-default">
    <div className="p-1.5 bg-slate-900 rounded-lg border border-white/5 group-hover:bg-cyan-500/10 transition-colors">
      {icon}
    </div>
    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-slate-200">{title}</h4>
  </div>
);

export default LandingChat;
