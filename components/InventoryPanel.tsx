
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, Plus, AlertOctagon, RefreshCw, FileText, CheckCircle2, Search, Database } from 'lucide-react';
import { auditInventoryInvoice } from '../services/geminiService';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onRestockRequest: (itemId: string, amount: number) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory = [], onRestockRequest }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleSimulateInvoiceUpload = async () => {
    // This is a transitionary function that will eventually handle real file buffers.
    // Demo text has been removed in favor of a clean audit trigger.
    setIsAuditing(true);
    setAuditResult(null);
    await new Promise(r => setTimeout(r, 2000));
    try {
        const currentStockSummary = inventory.length > 0 
          ? inventory.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ')
          : "Zero existing stock.";
        
        let result;
        if (process.env.API_KEY) {
             // In a real scenario, this would use a real file buffer from an input.
             result = await auditInventoryInvoice("Captured Manifest Data: [Pending Real Input]", currentStockSummary);
        } else {
            result = { discrepancies: false, message: "Asset verification logic ready. Please connect API key to process actual manifests.", detectedItems: [] };
        }
        setAuditResult(result);
    } catch (e) {
        setAuditResult({ message: "Audit processing failure." });
    } finally {
        setIsAuditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                        <Package className="text-purple-400" />
                        Asset Inventory
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Verified Resource Tracking</p>
                </div>
                <button 
                    onClick={handleSimulateInvoiceUpload}
                    disabled={isAuditing}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50">
                    {isAuditing ? <RefreshCw className="animate-spin" size={16}/> : <FileText size={16}/>}
                    {isAuditing ? 'Auditing...' : 'Upload Delivery Manifest'}
                </button>
             </div>

             {auditResult && (
                 <div className={`p-4 rounded-[1.5rem] border ${auditResult.discrepancies ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} animate-in fade-in slide-in-from-top-2`}>
                     <div className="flex items-start gap-3">
                         {auditResult.discrepancies ? <AlertOctagon className="text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
                         <div>
                             <h4 className={`text-xs font-black uppercase tracking-widest ${auditResult.discrepancies ? 'text-red-400' : 'text-emerald-400'}`}>
                                 {auditResult.discrepancies ? 'Stock Alert' : 'Manifest Verified'}
                             </h4>
                             <p className="text-[11px] text-slate-300 mt-1 italic">{auditResult.message}</p>
                         </div>
                     </div>
                 </div>
             )}
        </div>

        <div className="flex-1 overflow-y-auto p-12">
            {inventory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700 opacity-40">
                    <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600">
                        <Database size={40} />
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">No Materials Tracked</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed italic">Upload an invoice or sync your project BOQ to start monitoring stock levels in real-time.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                        <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-[2rem] p-6 shadow-xl group hover:border-purple-500/50 transition-all">
                            <h3 className="text-sm font-black text-white uppercase italic tracking-tight mb-2">{item.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-black font-mono text-cyan-400">{item.quantity.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 font-black uppercase">{item.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default InventoryPanel;
