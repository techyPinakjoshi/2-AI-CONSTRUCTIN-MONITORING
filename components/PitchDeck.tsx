
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Presentation, Target, AlertTriangle, Lightbulb, Zap, BarChart3, Globe, Users, TrendingUp, Handshake, ShieldCheck } from 'lucide-react';

interface PitchDeckProps {
  onClose: () => void;
}

const PitchDeck: React.FC<PitchDeckProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "ConstructAI Monitor",
      subtitle: "The Neural Operating System for Modern Infrastructure",
      icon: <Presentation className="text-cyan-400" size={48} />,
      content: "Revolutionizing Indian Construction with AI-driven Digital Twins and Real-time IS-Code Compliance.",
      points: ["By WEAUTOMATES", "Powered by Gemini 3 Pro", "Designed for Bharat's Infrastructure"]
    },
    {
      title: "The Problem",
      subtitle: "The $350 Billion Efficiency Gap",
      icon: <AlertTriangle className="text-orange-500" size={48} />,
      content: "Indian construction faces massive leaks: 25% material wastage, 20% timeline slippage, and critical safety non-compliance.",
      points: ["Lack of real-time site visibility", "Manual, error-prone BOQ extraction", "Structural failures due to IS-Code oversights"]
    },
    {
      title: "The Solution",
      subtitle: "BIM-to-Reality Synchronization",
      icon: <Lightbulb className="text-yellow-400" size={48} />,
      content: "A unified platform that turns site cameras and 2D plans into intelligent, self-auditing Digital Twins.",
      points: ["Neural BIM: 2D plans to 3D Twins instantly", "IS-Code Guard: Live compliance auditing", "Smart Inventory: AI-verified stock management"]
    },
    {
      title: "Unique Innovation",
      subtitle: "Legacy to Digital in Seconds",
      icon: <Zap className="text-purple-400" size={48} />,
      content: "Our proprietary 2D-to-BOQ Engine uses Gemini Vision to extract technical quantities from legacy blueprints.",
      points: ["No expensive Lidar required", "IS-1200 Standardized reporting", "98% Accuracy vs manual estimation"]
    },
    {
      title: "Market Opportunity",
      subtitle: "Riding the $1.4T Infra Wave",
      icon: <Globe className="text-emerald-400" size={48} />,
      content: "India is spending trillions on roads, rails, and smart cities (GIFT City, Dholera).",
      points: ["$25B Total Addressable Market for ConTech", "Mandatory BIM adoption for Govt projects", "Zero local competitors with real-time AI logic"]
    },
    {
      title: "Revenue Model",
      subtitle: "Hybrid Outcome-Based Pricing",
      icon: <BarChart3 className="text-blue-400" size={48} />,
      content: "A disruptive pricing model designed for the Indian market landscape.",
      points: ["Free: 2D Plan to BOQ", "₹5,000: 2D-to-BIM Synthesis", "₹5,000/User: Manual Progress Tracking", "1-5% Project Value: AI Site Monitoring"]
    },
    {
      title: "Financial Projections",
      subtitle: "Scaling with Bharat's Growth",
      icon: <TrendingUp className="text-cyan-400" size={48} />,
      content: "Aggressive growth leveraging GIFT City pilots and national infrastructure expansion.",
      points: ["Y1: ₹45L ARR (Pilots)", "Y2: ₹3.8Cr ARR (150+ Sites)", "Y3: ₹12Cr+ ARR (Govt Infra Expansion)", "Benefit: 60% Faster Reporting"]
    },
    {
      title: "Why iCreate?",
      subtitle: "Strategic Incubation Synergy",
      icon: <Handshake className="text-pink-400" size={48} />,
      content: "We seek iCreate's help to bridge the gap between our code and the physical construction site.",
      points: ["Sandbox Access (GIFT City/Dholera pilots)", "BIS/CBRI Regulatory validation", "DeepTech Mentorship for Vision AI"]
    },
    {
      title: "The Team",
      subtitle: "Expertise in AI & Civil Engineering",
      icon: <Users className="text-slate-400" size={48} />,
      content: "A multidisciplinary team combining Deep Learning expertise with site management experience.",
      points: ["Vision AI Lead (Gemini Expert)", "Structural Engineering Consultant", "PropTech Product Strategist"]
    },
    {
      title: "The Ask",
      subtitle: "Building Bharat, One Pixel at a Time",
      icon: <Target className="text-red-500" size={48} />,
      content: "We are looking for ₹50L Seed Funding to scale our Vision Core and secure Govt pilots.",
      points: ["GPU/Compute Infrastructure", "Enterprise Sales Team", "On-site R&D for Camera Edge AI"]
    }
  ];

  const next = () => setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
  const prev = () => setCurrentSlide((s) => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95">
      <div className="absolute top-6 right-6 z-[210]">
        <button onClick={onClose} className="p-3 bg-slate-900 border border-slate-700 rounded-full text-slate-400 hover:text-white transition-all shadow-2xl">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-6xl h-full flex flex-col relative bg-slate-900/50 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-1 bg-slate-950/50">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-full transition-all duration-500 ${i <= currentSlide ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`} 
            />
          ))}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-20 text-center">
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 inline-flex p-6 bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-inner">
              {slides[currentSlide].icon}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">
              {slides[currentSlide].title}
            </h1>
            <h2 className="text-xl md:text-2xl font-black text-cyan-400 uppercase tracking-widest mb-10">
              {slides[currentSlide].subtitle}
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed mb-12 italic">
              "{slides[currentSlide].content}"
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {slides[currentSlide].points.map((p, i) => (
                <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-xs font-black text-slate-100 uppercase tracking-widest">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
            SLIDE {currentSlide + 1} <span className="mx-2">/</span> {slides.length}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              disabled={currentSlide === 0}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white disabled:opacity-30 transition-all active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              disabled={currentSlide === slides.length - 1}
              className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-cyan-600/20"
            >
              Next Slide <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
