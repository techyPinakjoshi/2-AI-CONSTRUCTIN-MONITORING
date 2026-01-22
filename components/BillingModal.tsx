
import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Zap, Check, ArrowRight, IndianRupee } from 'lucide-react';

interface BillingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BillingModal: React.FC<BillingModalProps> = ({ onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'project'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Gateway redirect/process
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left: Marketing */}
        <div className="md:w-1/2 bg-gradient-to-br from-cyan-600 to-blue-700 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
              <Zap size={24} className="fill-white" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Unlock Neural <span className="text-cyan-200">Monitoring</span></h2>
            <div className="space-y-4">
              <FeatureItem text="Unlimited 3D BIM Synthesis" />
              <FeatureItem text="Live Drone & AI Vision Feeds" />
              <FeatureItem text="IS Code Automated Auditing" />
              <FeatureItem text="Multi-user Collaborative Sync" />
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Secured via Razorpay & Stripe</p>
          </div>
        </div>

        {/* Right: Payment Selection */}
        <div className="md:w-1/2 p-10 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Select Plan</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <PlanCard 
              active={selectedPlan === 'monthly'} 
              onClick={() => setSelectedPlan('monthly')}
              title="Enterprise Monthly"
              price="₹4,999"
              period="/mo"
              desc="Perfect for ongoing multi-site management."
            />
            <PlanCard 
              active={selectedPlan === 'project'} 
              onClick={() => setSelectedPlan('project')}
              title="Per-Project License"
              price="₹14,500"
              period="/project"
              desc="One-time fee for life of the construction."
            />
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-slate-800">
               <CreditCard size={20} className="text-slate-400" />
               <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Saved Method</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
               </div>
               <button className="text-[10px] font-black text-cyan-600 uppercase">Edit</button>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? "Authorizing..." : `Pay ${selectedPlan === 'monthly' ? '₹4,999' : '₹14,500'}`}
              {!isProcessing && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="shrink-0 w-5 h-5 bg-cyan-400/20 rounded-full flex items-center justify-center">
      <Check size={12} className="text-cyan-400" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const PlanCard = ({ active, onClick, title, price, period, desc }: any) => (
  <button 
    onClick={onClick}
    className={`w-full p-5 rounded-3xl border text-left transition-all ${active ? 'bg-cyan-500/5 border-cyan-500 shadow-lg ring-1 ring-cyan-500' : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800'}`}
  >
    <div className="flex justify-between items-start mb-1">
      <h4 className="text-xs font-black uppercase tracking-tight text-slate-500">{title}</h4>
      {active && <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
    </div>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-2xl font-black text-slate-900 dark:text-white">{price}</span>
      <span className="text-xs text-slate-400 font-bold">{period}</span>
    </div>
    <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
  </button>
);

export default BillingModal;
