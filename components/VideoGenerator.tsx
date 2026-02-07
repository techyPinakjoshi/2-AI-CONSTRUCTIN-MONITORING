
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// Fixed missing RefreshCw import
import { Video, Sparkles, Loader2, Download, Play, ShieldAlert, Monitor, Smartphone, Zap, ArrowRight, Info, RefreshCw } from 'lucide-react';

const VIDEO_PROMPTS = [
  "A cinematic hyper-realistic drone fly-through of a massive high-rise construction site in India at sunset, showing cranes and concrete structural progress.",
  "Close-up detailed view of a robotic arm performing precise structural welding on a futuristic bridge, industrial aesthetic.",
  "Time-lapse of a modular building being assembled like LEGO blocks in a high-tech smart city environment.",
  "Digital twin overlay of a construction site, showing neon blue BIM wireframes over physical concrete structures."
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState(VIDEO_PROMPTS[0]);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setVideoUrl(null);

    // 1. Mandatory API Key Selection for Veo models
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Assume success after opening dialog as per instructions
      }
    }

    setIsGenerating(true);
    setStatus('Initializing Neural Render Engine...');

    try {
      // 2. Create AI instance right before call to use latest key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatus('Prompting Veo 3.1 Synthesis...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio
        }
      });

      // 3. Polling for results
      let pollCount = 0;
      while (!operation.done) {
        pollCount++;
        if (pollCount > 60) throw new Error("Generation timed out. Please try a shorter prompt.");
        
        // Reassuring messages
        if (pollCount === 2) setStatus('Synthesizing light and texture...');
        if (pollCount === 6) setStatus('Simulating physical dynamics...');
        if (pollCount === 12) setStatus('Refining high-fidelity details...');
        if (pollCount === 20) setStatus('Finalizing MP4 encoding...');

        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video synthesis failed to produce an output.");

      setStatus('Fetching video bytes...');
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setIsGenerating(false);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("entity was not found")) {
        setError("Project/API Key mismatch. Please re-select your key.");
        if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      } else {
        setError(err.message || "Synthesis failed. This often happens if the prompt is too complex.");
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Neural Video Studio</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Generate Cinematic High-Fidelity Project Demos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[3rem] shadow-sm">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Visualization Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your project vision..."
                className="w-full bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[120px] transition-all"
              />
              <div className="flex flex-wrap gap-2">
                {VIDEO_PROMPTS.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPrompt(p)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-white/5 hover:bg-cyan-500/10 rounded-full text-[9px] font-bold text-slate-500 transition-all border border-zinc-200 dark:border-white/5"
                  >
                    Preset {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-white/5 text-slate-500'}`}>
                    <Monitor size={16} />
                    <span className="text-[9px] font-black">16:9</span>
                  </button>
                  <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-white/5 text-slate-500'}`}>
                    <Smartphone size={16} />
                    <span className="text-[9px] font-black">9:16</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Quality</label>
                <div className="flex gap-2">
                  <button onClick={() => setResolution('720p')} className={`flex-1 py-3 rounded-xl border transition-all ${resolution === '720p' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-white/5 text-slate-500'}`}>
                    <span className="text-[9px] font-black">720P</span>
                  </button>
                  <button onClick={() => setResolution('1080p')} className={`flex-1 py-3 rounded-xl border transition-all ${resolution === '1080p' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-zinc-50 dark:bg-slate-950 border-zinc-200 dark:border-white/5 text-slate-500'}`}>
                    <span className="text-[9px] font-black">1080P</span>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
                <ShieldAlert className="text-red-500 shrink-0" size={18} />
                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
              {isGenerating ? 'Rendering Demo...' : 'Synthesize Video Demo'}
              {!isGenerating && <ArrowRight size={18} />}
            </button>
          </div>

          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex items-start gap-4">
            <Info className="text-amber-500 shrink-0 mt-1" size={20} />
            <div>
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">High-Compute Task</p>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Neural synthesis can take 2-4 minutes. This feature requires a paid API key from a project with billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-black text-amber-700">Billing Docs</a></p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative min-h-[400px] flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center p-10 animate-in zoom-in duration-500">
               <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-cyan-500" size={48} />
                  </div>
                  <Sparkles size={20} className="absolute top-0 right-0 text-cyan-400 animate-pulse" />
               </div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{status}</h3>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-4">Veo 3.1 Synthesis Engine Active</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className={`max-w-full max-h-full ${aspectRatio === '9:16' ? 'aspect-[9/16] h-[90%]' : 'aspect-video w-[90%]'}`} 
              />
              <div className="absolute bottom-8 flex gap-4">
                <a 
                  href={videoUrl} 
                  download="ConstructAI_Demo.mp4" 
                  className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Download size={14} /> Download MP4
                </a>
                <button 
                  onClick={() => setVideoUrl(null)} 
                  className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-slate-700 transition-all"
                >
                  <RefreshCw size={14} /> New Demo
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30 px-12">
               <div className="p-8 bg-slate-900 rounded-[2.5rem] w-fit mx-auto mb-6">
                  <Video size={64} className="text-slate-500" />
               </div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Demo Preview Hub</h3>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 leading-relaxed">Describe your site vision to the left and click synthesize to see your project in motion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
