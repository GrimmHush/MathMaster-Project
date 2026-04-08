import React, { useState } from 'react';
import { Zap, Rocket, Crosshair, Sparkles, ChevronRight, LogIn, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { AuthModal } from './AuthModal';
import { soundFx } from '../lib/audioEngine';

export const backgroundSymbols = [
  { sym: '+', left: '10%', top: '20%', size: '80px', delay: '0s', dur: '12s' },
  { sym: '×', left: '80%', top: '15%', size: '90px', delay: '-2s', dur: '14s' },
  { sym: '÷', left: '70%', top: '80%', size: '70px', delay: '-5s', dur: '10s' },
  { sym: '-', left: '20%', top: '75%', size: '85px', delay: '-1s', dur: '13s' },
  { sym: '1', left: '40%', top: '10%', size: '60px', delay: '-8s', dur: '15s' },
  { sym: '2', left: '55%', top: '85%', size: '95px', delay: '-3s', dur: '11s' },
  { sym: '3', left: '85%', top: '45%', size: '75px', delay: '-6s', dur: '14s' },
  { sym: '=', left: '15%', top: '45%', size: '100px', delay: '-4s', dur: '16s' },
  { sym: '4', left: '30%', top: '30%', size: '65px', delay: '-7s', dur: '12s' },
  { sym: '5', left: '60%', top: '35%', size: '85px', delay: '-2.5s', dur: '13s' },
  { sym: '8', left: '50%', top: '60%', size: '70px', delay: '-9s', dur: '10s' },
  { sym: '+', left: '85%', top: '85%', size: '90px', delay: '-1.5s', dur: '15s' },
  { sym: '÷', left: '5%', top: '5%', size: '65px', delay: '-4.5s', dur: '12s' },
  { sym: '9', left: '40%', top: '90%', size: '80px', delay: '-0.5s', dur: '11s' },
  { sym: '-', left: '90%', top: '5%', size: '75px', delay: '-3.5s', dur: '14s' },
];

const RookieBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none">
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gentleFloat {
        0%, 100% { transform: translateY(0) rotate(-5deg); }
        50% { transform: translateY(-40px) rotate(5deg); }
      }
    `}} />
    {backgroundSymbols.map((item, i) => {
      const colors = ['text-violet-400/30', 'text-sky-400/30', 'text-lime-500/30', 'text-orange-400/30'];
      return (
        <div key={i} className={`absolute font-black ${colors[i % colors.length]} drop-shadow-sm`}
          style={{ fontSize: item.size, left: item.left, top: item.top, animation: `gentleFloat ${item.dur} ease-in-out infinite`, animationDelay: item.delay }}>
          {item.sym}
        </div>
      );
    })}
  </div>
);

// NEW: Vibrant Esports/Arcade Background for Pro Circuit
const ProBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none">
    {backgroundSymbols.map((item, i) => {
      const colors = ['text-fuchsia-500/20', 'text-cyan-400/20', 'text-indigo-500/20', 'text-violet-500/20'];
      return (
        <div key={i} className={`absolute font-black ${colors[i % colors.length]} animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_currentColor]`}
          style={{ fontSize: item.size, left: item.left, top: item.top, animationDelay: item.delay }}>
          {item.sym}
        </div>
      );
    })}
  </div>
);

export const LandingPage: React.FC = () => {
  const { startRound, setTargetAge, isGuest, totalXP, navigate, targetAge, inferredAge, username, logout } = useGameStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hoveredArena, setHoveredArena] = useState<'rookie' | 'pro' | null>(null);

  const handleStart = (age: '6-10' | '11-14') => {
    soundFx.playClick();
    setTargetAge(age);
    startRound();
  };

  const isRookieAge = (targetAge || inferredAge) === '6-10';
  
  // FIX: Proper 3-way toggle logic
  const showRookieTheme = hoveredArena === 'rookie' || (hoveredArena === null && isRookieAge && targetAge !== null);
  const showProTheme = hoveredArena === 'pro' || (hoveredArena === null && !isRookieAge && targetAge !== null);

  let title = "Choose Your Arena.";
  let subtitle = "Select your age group below to get started.";

  if (showRookieTheme) {
    title = "Let's Play Math!";
    subtitle = "Fun, colorful math puzzles to train your brain!";
  } else if (showProTheme) {
    title = "Ranked Circuit.";
    subtitle = "Fast-paced competitive math. Beat the high score!";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-1000">
      
      <div className={`absolute inset-0 transition-opacity duration-700 ${showRookieTheme ? 'opacity-100' : 'opacity-0'}`}><RookieBackground /></div>
      <div className={`absolute inset-0 transition-opacity duration-700 ${!showRookieTheme ? 'opacity-100' : 'opacity-0'}`}><ProBackground /></div>

      <header className="absolute top-0 left-0 w-full p-6 flex justify-end z-50">
        {isGuest ? (
          <button onClick={() => setIsAuthModalOpen(true)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${showRookieTheme ? 'bg-white text-sky-500 hover:bg-sky-50 border-4 border-sky-100' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-indigo-500/30'}`}>
            <LogIn className="w-5 h-5" /> Login / Save Progress
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-indigo-500/30 shadow-lg">
            <span className="text-white font-bold">Welcome, <span className="text-cyan-400">{username}</span></span>
            <div className="w-px h-6 bg-slate-700"></div>
            <button onClick={logout} className="text-slate-400 hover:text-fuchsia-400 font-bold text-sm transition-colors">Log Out</button>
          </div>
        )}
      </header>

      <div className="max-w-6xl w-full space-y-12 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-6 min-h-[160px] pt-12">
          {showProTheme && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 font-bold tracking-widest uppercase text-sm mb-2 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <Gamepad2 className="w-4 h-4 animate-pulse" /> Competitive Mode
            </div>
          )}
          <h1 className={`text-5xl md:text-8xl font-black tracking-tight transition-colors duration-500 ${showRookieTheme ? 'text-gray-800 drop-shadow-sm' : 'text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-indigo-300 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]'}`}>
            {title}
          </h1>
          <p className={`text-xl md:text-3xl font-medium max-w-2xl mx-auto transition-colors duration-500 ${showRookieTheme ? 'text-gray-600 drop-shadow-sm' : 'text-indigo-200/80'}`}>
            {subtitle}
          </p>
        </div>

        {(!isGuest || totalXP > 0) ? (
          <div className="flex justify-center pt-8">
            <button onClick={() => { soundFx.playClick(); navigate('dashboard'); }} className={`group relative flex items-center justify-center gap-3 px-12 py-6 rounded-3xl font-black text-2xl transition-all shadow-xl ${showRookieTheme ? 'bg-sky-400 hover:bg-sky-500 text-white border-b-[8px] border-sky-600 active:border-b-0 active:translate-y-2' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:from-indigo-400 hover:to-fuchsia-500 transform hover:-translate-y-2 shadow-[0_0_40px_rgba(217,70,239,0.4)]'}`}>
              <Zap fill="currentColor" className="w-8 h-8 group-hover:animate-bounce" />
              Enter Dashboard <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-8">
            {/* Rookie Button */}
            <button onMouseEnter={() => { soundFx.playHover(); setHoveredArena('rookie'); }} onMouseLeave={() => setHoveredArena(null)} onClick={() => handleStart('6-10')} className={`group relative w-full text-left transition-all duration-500 ${hoveredArena === 'pro' ? 'opacity-40 scale-95' : 'scale-100'}`}>
              <div className="relative bg-white border-[8px] border-white/50 hover:border-white rounded-[3rem] p-10 h-full flex flex-col items-center text-center gap-6 transform group-hover:-translate-y-4 transition-all duration-300 shadow-[0_20px_0_rgba(0,0,0,0.1)]">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(251,146,60,0.5)] group-hover:scale-110 transition-transform duration-500">
                  <Rocket className="w-16 h-16 text-white ml-2 mb-2" fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-5xl font-black text-gray-800 mb-2">Rookie</h2>
                  <p className="text-orange-500 font-bold text-2xl uppercase tracking-widest">Ages 6 - 10</p>
                </div>
                <div className="mt-4 px-8 py-4 bg-orange-500 text-white font-black rounded-full text-xl flex items-center gap-2 shadow-[0_8px_0_rgba(194,65,12,1)] group-hover:translate-y-2 group-hover:shadow-[0_0px_0_rgba(194,65,12,1)] transition-all">
                  <Sparkles className="w-6 h-6" /> Play Now!
                </div>
              </div>
            </button>

            {/* Pro Button - REVAMPED FOR 11-14 */}
            <button onMouseEnter={() => { soundFx.playHover(); setHoveredArena('pro'); }} onMouseLeave={() => setHoveredArena(null)} onClick={() => handleStart('11-14')} className={`group relative w-full text-left transition-all duration-500 ${hoveredArena === 'rookie' ? 'opacity-40 scale-95' : 'scale-100'}`}>
              <div className="relative bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/50 hover:border-fuchsia-400 rounded-[3rem] p-10 h-full flex flex-col items-center text-center gap-6 transform group-hover:-translate-y-4 transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(217,70,239,0.4)]">
                <div className="w-32 h-32 bg-slate-800 border-2 border-cyan-400 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] group-hover:rotate-0 transition-all duration-500">
                  <Crosshair className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>
                <div>
                  <h2 className="text-5xl font-black text-white mb-2 drop-shadow-md">Pro Circuit</h2>
                  <p className="text-fuchsia-400 font-bold text-2xl uppercase tracking-widest">Ages 11 - 14+</p>
                </div>
                <div className="mt-4 px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-black rounded-full text-xl group-hover:from-indigo-500 group-hover:to-fuchsia-500 transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                  Enter Ranked Mode
                </div>
              </div>
            </button>
          </div>
        )}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
};