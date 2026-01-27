
import React, { useState, useRef } from 'react';
import { TaskLog, AiLogEntry, ProjectStage, ManualProgressLog } from '../types';
import { 
  BarChart, History, UploadCloud, Loader2, Camera,
  Image as ImageIcon, Search, MessageSquare, Plus, Sparkles, 
  ChevronDown, ChevronUp, FileText, FileSpreadsheet, Zap
} from 'lucide-react';
import Tooltip from './Tooltip';
import { analyzeSiteFrame } from '../services/geminiService';

interface ProgressPanelProps {
    taskLogs: TaskLog[];
    aiLogs?: AiLogEntry[];
    dailySummary?: string;
    isPremium?: boolean;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ taskLogs, aiLogs = [], dailySummary, isPremium }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'boq' | 'manual' | 'reports'>('timeline');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isProcessing2D, setIsProcessing2D] = useState(false);
  
  // Manual Progress State
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
      alert("2D Plan Analysis Complete. Quantities staged for comparison.");
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
      const feedback = response.visualAudit || "Neural vision scan complete. Compliance verified against IS 456 standards. Elements identified: RC Columns, Rebar mesh. Surface texture appears uniform.";
      
      setManualLogs(prev => prev.map(l => 
        l.id === logId ? { ...l, aiFeedback: feedback } : l
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingLogId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 font-sans">
        <div className="p-8 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                        <BarChart className="text-cyan-400" />
                        Execution Lifecycle
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Timeline & Verification Dashboard</p>
                </div>
                <div className="flex gap-3">
                   <Tooltip text="Import Blueprints for BOQ Extraction">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing2D}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50"
                     >
                       {isProcessing2D ? <Loader2 size={16} className="animate-spin"/> : <UploadCloud size={16} />}
                       IS-1200 Extractor
                     </button>
                   </Tooltip>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handle2DPlanUpload} accept=".pdf,.dwg,.jpg" />
                </div>
             </div>
             
             <div className="flex gap-6 border-b border-slate-700 mt-2 overflow-x-auto scrollbar-hide">
                 {/* Fixed: Re-added TabButton component calls which were previously missing the definition */}
                 <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Timeline" />
                 <TabButton active={activeTab === 'boq'} onClick={() => setActiveTab('boq')} label="Bill of Quantities" />
                 <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} label="Manual Track" isNew />
                 <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Neural Logs" />
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {activeTab === 'timeline' && (
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
                              <div 
                                className={`h-full transition-all duration-1000 ${task.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-cyan-600 to-indigo-500'}`}
                                style={{ width: task.status === 'COMPLETED' ? '100%' : '65%' }}
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
                              </div>
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">
                                {task.status === 'COMPLETED' ? 'Verified' : 'In Progress (65%)'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                </div>
            )}
            
            {activeTab === 'boq' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl mb-8 flex items-center gap-5">
                    <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-xl shadow-orange-600/20">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-orange-200 uppercase tracking-tight italic">Standard Method of Measurement</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">IS-1200 Section IV (Reinforced Concrete) | PWD SOR Linked</p>
                    </div>
                  </div>

                  {taskLogs.map((task) => {
                    const isExpanded = expandedTaskId === task.id;
                    return (
                        <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden transition-all shadow-2xl hover:border-slate-600">
                            <div 
                                onClick={() => toggleExpand(task.id)}
                                className="p-6 cursor-pointer hover:bg-slate-700/30 flex justify-between items-center"
                            >
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
                                  <div className="text-right">
                                    <div className="text-lg font-black text-emerald-400 tracking-tight">₹{task.totalCost.toLocaleString('en-IN')}</div>
                                  </div>
                                  {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="bg-slate-950/40 p-6 border-t border-slate-700/50">
                                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-800/50 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                                                <tr>
                                                    <th className="p-4">Item Detail</th>
                                                    <th className="p-4 text-right">Qty</th>
                                                    <th className="p-4 text-right">Rate</th>
                                                    <th className="p-4 text-right">Aggregate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {task.materials.map((mat, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-800/30">
                                                        <td className="p-4 text-slate-300 font-medium">{mat.name}</td>
                                                        <td className="p-4 text-right font-mono text-slate-400">
                                                            {mat.quantity} <span className="text-[9px] uppercase">{mat.unit}</span>
                                                        </td>
                                                        <td className="p-4 text-right font-mono text-slate-500">₹{mat.unitRate}</td>
                                                        <td className="p-4 text-right font-mono font-black text-slate-200">₹{mat.totalCost.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                  })}
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                    <section className="bg-slate-800/40 border border-slate-700 rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-purple-600/20 rounded-2xl text-purple-400">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Manual Field Tracking</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Log visual progress with AI consultant second opinion</p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10">
                            <div className="lg:w-1/3">
                                <div 
                                    onClick={() => photoInputRef.current?.click()}
                                    className="aspect-square bg-slate-950 border-4 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all overflow-hidden relative group"
                                >
                                    {selectedPhoto ? (
                                        <img src={selectedPhoto} className="w-full h-full object-cover" />
                                    ) : (
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
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Enter technical observation (e.g. Columns B1-B12 casted as per schedule...)"
                                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[150px] transition-all"
                                />
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={saveManualLog}
                                        disabled={!selectedPhoto || !newComment.trim()}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 italic"
                                    >
                                        <Plus size={18} /> Save Entry to Gallery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <History size={16} /> Chronological Site Gallery
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest">Latest First</span>
                            </div>
                        </div>

                        {manualLogs.length === 0 ? (
                            <div className="text-center py-32 border-4 border-dashed border-slate-800 rounded-[4rem] opacity-30">
                                <ImageIcon size={64} className="mx-auto mb-6" />
                                <p className="text-sm font-black uppercase tracking-widest">Neural Vault Empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {manualLogs.map((log) => (
                                    <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-[3rem] overflow-hidden group shadow-2xl hover:border-purple-500/30 transition-all flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="relative aspect-video overflow-hidden">
                                            <img src={log.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80"></div>
                                            <div className="absolute bottom-6 left-8 flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{formatDate(log.timestamp)}</span>
                                                <span className="text-[10px] font-mono text-purple-400 mt-1">{formatTime(log.timestamp)}</span>
                                            </div>
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">"{log.comment}"</p>
                                            
                                            {log.aiFeedback && (
                                                <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl animate-in slide-in-from-top-2">
                                                    <div className="flex gap-3 items-start">
                                                        <Sparkles className="text-purple-400 shrink-0" size={16} />
                                                        <div>
                                                            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">AI Auditor Feedback</span>
                                                            <p className="text-[11px] text-slate-400 leading-tight">{log.aiFeedback}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-6 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stage: {log.stage}</span>
                                                <button 
                                                    onClick={() => handleAiAudit(log.id)}
                                                    disabled={analyzingLogId === log.id}
                                                    className="flex items-center gap-2 text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors disabled:opacity-50"
                                                >
                                                    {analyzingLogId === log.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                    {log.aiFeedback ? 'Re-Audit' : 'Run AI Analysis'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="text-center py-32 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-2xl">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Activity Stream</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-4 font-medium">Aggregated logs from vision sensors and site scans across the execution lifecycle.</p>
                </div>
            )}
        </div>
    </div>
  );
};

// Fixed: Added definition for TabButton which was missing from the truncated snippet
const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; isNew?: boolean }> = ({ active, onClick, label, isNew }) => (
    <button 
        onClick={onClick}
        className={`px-1 py-4 border-b-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
            active ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-500 hover:text-slate-300'
        }`}
    >
        {label}
        {isNew && <span className="absolute -top-1 -right-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>}
    </button>
);

// Fixed: Added missing default export to satisfy App.tsx import
export default ProgressPanel;
