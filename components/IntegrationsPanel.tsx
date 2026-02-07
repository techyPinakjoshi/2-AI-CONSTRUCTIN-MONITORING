
import React, { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, Globe, ShieldCheck, RefreshCw, Smartphone, Zap, ArrowRight, ExternalLink, Database, BookOpen, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface IntegrationsPanelProps {
  onSyncComplete?: (appName: string) => void;
}

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const [syncLogs, setSyncLogs] = useState<{msg: string, time: string}[]>([]);

  const handleConnect = (appName: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setConnectedApps(prev => [...prev, appName]);
      setSyncLogs(prev => [
        { msg: `Neural Handshake with ${appName} successful.`, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
      setIsSyncing(false);
      onSyncComplete?.(appName);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">External <span className="text-cyan-500">Connect</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Neural Bridges to Indian Regulatory Ecosystems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Indian Construction Code App Connector */}
        <div className={`p-8 rounded-[3rem] border transition-all relative overflow-hidden ${
          connectedApps.includes('IS-CODE-APP') 
          ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20' 
          : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-white/5'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl transition-colors ${connectedApps.includes('IS-CODE-APP') ? 'bg-emerald-500 text-white' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
              <BookOpen size={28} />
            </div>
            {connectedApps.includes('IS-CODE-APP') && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                <CheckCircle2 size={12} /> Live Sync
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Indian Construction Code App</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 mb-8 italic">
            Synchronize IS 456, IS 1200, and NBC 2016 requirements directly into site audit logic.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => handleConnect('IS-CODE-APP')}
              disabled={isSyncing || connectedApps.includes('IS-CODE-APP')}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                connectedApps.includes('IS-CODE-APP') 
                ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/30 cursor-default' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : connectedApps.includes('IS-CODE-APP') ? <ShieldCheck size={16} /> : <LinkIcon size={16} />}
              {isSyncing ? 'Establishing Neural Link...' : connectedApps.includes('IS-CODE-APP') ? 'Regulatory Bridge Active' : 'Authorize Handshake'}
            </button>
            
            {connectedApps.includes('IS-CODE-APP') && (
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Linked via M-Link Protocol v2.4</p>
            )}
          </div>
        </div>

        {/* Generic API Connector */}
        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 shadow-sm group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-600">
              <Smartphone size={28} />
            </div>
            <div className="px-3 py-1 bg-blue-500/10 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">REST API</div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Custom Field Gateway</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 mb-8 italic">
            Connect custom on-field data collection apps for real-time workforce analytics.
          </p>
          <div className="flex gap-2">
            <input 
              placeholder="Endpoint Auth Key" 
              className="flex-1 bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 text-[10px] text-slate-400 outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <button className="p-4 bg-slate-900 dark:bg-slate-800 rounded-xl text-white hover:bg-blue-600 transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Log */}
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 rounded-[3rem] p-8 shadow-sm">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Database size={12} className="text-cyan-500" /> Neural Handshake Logs
        </h4>
        <div className="space-y-3">
          {syncLogs.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={24} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[10px] font-bold text-slate-400 uppercase italic">Awaiting external network signal...</p>
            </div>
          ) : (
            syncLogs.map((log, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-slate-950 rounded-2xl border border-zinc-100 dark:border-white/5 animate-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.msg}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
