
import React, { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle2, MessageSquare, User, Smartphone } from 'lucide-react';

interface ContactUsModalProps {
  onClose: () => void;
  reason?: string;
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({ onClose, reason = "Requesting Service Extension" }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: `I would like to extend my site limits for: ${reason}` });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API call to email service
    setTimeout(() => {
      console.log("Dispatching lead to: pinakjoshi143@gmail.com", form);
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 w-full max-w-md rounded-[3rem] p-12 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Request Received</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
            Your request for service extension has been dispatched to Pinak Joshi. Our technical team will reach out shortly.
          </p>
          <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl">
            Close Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-10 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-slate-800/20 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Connect with <span className="text-cyan-500">Pinak</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Direct Support & Enterprise Limits</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your Name"
                className="w-full bg-zinc-100 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                type="email"
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="Professional Email"
                className="w-full bg-zinc-100 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-6 text-slate-400" size={18}/>
              <textarea 
                required
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder="Describe your site requirements..."
                className="w-full bg-zinc-100 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-3xl py-5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[120px]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 italic"
          >
            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {isSending ? 'Transmitting...' : 'Dispatch Request'}
          </button>
          
          <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Requests are monitored by Pinak Joshi at <span className="text-cyan-600">pinakjoshi143@gmail.com</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactUsModal;
