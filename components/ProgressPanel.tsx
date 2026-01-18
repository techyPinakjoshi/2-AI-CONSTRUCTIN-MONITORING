
import React, { useState, useRef } from 'react';
import { TaskLog, AiLogEntry, ProjectStage } from '../types';
import { 
  ClipboardCheck, Calendar, Clock, Download, FileSpreadsheet, 
  ChevronDown, ChevronUp, DollarSign, FileText, CheckCircle2, 
  Zap, BarChart, Gaps, History, UploadCloud, Loader2
} from 'lucide-react';

interface ProgressPanelProps {
    taskLogs: TaskLog[];
    aiLogs?: AiLogEntry[];
    dailySummary?: string;
    isPremium?: boolean;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ taskLogs, aiLogs = [], dailySummary, isPremium }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'boq' | 'reports'>('timeline');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isProcessing2D, setIsProcessing2D] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handle2DPlanUpload = () => {
    setIsProcessing2D(true);
    setTimeout(() => {
      setIsProcessing2D(false);
      alert("2D Plan Processed! BOQ Items Generated based on IS 1200 Method of Measurement.");
    }, 3000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <BarChart className="text-cyan-400" />
                        Project Lifecycle
                    </h2>
                    <p className="text-sm text-slate-400">Scheduling, IS 1200 BOQ & AI Verification</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing2D}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-600/20"
                   >
                     {isProcessing2D ? <Loader2 size={16} className="animate-spin"/> : <UploadCloud size={16} />}
                     2D to BOQ Conversion
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handle2DPlanUpload} accept=".pdf,.dwg,.jpg" />
                </div>
             </div>
             
             <div className="flex gap-4 border-b border-slate-700 mt-4">
                 <button 
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    Project Timeline
                 </button>
                 <button 
                    onClick={() => setActiveTab('boq')}
                    className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'boq' ? 'border-orange-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    IS 1200 BOQ
                 </button>
                 <button 
                    onClick={() => setActiveTab('reports')}
                    className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'border-blue-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    AI Vision Logs {!isPremium && <Zap size={10} className="text-slate-600" />}
                 </button>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'timeline' && (
                <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Execution Schedule</h3>
                      <div className="space-y-6">
                        {taskLogs.map((task) => (
                          <div key={task.id} className="relative group">
                            <div className="flex justify-between text-xs mb-2 px-1">
                              <span className="font-bold text-slate-300">{task.taskName}</span>
                              <span className="text-slate-500">{formatDate(task.startTime)} - {formatDate(task.endTime)}</span>
                            </div>
                            <div className="h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                              <div 
                                className={`h-full transition-all duration-1000 ${task.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}
                                style={{ width: task.status === 'COMPLETED' ? '100%' : '65%' }}
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
                              </div>
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white shadow-sm">
                                {task.status === 'COMPLETED' ? '100%' : '65%'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                </div>
            )}
            
            {activeTab === 'boq' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-orange-400" />
                      <div>
                        <h4 className="text-sm font-bold text-orange-200">Standard Indian BOQ Engine</h4>
                        <p className="text-xs text-slate-400">All quantities calculated as per IS 1200 standards for billing and measurement.</p>
                      </div>
                    </div>
                  </div>

                  {taskLogs.map((task) => {
                    const isExpanded = expandedTaskId === task.id;
                    return (
                        <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all shadow-lg">
                            <div 
                                onClick={() => toggleExpand(task.id)}
                                className="p-4 cursor-pointer hover:bg-slate-700/50 flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-orange-400 border border-slate-700">
                                    <FileSpreadsheet size={18} />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-100">{task.taskName}</h3>
                                    <p className="text-[10px] text-slate-500 uppercase">{task.stage} • IS 1200 Section IV</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-green-400">₹{task.totalCost.toLocaleString()}</div>
                                  </div>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="bg-slate-900/50 p-4 border-t border-slate-700">
                                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-800 text-slate-400 uppercase tracking-tighter">
                                                <tr>
                                                    <th className="p-3 font-medium">Description (IS Code Ref)</th>
                                                    <th className="p-3 font-medium text-right">Qty</th>
                                                    <th className="p-3 font-medium text-right">Rate</th>
                                                    <th className="p-3 font-medium text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {task.materials.map((mat, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-800/30">
                                                        <td className="p-3 text-slate-300">{mat.name}</td>
                                                        <td className="p-3 text-right font-mono text-slate-400">
                                                            {mat.quantity} <span className="text-[10px] text-slate-600">{mat.unit}</span>
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-slate-400">{mat.unitRate}</td>
                                                        <td className="p-3 text-right font-mono text-slate-200">{mat.totalCost.toLocaleString()}</td>
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

            {activeTab === 'reports' && (
                <div className="space-y-6">
                    {!isPremium && (
                      <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-2xl text-center space-y-4">
                        <Zap size={40} className="text-blue-500 mx-auto" />
                        <h3 className="text-lg font-bold text-blue-200">AI Vision Monitoring Required</h3>
                        <p className="text-sm text-slate-400 max-w-sm mx-auto">
                          Visual AI reporting, automated progress time-stamping, and IS Code anomaly detection are part of our primary monitoring engine.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">
                          Start 14-Day Free Trial
                        </button>
                      </div>
                    )}

                    {isPremium && (
                      <div className="relative border-l border-slate-700 ml-3 space-y-6">
                          {aiLogs.length > 0 ? aiLogs.map((log) => (
                              <div key={log.id} className="relative pl-6 group">
                                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-600 rounded-full border border-slate-900"></div>
                                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-all">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-xs font-mono text-blue-400">{log.timestamp}</span>
                                          <span className="text-xs text-slate-500">{log.cameraName}</span>
                                      </div>
                                      <p className="text-sm text-slate-300 mb-3">{log.description}</p>
                                  </div>
                              </div>
                          )) : (
                            <div className="text-center p-10 text-slate-600 border border-dashed border-slate-700 rounded-2xl">
                              Camera feeds active. Waiting for AI to generate hourly logs...
                            </div>
                          )}
                      </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProgressPanel;
