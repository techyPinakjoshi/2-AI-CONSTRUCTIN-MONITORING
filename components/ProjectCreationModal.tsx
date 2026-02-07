
import React, { useState } from 'react';
import { X, Building2, Zap, Home, Building, Factory, Loader2, ArrowRight, CheckCircle2, Calculator, Box, Layers } from 'lucide-react';
import { PROJECT_TEMPLATES } from '../constants';

interface ProjectCreationModalProps {
  onClose: () => void;
  onCreate: (project: any) => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [services, setServices] = useState<{boq: boolean, bim: boolean}>({ boq: true, bim: true });
  const [isCreating, setIsCreating] = useState(false);

  const isFormValid = name.trim().length >= 3;

  const handleCreate = () => {
    if (!isFormValid || isCreating) return;
    setIsCreating(true);
    
    setTimeout(() => {
      onCreate({ 
        name, 
        template: selectedTemplate || 'Custom Infrastructure',
        services,
        status: 'INITIALIZING',
        health: 'HEALTHY',
        boq: [],
        bimData: null,
        clarifications: [],
        documents: [],
        activityLog: [{ timestamp: new Date().toISOString(), action: 'Project Initialized', user: 'Operator' }]
      });
    }, 1000);
  };

  const toggleService = (service: 'boq' | 'bim') => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        
        <div className="p-10 border-b border-zinc-100 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-800/20 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Initialize Project</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Define Scope & Neural Services</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Section 1: Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Identifier</label>
            <input 
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Terminal 3 Expansion"
              className="w-full bg-zinc-100 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 rounded-2xl py-5 px-6 text-base font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Section 2: Services */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Neural Services Selection</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => toggleService('boq')}
                className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-4 ${services.boq ? 'bg-cyan-500/10 border-cyan-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-slate-800 opacity-60'}`}
              >
                <div className={`p-3 rounded-xl w-fit ${services.boq ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <Calculator size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase italic">2D to BOQ</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">Automated IS-1200 quantity extraction from plans.</p>
                </div>
              </button>

              <button 
                onClick={() => toggleService('bim')}
                className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-4 ${services.bim ? 'bg-indigo-500/10 border-indigo-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-slate-800 opacity-60'}`}
              >
                <div className={`p-3 rounded-xl w-fit ${services.bim ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <Box size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase italic">2D to BIM</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">Synthesize 3D Digital Twins from 2D blueprints.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Template (Optional) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Structure Type</label>
            <div className="flex flex-wrap gap-2">
              {['Residential', 'Commercial', 'Industrial', 'Infrastructure'].map(tpl => (
                <button 
                  key={tpl}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedTemplate === tpl ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'bg-transparent border-zinc-200 dark:border-slate-800 text-slate-500'}`}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-10 border-t border-zinc-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={handleCreate}
            disabled={!isFormValid || isCreating}
            className="px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3 italic"
          >
            {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-white" />}
            Initialize Project Hub
            {!isCreating && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
