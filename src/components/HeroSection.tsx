import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Cpu,
  Activity,
  ShieldCheck,
  TrendingUp,
  Layers,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Language } from '../types/simulation';
import { translations } from '../i18n/translations';

interface HeroSectionProps {
  language: Language;
  onSelectPrompt: (promptText: string) => void;
  onLaunchDemo: () => void;
  onGoToStudio: () => void;
  isSynthesizing: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onSelectPrompt,
  onLaunchDemo,
  onGoToStudio,
  isSynthesizing,
}) => {
  const t = translations[language];
  const [customInput, setCustomInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes representing simulation points
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#38bdf8' : '#a855f7',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSelectPrompt(customInput);
  };

  const quickPrompts = [
    { text: t.prompt1, label: language === 'ta' ? 'நகர போக்குவரத்து' : 'Urban Megacity' },
    { text: t.prompt2, label: language === 'ta' ? 'நிறுவன தானியங்கி' : 'AI Automation' },
    { text: t.prompt3, label: language === 'ta' ? 'உத்திகள் ஒப்பீடு' : 'Strategy Battle' },
  ];

  return (
    <div className="relative overflow-hidden border-b border-cyan-950/40 bg-[#050813] py-16 lg:py-24">
      {/* Background Cyber Grid */}
      <div className="cyber-grid absolute inset-0 opacity-40 pointer-events-none"></div>

      {/* Atmospheric Radial Glows */}
      <div className="pointer-events-none absolute -left-48 top-10 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px]"></div>
      <div className="pointer-events-none absolute -right-48 bottom-10 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]"></div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Vision & Command Input */}
          <div className="lg:col-span-7">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1 text-xs text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono uppercase tracking-wider">
                {language === 'ta' ? 'எதிர்கால முடிவு நுண்ணறிவு தளம்' : 'Decision-Intelligence Operating System'}
              </span>
            </div>

            {/* Core Hero Slogan */}
            <h1 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block text-slate-100">{t.heroHead.split('\n')[0]}</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                {t.heroHead.split('\n')[1]}
              </span>
              <span className="block text-purple-400">{t.heroHead.split('\n')[2]}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t.heroSub}
            </p>

            {/* Natural Language Prompt Input */}
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="relative flex items-center rounded-xl border border-cyan-500/40 bg-slate-900/90 p-1.5 shadow-[0_0_25px_rgba(56,189,248,0.12)] focus-within:border-cyan-400 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                <Sparkles className="ml-3 h-5 w-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={
                    language === 'ta'
                      ? 'உங்கள் கற்பனை அல்லது கேள்வியை இங்கே உள்ளிடுங்கள் (எ.கா: 10 லட்சம் மக்கள் நகரம்...)'
                      : 'Describe any real-world problem or scenario in natural language...'
                  }
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  disabled={isSynthesizing}
                />
                <button
                  type="submit"
                  disabled={isSynthesizing || !customInput.trim()}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isSynthesizing ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  ) : (
                    <>
                      <span>{t.createSimulation}</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Prompt Chips */}
            <div className="mt-4">
              <p className="font-mono text-[11px] text-slate-400">{t.quickPromptTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt(p.text)}
                    className="group flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:text-cyan-200"
                  >
                    <span className="font-mono text-[10px] text-cyan-400">[{p.label}]</span>
                    <span className="truncate max-w-[280px] sm:max-w-md">{p.text}</span>
                    <ChevronRight className="h-3 w-3 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onLaunchDemo}
                className="group flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/40 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all hover:bg-cyan-500 hover:text-slate-950"
              >
                <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                <span>{t.exploreDemo}</span>
              </button>

              <button
                onClick={onGoToStudio}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <Layers className="h-4 w-4" />
                <span>{t.navStudio}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Holographic Digital World Model Display */}
          <div className="relative lg:col-span-5">
            <div className="relative rounded-2xl border border-cyan-500/30 bg-[#080d1f]/80 p-5 shadow-[0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-xl">
              {/* Scanline overlay */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-15">
                <div className="h-1 w-full bg-cyan-400 blur-sm animate-scanline"></div>
              </div>

              {/* Header HUD */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></span>
                  <span className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                    VIRTUAL WORLD GRAPH
                  </span>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                  2026 → 2050 HORIZON
                </span>
              </div>

              {/* Dynamic Canvas with Particles and Node Mesh */}
              <div className="relative my-3 h-64 w-full overflow-hidden rounded-xl border border-cyan-950/60 bg-[#04060e]">
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

                {/* Overlaid Interconnected Entities HUD */}
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none text-xs">
                  <div className="flex justify-between items-start">
                    <div className="rounded border border-cyan-500/30 bg-cyan-950/60 p-2 backdrop-blur-sm">
                      <p className="font-mono text-[10px] text-slate-400">DEMOGRAPHIC SCALE</p>
                      <p className="font-mono text-sm font-bold text-white">1.0M → 1.8M pop</p>
                    </div>
                    <div className="rounded border border-purple-500/30 bg-purple-950/60 p-2 backdrop-blur-sm text-right">
                      <p className="font-mono text-[10px] text-slate-400">COMMUTE BOTTLENECK</p>
                      <p className="font-mono text-sm font-bold text-amber-400">46 → 78 min/trip</p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="rounded-full border border-cyan-400/50 bg-cyan-900/40 px-3 py-1 font-mono text-[10px] text-cyan-300 backdrop-blur-md animate-pulse">
                      CAUSAL FEEDBACK LOOP ACTIVE
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="rounded border border-emerald-500/30 bg-emerald-950/60 p-2 backdrop-blur-sm">
                      <p className="font-mono text-[10px] text-slate-400">CLEAN EV ADOPTION</p>
                      <p className="font-mono text-sm font-bold text-emerald-400">14% → 82% fleet</p>
                    </div>
                    <div className="rounded border border-rose-500/30 bg-rose-950/60 p-2 backdrop-blur-sm text-right">
                      <p className="font-mono text-[10px] text-slate-400">RESPIRATORY BURDEN</p>
                      <p className="font-mono text-sm font-bold text-rose-400">$410M → $840M/yr</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Simulation Stats Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                  <p className="font-mono text-[10px] text-slate-400">SYSTEM STRESS</p>
                  <p className="font-mono text-sm font-bold text-amber-400">48 / 100</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                  <p className="font-mono text-[10px] text-slate-400">RISK INDEX</p>
                  <p className="font-mono text-sm font-bold text-rose-400">MODERATE (52%)</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2">
                  <p className="font-mono text-[10px] text-slate-400">CONFIDENCE</p>
                  <p className="font-mono text-sm font-bold text-cyan-400">88% VALIDATED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
