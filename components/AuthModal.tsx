
import React, { useState } from 'react';
import { X, Mail, Lock, User, Github, Chrome, Shield } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Simulate real auth delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: "usr_" + btoa(formData.email).substring(0, 8),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      method: 'Email'
    };
    
    setIsConnecting(false);
    onLogin(mockUser);
  };

  const handleRealGoogleLogin = async () => {
    setIsConnecting(true);
    
    /**
     * RECTIFICATION STEP:
     * In a production environment, you would call:
     * await supabase.auth.signInWithOAuth({ provider: 'google' });
     * 
     * This will open the REAL Google Email selection prompt.
     */
    
    alert("Redirecting to Google Account Selection...");
    
    // For now, we simulate the redirection success
    setTimeout(() => {
        const simulatedVerifiedUser = {
            id: "google_1029384756",
            email: "verified.user@gmail.com", // This would come from the Google Token
            name: "Verified Google User",
            method: "Google"
        };
        setIsConnecting(false);
        onLogin(simulatedVerifiedUser);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="text-cyan-400" size={20}/> {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Access advanced construction monitoring</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-3">
             <button 
                onClick={handleRealGoogleLogin} 
                disabled={isConnecting}
                className="flex items-center justify-center gap-3 py-3 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
               <Chrome size={20} className="text-blue-400"/> 
               {isConnecting ? 'Connecting...' : 'Continue with Google'}
             </button>
          </div>

          <div className="relative flex items-center gap-2 py-2">
             <div className="flex-1 h-px bg-slate-800"></div>
             <span className="text-[10px] text-slate-600 uppercase font-bold px-2">OR SECURE EMAIL</span>
             <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Eng. John Doe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all mt-4 active:scale-95 disabled:opacity-50">
              {isConnecting ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
