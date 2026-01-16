import React, { useState, useEffect, useRef } from 'react';
import { TourSession, TourStep } from '../types';
import { X, Play, Pause, FastForward, Rewind, MapPin, Maximize, Clock } from 'lucide-react';
import { TOUR_LOCATIONS } from '../constants';

interface TourPlaybackModalProps {
  session: TourSession;
  onClose: () => void;
}

const TourPlaybackModal: React.FC<TourPlaybackModalProps> = ({ session, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0); // Timestamp of the first step
  
  // Calculate total duration in seconds based on timestamps if possible, 
  // or parse the duration string (e.g. "14m 20s"). 
  // For robustness, let's use the difference between first and last timestamp
  const getSessionDurationSeconds = () => {
      if (session.steps.length < 2) return 10; // Fallback
      const start = new Date(session.steps[0].timestamp).getTime();
      const end = new Date(session.steps[session.steps.length - 1].timestamp).getTime();
      return (end - start) / 1000;
  };

  const totalDuration = getSessionDurationSeconds() || 10; // Avoid divide by zero

  useEffect(() => {
    if (session.steps.length > 0) {
        startTimeRef.current = new Date(session.steps[0].timestamp).getTime();
    }
  }, [session]);

  useEffect(() => {
    if (isPlaying) {
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => {
                const nextTime = prev + 1; // Advance 1 second
                
                // Check if we reached the end
                if (nextTime >= totalDuration) {
                    setIsPlaying(false);
                    return totalDuration;
                }
                
                // Find correct step to display based on time
                const currentAbsoluteTime = startTimeRef.current + (nextTime * 1000);
                
                // Find the latest step that happened BEFORE or AT currentAbsoluteTime
                let stepIdx = 0;
                for (let i = 0; i < session.steps.length; i++) {
                    const stepTime = new Date(session.steps[i].timestamp).getTime();
                    if (stepTime <= currentAbsoluteTime) {
                        stepIdx = i;
                    } else {
                        break;
                    }
                }
                setCurrentStepIndex(stepIdx);
                
                return nextTime;
            });
        }, 1000); // Update every second (real-time playback)
        // Note: For smoother UI progress bar, we could use requestAnimationFrame, but setInterval is fine for this demo
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalDuration, session.steps]);

  // Sync progress bar with time
  useEffect(() => {
      setProgress((elapsedTime / totalDuration) * 100);
  }, [elapsedTime, totalDuration]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newProgress = parseFloat(e.target.value);
      const newTime = (newProgress / 100) * totalDuration;
      setElapsedTime(newTime);
      setProgress(newProgress);
      
      // Update step immediately
      const currentAbsoluteTime = startTimeRef.current + (newTime * 1000);
      let stepIdx = 0;
      for (let i = 0; i < session.steps.length; i++) {
          const stepTime = new Date(session.steps[i].timestamp).getTime();
          if (stepTime <= currentAbsoluteTime) {
              stepIdx = i;
          } else {
              break;
          }
      }
      setCurrentStepIndex(stepIdx);
  };

  const currentStep = session.steps[currentStepIndex];
  const currentLocation = TOUR_LOCATIONS[currentStep?.locationId] || TOUR_LOCATIONS['LOC-A'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Play className="text-green-500 fill-green-500" size={16} /> 
                        Tour Replay: {session.name}
                    </h3>
                    <p className="text-xs text-slate-500">{session.date} • {session.duration}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative bg-black overflow-hidden group">
                {/* 360 Viewport */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                    style={{ backgroundImage: `url('${currentLocation.imageUrl}')` }}
                >
                    {/* Simulated 360 Rotation Animation */}
                    <div className="absolute inset-0 bg-black/10 animate-pulse pointer-events-none"></div>
                </div>

                {/* Location Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                    <MapPin size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium">{currentLocation.name}</span>
                </div>

                {/* Controls Overlay (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-slate-300 w-10 text-right">
                            {Math.floor(elapsedTime / 60)}:{Math.floor(elapsedTime % 60).toString().padStart(2, '0')}
                        </span>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:h-2 transition-all"
                        />
                         <span className="text-xs font-mono text-slate-500 w-10">
                            {Math.floor(totalDuration / 60)}:{Math.floor(totalDuration % 60).toString().padStart(2, '0')}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center items-center gap-6">
                         <button className="text-slate-400 hover:text-white transition-colors"><Rewind size={20} /></button>
                         <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/20">
                            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                         </button>
                         <button className="text-slate-400 hover:text-white transition-colors"><FastForward size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Timeline / Steps List (Mini) */}
            <div className="h-24 bg-slate-950 border-t border-slate-800 p-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-2">
                {session.steps.map((step, idx) => (
                    <div 
                        key={idx}
                        className={`inline-flex flex-col items-center justify-center p-2 rounded-lg border min-w-[100px] cursor-pointer transition-all ${
                            currentStepIndex === idx 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400 scale-105' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                        }`}
                        onClick={() => {
                            // Seek to this step
                             const stepTime = new Date(step.timestamp).getTime();
                             const start = new Date(session.steps[0].timestamp).getTime();
                             const offset = (stepTime - start) / 1000;
                             setElapsedTime(offset);
                             setCurrentStepIndex(idx);
                        }}
                    >
                         <div className="text-[10px] font-mono mb-1">{new Date(step.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</div>
                         <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                             {currentStepIndex === idx && <div className="h-full bg-green-500 animate-pulse"></div>}
                         </div>
                         <div className="text-[10px] font-bold mt-1 truncate max-w-[80px]">{step.locationName}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default TourPlaybackModal;