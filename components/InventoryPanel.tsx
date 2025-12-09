import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, Plus, AlertOctagon, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { auditInventoryInvoice } from '../services/geminiService';

interface InventoryPanelProps {
  inventory: InventoryItem[];
  onRestockRequest: (itemId: string, amount: number) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, onRestockRequest }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleSimulateInvoiceUpload = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        // Mock invoice data for the demo
        const mockInvoice = "Delivered: 500 bags of UltraTech Cement, 2000kg TMT bars 12mm.";
        const currentStockSummary = inventory.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join(', ');
        
        // Call Real Gemini Service (or mock if no key)
        // For this generated code, we assume the service works if key is present, 
        // otherwise we fall back to a mock response in the UI to prevent crash.
        let result;
        if (process.env.API_KEY) {
             result = await auditInventoryInvoice(mockInvoice, currentStockSummary);
        } else {
            // Fallback for demo without key
            result = {
                discrepancies: false,
                message: "Invoice matched with delivery manifest. Quantity verified.",
                detectedItems: [
                    { name: 'Cement Bags', quantity: 500 },
                    { name: 'TMT Bars', quantity: 2000 }
                ]
            };
        }
        
        setAuditResult(result);
    } catch (e) {
        console.error(e);
        setAuditResult({ message: "Audit failed. Please try again." });
    } finally {
        setIsAuditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
             <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="text-purple-400" />
                        Smart Inventory
                    </h2>
                    <p className="text-sm text-slate-400">AI-verified stock management</p>
                </div>
                <button 
                    onClick={handleSimulateInvoiceUpload}
                    disabled={isAuditing}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {isAuditing ? <RefreshCw className="animate-spin" size={18}/> : <FileText size={18}/>}
                    {isAuditing ? 'Analyzing Invoice...' : 'Upload Invoice / Scan'}
                </button>
             </div>

             {/* Audit Result Banner */}
             {auditResult && (
                 <div className={`p-4 rounded-lg border ${auditResult.discrepancies ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'} animate-in fade-in slide-in-from-top-2`}>
                     <div className="flex items-start gap-3">
                         {auditResult.discrepancies ? <AlertOctagon className="text-red-400" /> : <CheckCircle2 className="text-green-400" />}
                         <div>
                             <h4 className={`font-bold ${auditResult.discrepancies ? 'text-red-400' : 'text-green-400'}`}>
                                 {auditResult.discrepancies ? 'Discrepancy Detected' : 'Verification Successful'}
                             </h4>
                             <p className="text-sm text-slate-300 mt-1">{auditResult.message}</p>
                             {auditResult.detectedItems && (
                                 <div className="mt-2 text-xs text-slate-400 font-mono bg-slate-900/50 p-2 rounded">
                                     DETECTED: {auditResult.detectedItems.map((i: any) => `${i.quantity} x ${i.name}`).join(', ')}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                        <div key={item.id} className={`bg-slate-800 border ${isLow ? 'border-red-500/50' : 'border-slate-700'} rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-500 transition-colors`}>
                            {isLow && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    LOW STOCK
                                </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-slate-900 p-3 rounded-lg text-slate-300">
                                    <Package size={24} />
                                </div>
                                <span className="text-xs text-slate-500 font-mono">{item.lastUpdated}</span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-slate-100 mb-1">{item.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className={`text-2xl font-bold font-mono ${isLow ? 'text-red-400' : 'text-cyan-400'}`}>
                                    {item.quantity.toLocaleString()}
                                </span>
                                <span className="text-sm text-slate-500">{item.unit}</span>
                            </div>

                            <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden">
                                <div 
                                    className={`h-full ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`} 
                                    style={{ width: `${Math.min((item.quantity / (item.minThreshold * 4)) * 100, 100)}%` }}
                                ></div>
                            </div>

                            {isLow && (
                                <button 
                                    onClick={() => onRestockRequest(item.id, 100)}
                                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Plus size={16} /> Reorder Request
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default InventoryPanel;
