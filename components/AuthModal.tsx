
import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, Loader2, AlertCircle, CheckCircle2, Globe, Zap } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', coupon: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleGoogleLogin = async () => {
    setIsConnecting(true);
    // Store coupon in localStorage to pick up after OAuth redirect
    if (formData.coupon.trim()) {
      localStorage.setItem('CONSTRUCT_AI_COUPON', formData.coupon.trim().toUpperCase());
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setErrorMsg(error.message);
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setErrorMsg(null);
    setNeedsVerification(false);
    
    // Store coupon
    if (formData.coupon.trim()) {
      localStorage.setItem('CONSTRUCT_AI_COUPON', formData.coupon.trim().toUpperCase());
    }
    
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
        if (data.user) {
          if (!data.session) {
            setNeedsVerification(true);
          } else {
            onLogin(data.user);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-500">
        <div className="p-8 border-b border-zinc-100 dark:border-slate-800 flex justify-between items-center bg-zinc-50/50 dark:bg-slate-800/20">
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

        <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide">
          <button 
            onClick={handleGoogleLogin}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Globe size={18} className="text-blue-500" />
            Sign in with Google
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-zinc-100 dark:border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">or email access</span>
            <div className="flex-grow border-t border-zinc-100 dark:border-white/5"></div>
          </div>

          {needsVerification && (
            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in zoom-in-95">
              <div className="flex gap-3">
                <CheckCircle2 className="text-amber-500 shrink-0" size={20} />
                <div>
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-tight">Activation Sent</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    Please check <span className="text-slate-900 dark:text-white font-black">{formData.email}</span> for your neural entry link.
                  </p>
                </div>
              </div>
              <button onClick={() => setNeedsVerification(false)} className="w-full py-2 bg-amber-500/20 text-amber-700 text-[10px] font-black uppercase rounded-lg">
                Back to Login
              </button>
            </div>
          )}

          {errorMsg && !needsVerification && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 flex gap-3 items-start animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="text-[11px] font-bold leading-tight italic">{errorMsg}</span>
            </div>
          )}

          {!needsVerification && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Operator Full Name"
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
                    placeholder="Fleet Email"
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
                    placeholder="Terminal Password"
                    className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={16}/>
                    <input 
                      value={formData.coupon}
                      onChange={(e) => setFormData({...formData, coupon: e.target.value})}
                      placeholder="PROMO CODE (e.g. JADU2026)"
                      className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl py-4 pl-12 pr-4 text-sm text-amber-600 dark:text-amber-400 font-black placeholder:text-amber-500/40 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all uppercase"
                    />
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-4">Unlock all services with valid coupon</p>
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
                  {mode === 'login' ? "New Operator? Create Terminal Account" : "Registered Operator? Sign In"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
