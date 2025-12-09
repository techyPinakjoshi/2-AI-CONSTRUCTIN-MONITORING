import React, { useState } from 'react';
import { TaskLog } from '../types';
import { ClipboardCheck, Calendar, Clock, Download, FileSpreadsheet, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { MOCK_TASK_LOGS } from '../constants';

const ProgressPanel: React.FC = () => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const calculateTotalProjectHours = () => {
    return MOCK_TASK_LOGS.reduce((acc, task) => acc + task.durationHours, 0).toFixed(1);
  };

  const calculateTotalCost = () => {
    return MOCK_TASK_LOGS.reduce((acc, task) => acc + task.totalCost, 0).toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="text-green-400" />
                        Project Progress & BOQ
                    </h2>
                    <p className="text-sm text-slate-400">Work Logs, Time Stamping & Material Billing</p>
                </div>
                <div className="flex gap-4 text-right">
                    <div className="bg-slate-800 p-2 px-4 rounded-lg border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Total Hours</div>
                        <div className="text-xl font-mono font-bold text-cyan-400">{calculateTotalProjectHours()} hrs</div>
                    </div>
                    <div className="bg-slate-800 p-2 px-4 rounded-lg border border-slate-700">
                        <div className="text-[10px] text-slate-500 uppercase">Total Cost</div>
                        <div className="text-xl font-mono font-bold text-green-400">₹{calculateTotalCost()}</div>
                    </div>
                </div>
             </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {MOCK_TASK_LOGS.map((task, index) => {
                const isExpanded = expandedTaskId === task.id;
                
                return (
                    <div key={task.id} className="relative pl-6 border-l-2 border-slate-700 hover:border-cyan-500/50 transition-colors">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-300' : 'bg-blue-500 border-blue-300'}`}></div>

                        <div className={`bg-slate-800 rounded-xl border ${isExpanded ? 'border-cyan-500/50' : 'border-slate-700'} overflow-hidden shadow-lg transition-all`}>
                            {/* Card Header (Clickable) */}
                            <div 
                                onClick={() => toggleExpand(task.id)}
                                className="p-4 cursor-pointer hover:bg-slate-700/50 flex justify-between items-start"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-100">{task.taskName}</h3>
                                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{task.stage}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(task.startTime)}
                                        </div>
                                        <span className="text-slate-600">→</span>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatDate(task.endTime)}
                                        </div>
                                        <div className="text-cyan-400 font-mono text-xs bg-cyan-950 px-2 rounded">
                                            Duration: {task.durationHours} hrs
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-400">₹{task.totalCost.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-500">Verified by {task.verifiedBy}</div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                                </div>
                            </div>

                            {/* Expanded Details (BOQ) */}
                            {isExpanded && (
                                <div className="bg-slate-900/50 p-4 border-t border-slate-700 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                            <FileSpreadsheet size={16} /> Bill of Quantities (BOQ)
                                        </h4>
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors">
                                                <FileSpreadsheet size={14} /> Excel
                                            </button>
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors">
                                                <Download size={14} /> Sheets
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800 text-slate-400">
                                                <tr>
                                                    <th className="p-3 font-medium">Item Description</th>
                                                    <th className="p-3 font-medium text-right">Quantity</th>
                                                    <th className="p-3 font-medium text-right">Unit Rate (₹)</th>
                                                    <th className="p-3 font-medium text-right">Amount (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {task.materials.map((mat, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-800/30">
                                                        <td className="p-3 text-slate-300">{mat.name}</td>
                                                        <td className="p-3 text-right font-mono text-slate-400">
                                                            {mat.quantity} <span className="text-[10px] text-slate-600">{mat.unit}</span>
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-slate-400">{mat.unitRate.toLocaleString()}</td>
                                                        <td className="p-3 text-right font-mono text-slate-200">{mat.totalCost.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-800/50 font-bold">
                                                    <td className="p-3 text-slate-400" colSpan={3}>TOTAL TASK COST</td>
                                                    <td className="p-3 text-right text-green-400">₹{task.totalCost.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default ProgressPanel;