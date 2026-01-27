
import React, { useState } from 'react';
import { X, UploadCloud, Zap, Loader2, CheckCircle2, Box, Layers, ArrowRight, Download, FileText } from 'lucide-react';
import ThreeDViewer from './ThreeDViewer';
import { ProjectStage } from '../types';
import { MOCK_CAMERAS } from '../constants';

interface BimSynthesisViewProps {
  onClose: () => void;
}

const BimSynthesisView: React.FC<BimSynthesisViewProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    // Simulate plan selection
    const plans = ['Architectural_G_Floor.pdf', 'Structural_Layout_L1.dwg', 'MEP_Services_Grid.dwg'];
    setUploadedFiles(plans);
  };

  const startSynthesis = () => {
    if (uploadedFiles.length === 0) return;
    setStep('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep('result');
      }
    }, 40);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
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
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {step === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-10 animate-in zoom-in-95 duration-700">
              <div className="text-center max-w-xl">
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">Synthesize Your Digital Twin</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">Upload multiple 2D structural and architectural plans. ConstructAI uses Gemini 3 Pro Vision to reconstruct a spatially accurate 3D BIM model.</p>
              </div>

              <div className="w-full max-w-2xl bg-slate-900/50 border-4 border-dashed border-slate-800 rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all hover:border-cyan-500/50 group">
                {uploadedFiles.length === 0 ? (
                  <button onClick={handleUpload} className="flex flex-col items-center gap-6">
                    <div className="p-8 bg-slate-800 rounded-[2rem] text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all shadow-inner">
                      <UploadCloud size={48} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Drop 2D Project Blueprints</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">PDF • DWG • JPG • PNG</p>
                    </div>
                  </button>
                ) : (
                  <div className="w-full space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                          <div className="flex items-center gap-4">
                            <FileText size={18} className="text-cyan-500" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-tight">{f}</span>
                          </div>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={startSynthesis}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-cyan-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 italic mt-6"
                    >
                      <Zap size={20} className="fill-white" />
                      Build 3D BIM Model
                    </button>
                  </div>
                )}
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
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Extracting Point Clouds • Resolving MEP Intersections • Verifying Nodes</p>
                
                <div className="w-96 h-1.5 bg-slate-900 rounded-full overflow-hidden mx-auto mt-8 border border-white/5">
                  <div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-cyan-400 font-mono text-xs">{progress}%</p>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-1000 h-full">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest tracking-[0.2em]">Synthesis Verified</span>
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Synthesized Digital Twin</h2>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-slate-900 border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    <Download size={14} /> Download .IFC
                  </button>
                  <button className="flex items-center gap-2 bg-cyan-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 hover:scale-105 active:scale-95 transition-all">
                    <ArrowRight size={14} /> Sync to Dashboard
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
                <ThreeDViewer 
                  stage={ProjectStage.STRUCTURAL}
                  layers={{
                    structural: true, pipes: true, electrical: true, interiors: false, facade: false,
                    excavationRed: false, excavationGreen: false, excavationBlue: false, bimSlice: false
                  }}
                  activeCamera={null}
                  cameras={MOCK_CAMERAS}
                  viewMode={'ORBIT' as any}
                  onCameraCapture={() => {}}
                  onSelectCamera={() => {}}
                  onSaveTour={() => {}}
                  bimFileName="Synthesized_Digital_Twin_v1.0.ifc"
                />
                
                {/* Info Panel Overlay */}
                <div className="absolute bottom-10 left-10 z-30 pointer-events-none">
                  <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-cyan-600 rounded-xl text-white shadow-lg shadow-cyan-600/20">
                        <Layers size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Model Specs</p>
                        <p className="text-sm font-black text-white uppercase italic mt-1">LOD 400 Compliant</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between gap-12">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Structural Elements</span>
                        <span className="text-[9px] font-mono text-cyan-400">1,248 Objects</span>
                      </div>
                      <div className="flex justify-between gap-12">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">MEP Network</span>
                        <span className="text-[9px] font-mono text-cyan-400">856 Nodes</span>
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

export default BimSynthesisView;
