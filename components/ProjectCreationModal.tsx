
import React, { useState } from 'react';
import { X, Building2, Users, Mail, Plus, CheckCircle2, Crown, Zap, Home, Building, Factory } from 'lucide-react';
import { PROJECT_TEMPLATES } from '../constants';

interface ProjectCreationModalProps {
  onClose: () => void;
  onCreate: (project: any) => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0].id);
  const [teamEmail, setTeamEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const addMember = () => {
    if (teamEmail && teamEmail.includes('@') && !teamMembers.includes(teamEmail)) {
      setTeamMembers([...teamMembers, teamEmail]);
      setTeamEmail('');
    }
  };

  const removeMember = (email: string) => {
    setTeamMembers(teamMembers.filter(m => m !== email));
  };

  const handleCreate = async () => {
    if (!name) return;
    setIsCreating(true);
    const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);
    // Simulate setup
    await new Promise(r => setTimeout(r, 2000));
    onCreate({ 
      name, 
      template: selectedTemplate,
      defaultLayers: template?.defaultLayers,
      teamMembers 
    });
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home size={18} />;
      case 'Building': return <Building size={18} />;
      case 'Factory': return <Factory size={18} />;
      default: return <Building2 size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Building2 size={120} />
        </div>
        
        <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="text-yellow-400" size={18} />
              <h3 className="text-xl font-black text-white uppercase italic">Premium Project Setup</h3>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ConstructAI Neural Instance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Identifier</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Skyline Residency Phase I"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Template</label>
            <div className="grid grid-cols-1 gap-2">
              {PROJECT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                    selectedTemplate === tpl.id 
                    ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/30' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${selectedTemplate === tpl.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {renderIcon(tpl.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xs font-black uppercase tracking-tight ${selectedTemplate === tpl.id ? 'text-blue-400' : 'text-white'}`}>
                      {tpl.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Collaborative Workforce</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                <input 
                  type="email"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                  placeholder="Invite by email id..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                />
              </div>
              <button 
                onClick={addMember}
                className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl border border-slate-700 transition-all active:scale-95"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {teamMembers.map((email) => (
                <div key={email} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 group animate-in fade-in slide-in-from-left-2">
                  {email}
                  <button onClick={() => removeMember(email)} className="hover:text-red-400"><X size={12} /></button>
                </div>
              ))}
              {teamMembers.length === 0 && <span className="text-[10px] text-slate-600 italic">Invite teams to share live monitoring.</span>}
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-slate-900 pb-2">
            <button 
              onClick={handleCreate}
              disabled={isCreating || !name}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic"
            >
              {isCreating ? (
                <>
                  <Zap className="animate-spin" size={20} />
                  Initializing Neural Twin...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Launch Monitoring App
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
