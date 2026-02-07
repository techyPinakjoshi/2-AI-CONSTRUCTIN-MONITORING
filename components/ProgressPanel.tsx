
import React, { useState, useRef } from 'react';
import { TaskLog, AiLogEntry, ProjectStage, ManualProgressLog } from '../types';
import { 
  BarChart, History, UploadCloud, Loader2, Camera,
  Image as ImageIcon, Search, MessageSquare, Plus, Sparkles, 
  ChevronDown, ChevronUp, FileText, FileSpreadsheet, Zap,
  Activity, Calendar
} from 'lucide-react';
import Tooltip from './Tooltip';
import { analyzeSiteFrame } from '../services/geminiService';

interface ProgressPanelProps {
    taskLogs: TaskLog[];
    aiLogs?: AiLogEntry[];
    dailySummary?: string;
    isPremium?: boolean;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ taskLogs = [], aiLogs = [], dailySummary, isPremium }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'boq' | 'manual' | 'reports'>('timeline');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isProcessing2D, setIsProcessing2D] = useState(false);
  
  const [manualLogs, setManualLogs] = useState<ManualProgressLog[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analyzingLogId, setAnalyzingLogId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handle2DPlanUpload = () => {
    setIsProcessing2D(true);
    setTimeout(() => {
      setIsProcessing2D(false);
    }, 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedPhoto(reader.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const saveManualLog = () => {
    if (!selectedPhoto || !newComment.trim()) return;

    const newLog: ManualProgressLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: selectedPhoto,
      comment: newComment,
      stage: ProjectStage.STRUCTURAL
    };

    setManualLogs(prev => [newLog, ...prev]);
    setSelectedPhoto(null);
    setNewComment('');
  };

  const handleAiAudit = async (logId: string) => {
    const log = manualLogs.find(l => l.id === logId);
    if (!log) return;

    setAnalyzingLogId(logId);
    try {
      const response = await analyzeSiteFrame(log.imageUrl, log.stage, "Manual Field Entry");
      const feedback = response.visualAudit || "Neural vision scan complete. Compliance verified.";
      setManualLogs(prev => prev.map(l => l.id === logId ? { ...l, aiFeedback: feedback } : l));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingLogId(null);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 font-sans">
        <div className="p-8 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                        <BarChart className="text-cyan-400" />
                        Project Execution
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Live Timeline & Field Logs</p>
                </div>
                <div className="flex gap-3">
                   <Tooltip text="Import Blueprints for Extraction">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing2D}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                     >
                       {isProcessing2D ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16} />}
                       IS-1200 Extractor
                     </button>
                   </Tooltip>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handle2DPlanUpload} accept=".pdf,.dwg,.jpg" />
                </div>
             </div>
             
             <div className="flex gap-6 border-b border-slate-700 mt-2 overflow-x-auto scrollbar-hide">
                 <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Timeline" />
                 <TabButton active={activeTab === 'boq'} onClick={() => setActiveTab('boq')} label="Bill of Quantities" />
                 <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} label="Manual Track" isNew />
                 <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Neural Logs" />
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {activeTab === 'timeline' && (
                <div className="h-full">
                    {taskLogs.length === 0 ? (
                        <div className="h-full py-32 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                             <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-600 mb-6">
                                <Calendar size={40} />
                             </div>
                             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">No Tasks Scheduled</h3>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed italic">Your project timeline is a clean slate. Connect a drone feed or manually log progress to begin the neural mapping.</p>
                             <button onClick={() => setActiveTab('manual')} className="mt-8 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                                Log First Activity
                             </button>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <section>
                              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Master Project Schedule</h3>
                              <div className="space-y-8">
                                {taskLogs.map((task) => (
                                  <div key={task.id} className="relative group">
                                    <div className="flex justify-between text-[11px] mb-3 px-1 uppercase font-black tracking-widest text-slate-400 group-hover:text-cyan-400 transition-colors">
                                      <span>{task.taskName}</span>
                                      <span className="font-mono">{formatDate(task.startTime)} - {formatDate(task.endTime)}</span>
                                    </div>
                                    <div className="h-10 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
                                      <div className={`h-full transition-all duration-1000 ${task.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-cyan-600 to-indigo-500'}`} style={{ width: task.status === 'COMPLETED' ? '100%' : '65%' }}>
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'boq' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  {taskLogs.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mb-6">
                            <FileSpreadsheet size={32} />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Quantities Repository Empty</h3>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest max-w-sm">Use the IS-1200 Extractor button above to derive quantities from project drawings.</p>
                      </div>
                  ) : (
                    taskLogs.map((task) => {
                      const isExpanded = expandedTaskId === task.id;
                      return (
                          <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden transition-all shadow-2xl hover:border-slate-600">
                              <div onClick={() => toggleExpand(task.id)} className="p-6 cursor-pointer hover:bg-slate-700/30 flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-400 border border-slate-800 shadow-inner">
                                      <FileSpreadsheet size={22} />
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{task.taskName}</h3>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{task.stage} • SOR REF 2.1.4</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-right"><div className="text-lg font-black text-emerald-400 tracking-tight">₹{task.totalCost.toLocaleString('en-IN')}</div></div>
                                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                                  </div>
                              </div>
                          </div>
                      );
                    })
                  )}
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                    <section className="bg-slate-800/40 border border-slate-700 rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-purple-600/20 rounded-2xl text-purple-400"><Camera size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Manual Field Tracking</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Log visual progress with AI consultant verification</p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10">
                            <div className="lg:w-1/3">
                                <div onClick={() => photoInputRef.current?.click()} className="aspect-square bg-slate-950 border-4 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all overflow-hidden relative group">
                                    {selectedPhoto ? <img src={selectedPhoto} className="w-full h-full object-cover" /> : (
                                        <div className="text-center p-6">
                                            <ImageIcon className="text-slate-700 group-hover:text-purple-500 transition-colors mx-auto mb-4" size={48} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Drop Site Frame</span>
                                        </div>
                                    )}
                                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                            <div className="lg:w-2/3 flex flex-col">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">Observation Commentary</label>
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Describe current site work..." className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[150px] transition-all" />
                                <div className="mt-6 flex justify-end">
                                    <button onClick={saveManualLog} disabled={!selectedPhoto || !newComment.trim()} className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 italic">
                                        <Plus size={18} /> Save Entry to Gallery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="text-center py-32 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-2xl"><Activity size={32} /></div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Activity Stream</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-4 font-medium italic">Your site hasn't generated any neural activity yet. Start by uploading a site photo or plan.</p>
                </div>
            )}
        </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; isNew?: boolean }> = ({ active, onClick, label, isNew }) => (
    <button onClick={onClick} className={`px-1 py-4 border-b-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
        {label}
        {isNew && <span className="absolute -top-1 -right-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>}
    </button>
);

export default ProgressPanel;
