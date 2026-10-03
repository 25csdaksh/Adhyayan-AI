import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

/**
 * CinematicVideoIntro Component
 * 5-second high-end cinematic brand intro on website load
 * - Features slow cinematic forward dolly-in push
 * - Rising neon emerald green and warm golden luminous stardust particles
 * - Logo golden aura shimmer
 * - Auto-fades into homepage after 5 seconds
 * - Includes smooth progress indicator and skip option
 */
export const CinematicVideoIntro = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const durationMs = 5000; // Exactly 5 seconds

  const handleFinish = () => {
    setFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600); // 600ms smooth dissolve fade
  };

  // Keyboard shortcut: Escape or Space to skip immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5-second Timer & Progress Bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        handleFinish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Antigravity Emerald & Gold Stardust Particle Physics (60 FPS Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.3 + Math.random() * 0.7),
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 1.8 + 0.6),
      speedX: (Math.random() - 0.5) * 0.9,
      color: Math.random() > 0.45 ? 'rgba(52, 211, 153, ' : 'rgba(251, 191, 36, ',
      opacity: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.04 + 0.02,
      pulseVal: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseVal += p.pulseSpeed;
        const currentOpacity = Math.max(0.1, (Math.sin(p.pulseVal) * 0.4 + 0.6) * p.opacity);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentOpacity})`;
        ctx.shadowColor = p.color.includes('52') ? '#10B981' : '#F59E0B';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Reset particle to bottom when it rises above top
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black overflow-hidden select-none transition-opacity duration-600 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* 1. Cinematic Background with Slow Dolly-In (Zoom) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src="/hero-cinematic.jpg"
          alt="Adhyayan LM Cinematic Brand Intro"
          className="w-full h-full object-cover sm:object-contain transform scale-100 animate-[cinematicDolly_5.2s_ease-out_forwards] filter brightness-105 contrast-110 drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]"
          style={{
            animation: 'cinematicDolly 5.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        />

        {/* Ambient Vignette & Cosmic Glow Layer */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />
      </div>

      {/* 2. Antigravity Rising Particle Streams Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 3. Top Skip Button & Brand Badge */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Antigravity AI Engine</span>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-emerald-400/50 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20 active:scale-95"
        >
          <span>Skip Intro</span>
          <span className="text-[10px] text-emerald-400/80 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Esc
          </span>
          <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* 4. Bottom 5-Second Linear Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto mb-4 px-6 flex items-center justify-between text-[11px] font-mono text-emerald-400/80">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Adhyayan LM Experience
          </span>
          <span>{((durationMs - (progress / 100) * durationMs) / 1000).toFixed(1)}s</span>
        </div>
        <div className="w-full h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Inline Keyframes for Cinematic Camera Dolly-in */}
      <style>{`
        @keyframes cinematicDolly {
          0% {
            transform: scale(1.0) translateY(0px);
            filter: brightness(0.95) contrast(1.05);
          }
          50% {
            transform: scale(1.04) translateY(-3px);
            filter: brightness(1.08) contrast(1.15);
          }
          100% {
            transform: scale(1.08) translateY(-6px);
            filter: brightness(1.12) contrast(1.18);
          }
        }
      `}</style>
    </div>
  );
};

export default CinematicVideoIntro;
