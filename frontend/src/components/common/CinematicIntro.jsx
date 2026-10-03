import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

/**
 * CinematicIntro Component
 * Implements the 3D book opening, volumetric particle convergence,
 * and exact official Adhyayan LM logo reveal before entering the homepage.
 */
export const CinematicIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  // 0: Initial Void & Float (0 - 1.2s)
  // 1: 3D Book Opens & Golden Light Erupts (1.2s - 2.8s)
  // 2: Particle Rays & Convergence (2.8s - 4.8s)
  // 3: Logo Formed & Golden Shimmer Hold (4.8s - 6.6s)
  // 4: Dissolve to Homepage (6.6s - 7.4s)

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Phase Timing Controller
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2600);
    const t3 = setTimeout(() => setPhase(3), 4400);
    const t4 = setTimeout(() => setPhase(4), 6500);
    const t5 = setTimeout(() => {
      onComplete?.();
    }, 7400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // Handle Keyboard Skip (Escape or Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        onComplete?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // 60FPS Canvas Particle Physics Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool with dual colors (emerald & gold)
    const colors = [
      '#10B981', // Emerald light
      '#059669', // Emerald deep
      '#34D399', // Emerald mint
      '#F59E0B', // Amber gold
      '#FCD34D', // Bright gold
      '#FEF3C7', // Warm luminous white-gold
    ];

    const particles = [];
    const particleCount = 130;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5 - 0.8,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 80,
        spiralSpeed: (Math.random() - 0.5) * 0.05,
        spiralRadius: Math.random() * 40 + 10,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw active particles
      particles.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          // Reset near book core
          p.x = centerX + (Math.random() - 0.5) * 120;
          p.y = centerY + (Math.random() - 0.5) * 50;
          p.life = 0;
          p.alpha = Math.random() * 0.8 + 0.2;
        }

        if (elapsed > 4000 && elapsed < 6500) {
          // Convergence Phase: pull smoothly toward logo center
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.vx += dx * 0.04;
          p.vy += dy * 0.04;
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else {
          // Rising Stardust Spiral
          p.angle += p.spiralSpeed;
          p.x += Math.cos(p.angle) * 0.8 + p.vx;
          p.y += p.vy;
        }

        // Render glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Background volumetric light beams
      if (elapsed > 1200) {
        const rayIntensity = Math.min(1, (elapsed - 1200) / 1500);
        ctx.save();
        const rayGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          10,
          centerX,
          centerY,
          width * 0.4
        );
        rayGrad.addColorStop(0, `rgba(245, 158, 11, ${0.35 * rayIntensity})`);
        rayGrad.addColorStop(0.3, `rgba(16, 185, 129, ${0.2 * rayIntensity})`);
        rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020504] overflow-hidden select-none transition-opacity duration-1000 ${
        phase === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #061A12 0%, #020604 60%, #000000 100%)',
      }}
    >
      {/* Particle Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Skip Button (Top-Right) */}
      <button
        onClick={() => onComplete?.()}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-lg"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Main 3D Book & Logo Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center scale-90 sm:scale-100 md:scale-110">
        {/* Phase 0 & 1: Realistic 3D Hardcover Floating Book */}
        {phase < 3 && (
          <div
            className={`transition-all duration-1000 ease-out flex flex-col items-center ${
              phase === 0 ? 'scale-90 opacity-90' : 'scale-105 opacity-100'
            }`}
            style={{
              perspective: '1400px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            {/* Book 3D Structure */}
            <div
              className="relative w-64 h-80 transition-transform duration-1000 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform:
                  phase === 0
                    ? 'rotateX(25deg) rotateY(-20deg) rotateZ(5deg)'
                    : 'rotateX(15deg) rotateY(0deg) rotateZ(0deg)',
              }}
            >
              {/* Floating Shadow */}
              <div
                className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full bg-black/80 blur-xl transition-all duration-700"
                style={{
                  transform: phase > 0 ? 'scale(1.2)' : 'scale(0.9)',
                }}
              />

              {/* Book Spine Center */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-80 rounded-sm bg-gradient-to-r from-[#0d3829] via-[#104b37] to-[#0d3829] shadow-inner"
                style={{ transformStyle: 'preserve-3d' }}
              />

              {/* Left Hardcover */}
              <div
                className="absolute left-0 top-0 w-32 h-80 rounded-l-md origin-right transition-transform duration-1000 ease-out shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #0A2F22 0%, #165E47 60%, #0C3829 100%)',
                  border: '1.5px solid #1E785C',
                  transform: phase >= 1 ? 'rotateY(-145deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '-10px 10px 30px rgba(0,0,0,0.8)',
                }}
              >
                {/* Gold Inlay Trim */}
                <div className="absolute inset-2 border border-[#D4AF37]/40 rounded-sm pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-[#D4AF37]/50 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#D4AF37] rotate-45" />
                  </div>
                </div>
              </div>

              {/* Right Hardcover */}
              <div
                className="absolute right-0 top-0 w-32 h-80 rounded-r-md origin-left transition-transform duration-1000 ease-out shadow-2xl"
                style={{
                  background: 'linear-gradient(225deg, #0A2F22 0%, #165E47 60%, #0C3829 100%)',
                  border: '1.5px solid #1E785C',
                  transform: phase >= 1 ? 'rotateY(145deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '10px 10px 30px rgba(0,0,0,0.8)',
                }}
              >
                <div className="absolute inset-2 border border-[#D4AF37]/40 rounded-sm pointer-events-none" />
              </div>

              {/* Golden Core Volumetric Light Beam */}
              {phase >= 1 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-r from-amber-400/40 via-emerald-400/30 to-amber-300/40 blur-2xl" />
                  <div className="w-16 h-48 bg-gradient-to-t from-amber-200 to-transparent blur-md" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 & 4: Exact Official Adhyayan LM Logo Reveal */}
        {phase >= 3 && (
          <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-700">
            {/* Luminous Logo Backdrop Glow */}
            <div className="absolute w-[450px] h-[220px] bg-gradient-to-r from-emerald-500/25 via-amber-500/25 to-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Official Logo Graphic */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/30 shadow-[0_20px_60px_rgba(16,185,129,0.35)] flex items-center justify-center group overflow-hidden">
              {/* Golden Sheen Shimmer Reflection */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
                style={{
                  transform: 'skewX(-25deg)',
                }}
              />

              <img
                src="/logo.png"
                alt="Adhyayan LM Official Brand Logo"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-md"
              />
            </div>

            {/* Subtitle Under Logo */}
            <p className="mt-5 text-sm sm:text-base font-semibold tracking-wide text-emerald-300/90 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
              AI-Powered Intelligent Academic Studio
            </p>
          </div>
        )}
      </div>

      {/* Bottom Progress Pulse Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-300 ease-out"
          style={{
            width: `${(phase / 4) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default CinematicIntro;
