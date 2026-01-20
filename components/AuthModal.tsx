
import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, Loader2, AlertCircle, Home } from 'lucide-react';
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

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      // For construction monitoring sites, we use the standard redirect flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });
      if (error) throw error;
      // The page will redirect to Google. 
      // After returning, App.tsx's onAuthStateChange will pick up the session.
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication failed");
      setIsConnecting(false);
    }
  };

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-500">
        <div className="p-8 border-b border-zinc-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase italic tracking-tight">
                <Shield className="text-cyan-500" size={20}/> {mode === 'login' ? 'Access Portal' : 'Join Network'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Personnel Secure Verification</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 space-y-3 animate-in slide-in-from-top-2">
              <div className="flex gap-3 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold leading-tight">{errorMsg}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isConnecting}
            className="w-full bg-white dark:bg-slate-800 hover:bg-zinc-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 border border-zinc-200 dark:border-slate-700 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-800"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Secure Email</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Full Name"
                  className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email address"
                className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Password"
                className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
              />
            </div>

            <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all mt-4 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/20 italic"
            >
              {isConnecting ? <Loader2 className="animate-spin" size={18} /> : (mode === 'login' ? 'Authenticate' : 'Register Operator')}
            </button>
          </form>

          <div className="flex flex-col gap-4 items-center pt-2">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-black text-slate-500 hover:text-cyan-500 uppercase tracking-widest transition-colors"
            >
              {mode === 'login' ? "Need Access? Create Account" : "Registered? Sign In Here"}
            </button>
            <div className="w-8 h-px bg-zinc-100 dark:bg-slate-800"></div>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              <Home size={12} /> Back to Landing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
