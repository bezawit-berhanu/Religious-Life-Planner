
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ShieldCheck, Volume2, Maximize2, Minimize2, BellOff } from 'lucide-react';
import { t } from '../utils';

const Focus: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(15 * 60); 
  const [timeLeft, setTimeLeft] = useState(duration);
  const [customMinutes, setCustomMinutes] = useState(15);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      exitFullscreen();
      // Play Sound
      if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
      if (!isActive) {
          enterFullscreen();
          setIsActive(true);
      } else {
          setIsActive(false);
          // Optional: Exit fullscreen on pause? Sticking to keep it immersive until stop.
      }
  };
  
  const enterFullscreen = () => {
      if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
              containerRef.current.requestFullscreen().catch(err => console.log(err));
          }
      }
  };

  const exitFullscreen = () => {
      if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(err => console.log(err));
      }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    exitFullscreen();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };
  
  const handleCustomTime = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
          setCustomMinutes(val);
          if (!isActive) {
              setDuration(val * 60);
              setTimeLeft(val * 60);
          }
      }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div ref={containerRef} className={`${isActive ? 'fixed inset-0 z-[100] bg-[#1a120e] text-white flex flex-col items-center justify-center' : 'relative h-full text-ols-text flex flex-col items-center justify-center'} transition-colors duration-700`}>
      {/* Simple Beep Sound Data URI */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" />

      {/* Background if not active */}
      {!isActive && <div className="absolute inset-0 -z-10" />}

      {isActive && (
          <div className="absolute top-8 text-amber-500/50 animate-pulse flex flex-col items-center gap-2">
              <BellOff size={32} />
              <span className="text-sm font-serif tracking-widest uppercase">Notifications Silenced</span>
          </div>
      )}

      <div className="text-center space-y-8 p-6 max-w-md w-full relative z-10">
        <div className="space-y-2">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${isActive ? 'bg-ols-secondary/20 text-ols-secondary' : 'bg-ols-primary/10 text-ols-primary'}`}>
                <ShieldCheck size={32} />
            </div>
            <h2 className="font-serif text-3xl font-bold">{isActive ? 'Hesychasm Mode' : t('Focus', 'English')}</h2>
            <p className={`text-sm ${isActive ? 'text-amber-100/50' : 'text-ols-muted'}`}>
              {isActive ? 'Distractions blocked. Pray without ceasing.' : 'Silence distractions. Focus on prayer and reading.'}
            </p>
        </div>

        <div className="relative flex justify-center items-center">
             <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-colors ${isActive ? 'border-ols-secondary/30 bg-black/20' : 'border-ols-accent/20'}`}>
                <div className={`text-6xl font-serif font-light tabular-nums tracking-tight ${isActive ? 'text-white' : 'text-ols-primary'}`}>
                    {formatTime(timeLeft)}
                </div>
             </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          {!isActive && (
             <div className="w-full animate-fade-in">
                 <label className="text-xs uppercase font-bold text-ols-muted mb-4 block text-center tracking-widest">Set Duration</label>
                 
                 <div className="flex justify-center gap-3 mb-6">
                    {[15, 30, 45, 60].map(mins => (
                        <button 
                            key={mins}
                            onClick={() => { setCustomMinutes(mins); setDuration(mins * 60); setTimeLeft(mins * 60); }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${customMinutes === mins ? 'bg-ols-primary text-white border-ols-primary scale-110 shadow-md' : 'border-gray-200 text-gray-500 hover:border-ols-primary hover:text-ols-primary'}`}
                        >
                            {mins}
                        </button>
                    ))}
                 </div>

                 <div className="bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-gray-400 uppercase">Custom</span>
                         <span className="text-xl font-mono font-bold text-ols-primary">{customMinutes} min</span>
                     </div>
                     <input 
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={customMinutes}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setCustomMinutes(val);
                            setDuration(val * 60);
                            setTimeLeft(val * 60);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ols-primary"
                     />
                     <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                         <span>5m</span>
                         <span>120m</span>
                     </div>
                 </div>
             </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-ols-secondary text-ols-primary' : 'bg-ols-primary text-white'}`}
          >
            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button
            onClick={stopTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-amber-900/50 text-amber-100/50 hover:text-white' : 'border-gray-200 text-gray-400 hover:border-ols-primary hover:text-ols-primary'}`}
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {isActive && (
            <div className="mt-8 pt-8 border-t border-amber-900/30">
                <p className="text-amber-100/30 text-xs uppercase tracking-widest mb-2">App Locked</p>
                <div className="flex items-center justify-center gap-2 text-amber-100/50 text-xs">
                    <Maximize2 size={12} />
                    Full Screen Active
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Focus;
