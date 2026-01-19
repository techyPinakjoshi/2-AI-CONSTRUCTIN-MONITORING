
import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setErrorMsg(null);
    
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { display_name: formData.name }
          }
        });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-tight">
                <Shield className="text-cyan-400" size={20}/> {mode === 'login' ? 'ConstructAI Login' : 'Join ConstructAI'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Next-Gen Construction Monitoring</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Eng. Rajesh Kumar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16}/>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-cyan-900/40 transition-all mt-6 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 italic"
            >
              {isConnecting ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? 'Authenticate' : 'Initialize Access')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
            >
              {mode === 'login' ? "New operative? Create account" : "Existing personnel? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
