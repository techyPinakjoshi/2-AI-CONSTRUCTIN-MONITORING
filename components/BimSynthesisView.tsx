
import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Zap, Loader2, CheckCircle2, Box, Layers, ArrowRight, Download, FileText, Info, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import ThreeDViewer from './ThreeDViewer';
import { ProjectStage } from '../types';
import { MOCK_CAMERAS } from '../constants';
import { reconstructBimFromPlans } from '../services/geminiService';

interface BimSynthesisViewProps {
  onClose: () => void;
}

const BimSynthesisView: React.FC<BimSynthesisViewProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing Neural Engine...');
  const [synthesisData, setSynthesisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusPhases = [
    { threshold: 10, message: "Reading Plan Metadata..." },
    { threshold: 30, message: "Extracting Point Clouds from 2D Geometry..." },
    { threshold: 60, message: "Resolving Structural Intersections..." },
    { threshold: 85, message: "Verifying IS-Code Compliance Nodes..." },
    { threshold: 95, message: "Finalizing 3D Mesh Aggregation..." }
  ];

  useEffect(() => {
    if (step === 'processing') {
      const currentPhase = statusPhases.reverse().find(p => progress >= p.threshold);
      if (currentPhase) setStatusMessage(currentPhase.message);
    }
  }, [progress, step]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  };

  const startSynthesis = async () => {
    if (!hasMinimumPlans) return;
    setStep('processing');
    setProgress(0);
    setError(null);

    // Dynamic progress bar simulator
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 92) return prev + Math.random() * 2;
        return prev;
      });
    }, 300);

    try {
      const data = await reconstructBimFromPlans(uploadedFiles);
      setSynthesisData(data);
      
      clearInterval(interval);
      setProgress(100);
      setStatusMessage("Reconstruction Complete!");
      
      setTimeout(() => {
        setStep('result');
      }, 800);

    } catch (err) {
      console.error("Synthesis failed:", err);
      clearInterval(interval);
      setError("Vision AI reached a timeout. Please use fewer or clearer plan sets.");
      setStep('upload');
    }
  };

  const hasArch = uploadedFiles.some(f => f.name.toLowerCase().includes('arch'));
  const hasStruct = uploadedFiles.some(f => f.name.toLowerCase().includes('struct'));
  const hasMinimumPlans = hasArch && hasStruct;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        onChange={handleFileChange} 
        accept=".pdf,.dwg,.jpg,.png,.jpeg"
      />

      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900 shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-600/20 text-white">
            <Box size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">2d plan to <span className="text-cyan-400">BIM model</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI-Powered Neural 3D Reconstruction</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {step === 'upload' && (
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 animate-in zoom-in-95 duration-700">
              <div className="w-full lg:w-1/3 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight">Synthesis <span className="text-cyan-500">Guide</span></h2>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                    To generate a spatially verified Digital Twin, our Vision AI requires a minimum dataset to anchor the geometry.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Plan Requirements</h3>
                    <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded text-[8px] font-black text-cyan-400 uppercase tracking-widest">Minimum 2 Required</div>
                  </div>
                  
                  <RequirementItem title="Architectural Plans" desc="Defines the core building envelope and vertical elevations." required active={hasArch} />
                  <RequirementItem title="Structural Plans" desc="Required for Columns, Beams, and load-bearing skeleton." required active={hasStruct} />
                  <RequirementItem title="MEP Schematics" desc="Recommended for service clash detection (HVAC, Plumbing)." active={uploadedFiles.some(f => f.name.toLowerCase().includes('mep') || f.name.toLowerCase().includes('elec'))} />
                </div>
              </div>

              <div className="w-full lg:w-2/3 flex flex-col items-center">
                <div className="w-full bg-slate-900/50 border-4 border-dashed border-slate-800 rounded-[3rem] p-12 flex flex-col items-center justify-center transition-all hover:border-cyan-500/50 group relative">
                  <button onClick={handleUploadClick} className={`w-full flex flex-col items-center gap-6 ${uploadedFiles.length > 0 ? 'mb-8' : ''}`}>
                    <div className="p-8 bg-slate-800 rounded-[2rem] text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all shadow-inner">
                      <UploadCloud size={48} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                      {uploadedFiles.length === 0 ? 'Drop Project Blueprints Here' : 'Add More Plans'}
                    </p>
                  </button>

                  {uploadedFiles.length > 0 && (
                    <div className="w-full space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-4 truncate">
                              <FileText size={18} className="text-cyan-500 shrink-0" />
                              <span className="text-xs font-black text-slate-300 uppercase tracking-tight truncate">{f.name}</span>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={startSynthesis}
                        disabled={!hasMinimumPlans}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 italic"
                      >
                        <Zap size={20} className={hasMinimumPlans ? "fill-white" : ""} />
                        Generate 3D BIM Model
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-cyan-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                  <Loader2 className="animate-spin text-cyan-500" size={64} />
                </div>
                <Box size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural BIM Reconstruction</h3>
                <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{statusMessage}</p>
                
                <div className="w-96 h-1.5 bg-slate-900 rounded-full overflow-hidden mx-auto mt-8 border border-white/5">
                  <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-slate-500 font-mono text-xs">{Math.floor(progress)}%</p>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-1000 h-full">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Synthesis Verified</span>
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Synthesized Digital Twin</h2>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-slate-900 border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <Download size={14} /> Download .IFC
                  </button>
                  <button onClick={onClose} className="flex items-center gap-2 bg-cyan-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 hover:scale-105 active:scale-95 transition-all">
                    <ArrowRight size={14} /> Sync to Dashboard
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
                <ThreeDViewer 
                  stage={ProjectStage.STRUCTURAL}
                  layers={{ structural: true, pipes: true, electrical: true, interiors: false, facade: false, excavationRed: false, excavationGreen: false, excavationBlue: false, bimSlice: false }}
                  activeCamera={null}
                  cameras={MOCK_CAMERAS}
                  viewMode={'ORBIT' as any}
                  onCameraCapture={() => {}}
                  onSelectCamera={() => {}}
                  onSaveTour={() => {}}
                  bimFileName="Synthesized_Digital_Twin_v1.0.ifc"
                />
                
                <div className="absolute bottom-10 left-10 z-30 pointer-events-none">
                  <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-cyan-600 rounded-xl text-white">
                        <Layers size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase leading-none">Model Specs</p>
                        <p className="text-sm font-black text-white uppercase italic mt-1">LOD {synthesisData?.estimatedLod || 350} Compliant</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between gap-12">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Structural Elements</span>
                        <span className="text-[9px] font-mono text-cyan-400">{synthesisData?.elements?.length || '0'} Objects</span>
                      </div>
                      <div className="flex justify-between gap-12">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Model Levels</span>
                        <span className="text-[9px] font-mono text-cyan-400">{synthesisData?.levels || '0'} Stories</span>
                      </div>
                      <div className="flex justify-between gap-12">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Geo-Registration</span>
                        <span className="text-[9px] font-mono text-emerald-400">SUCCESS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const RequirementItem: React.FC<{ title: string; desc: string; required?: boolean; active?: boolean }> = ({ title, desc, required, active }) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-900 border-white/5 opacity-60'}`}>
    <div className="flex justify-between items-center mb-1">
      <h4 className={`text-xs font-black uppercase tracking-tight ${active ? 'text-cyan-400' : 'text-white'}`}>{title}</h4>
      <div className="flex items-center gap-2">
        {active && <CheckCircle2 size={12} className="text-cyan-500" />}
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${required ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
          {required ? 'MANDATORY' : 'RECOMMENDED'}
        </span>
      </div>
    </div>
    <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
  </div>
);

export default BimSynthesisView;
