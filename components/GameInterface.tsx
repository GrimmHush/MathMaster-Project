import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { MathProblem } from '../lib/mathEngine';
import { Timer, Zap, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { GAME_CONFIG } from '../config/gameConfig';
import { backgroundSymbols } from './LandingPage';

const RookieBackground = () => (
  <div className="absolute inset-0 z-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none">
    <style dangerouslySetInnerHTML={{ __html: `@keyframes gentleFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-40px) rotate(5deg); } }`}} />
    {backgroundSymbols.map((item, i) => {
      const colors = ['text-violet-400/20', 'text-sky-400/20', 'text-lime-500/20', 'text-orange-400/20'];
      return (
        <div key={i} className={`absolute font-black ${colors[i % colors.length]} drop-shadow-sm`} style={{ fontSize: item.size, left: item.left, top: item.top, animation: `gentleFloat ${item.dur} ease-in-out infinite`, animationDelay: item.delay }}>
          {item.sym}
        </div>
      );
    })}
  </div>
);

// NEW: Pro Circuit Game Background
const ProBackground = () => (
  <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none">
    {backgroundSymbols.map((item, i) => {
      const colors = ['text-fuchsia-500/10', 'text-cyan-400/10', 'text-indigo-500/10', 'text-violet-500/10'];
      return (
        <div key={i} className={`absolute font-black ${colors[i % colors.length]} animate-[pulse_4s_infinite] drop-shadow-[0_0_15px_currentColor]`} style={{ fontSize: item.size, left: item.left, top: item.top, animationDelay: item.delay }}>
          {item.sym}
        </div>
      );
    })}
  </div>
);

const MathVisualizer = ({ problem }: { problem: MathProblem }) => {
  const { num1, num2, operation, correctAnswer } = problem;
  if (num1 * num2 > 144 && operation === '×') return null;
  if (num1 > 50 && (operation === '+' || operation === '-')) return null;

  const Block = ({ color = 'bg-sky-300', crossedOut = false }: { color?: string, crossedOut?: boolean }) => (
    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] border border-black/10 relative flex items-center justify-center ${color} ${crossedOut ? 'opacity-40 grayscale' : ''}`}>
      {crossedOut && <XCircle className="w-full h-full text-red-500 absolute" />}
    </div>
  );

  return (
    <div className="mb-8 p-4 bg-white/50 border-2 border-white rounded-2xl shadow-inner min-h-[100px] flex items-center justify-center w-full max-w-lg">
      {operation === '+' && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
            {Array.from({ length: num1 }).map((_, i) => <Block key={`add1-${i}`} color="bg-sky-300" />)}
          </div>
          <div className="text-3xl font-black text-gray-300">+</div>
          <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
            {Array.from({ length: num2 }).map((_, i) => <Block key={`add2-${i}`} color="bg-lime-300" />)}
          </div>
        </div>
      )}
      {operation === '-' && (
        <div className="flex flex-wrap gap-1 justify-center max-w-[300px]">
          {Array.from({ length: correctAnswer }).map((_, i) => <Block key={`remain-${i}`} color="bg-sky-300" />)}
          {Array.from({ length: num2 }).map((_, i) => <Block key={`taken-${i}`} color="bg-gray-400" crossedOut />)}
        </div>
      )}
      {operation === '×' && (
        <div className="grid gap-1 justify-center" style={{ gridTemplateColumns: `repeat(${num2}, minmax(0, 1fr))` }}>
          {Array.from({ length: num1 * num2 }).map((_, i) => <Block key={`mult-${i}`} color="bg-violet-300" />)}
        </div>
      )}
      {operation === '÷' && (
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: num2 }).map((_, bucketIdx) => (
            <div key={`bucket-${bucketIdx}`} className="p-2 border-4 border-dashed border-sky-300 bg-sky-50 rounded-xl flex flex-wrap gap-1 w-16 h-16 md:w-20 md:h-20 items-center justify-center">
              {Array.from({ length: correctAnswer }).map((_, i) => <Block key={`block-${bucketIdx}-${i}`} color="bg-pink-300" />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FireworkBurst = ({ delay = 0 }: { delay?: number }) => {
  const [exploded, setExploded] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setExploded(true), delay); return () => clearTimeout(timer); }, [delay]);
  const colors = ['text-yellow-400', 'text-orange-500', 'text-cyan-400', 'text-purple-500', 'text-pink-500'];
  const symbols = ['+', '-', '×', '÷', '=', '1', '2', '3'];

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5) * (Math.PI / 180);
        const distance = exploded ? 80 + ((i % 3) * 20) : 0; 
        return (
          <div key={`spark-${i}`} className={`absolute font-black text-2xl md:text-3xl ${colors[i % colors.length]} transition-all duration-700 ease-out flex items-center justify-center drop-shadow-[0_0_10px_currentColor]`}
            style={{ transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${exploded ? 0 : 1.2}) rotate(${exploded ? 180 : 0}deg)`, opacity: exploded ? 0 : 1 }}>
            {symbols[i % symbols.length]}
          </div>
        );
      })}
    </div>
  );
};

export const GameInterface: React.FC = () => {
  const [visualFeedback, setVisualFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const { currentProblem, timeRemaining, roundScore, roundStreak, submitAnswer, tickTimer, inferredAge, targetAge } = useGameStore();
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState<'buttons' | 'typing'>('buttons');

  useEffect(() => {
    const timer = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  if (!currentProblem) return null;

  const activeAge = targetAge || inferredAge;
  const isRookie = activeAge === '6-10';
  
  // REVAMPED PRO CLASSES
  const cardShape = isRookie 
    ? 'rounded-[4rem] bg-white border-[16px] border-violet-200 shadow-[0_24px_0_rgba(139,92,246,0.3)]' 
    : 'rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2)]';
    
  const hudShape = isRookie 
    ? 'rounded-full bg-violet-100 border-4 border-violet-200 shadow-inner' 
    : 'rounded-2xl bg-slate-800/80 border border-indigo-500/30 shadow-lg';
    
  const problemFont = isRookie 
    ? 'text-7xl md:text-9xl text-gray-900 font-black drop-shadow-lg' 
    : 'text-5xl md:text-7xl text-white font-black tracking-widest drop-shadow-[0_0_20px_rgba(217,70,239,0.3)]';
    
  const buttonStyle = isRookie 
    ? 'py-8 px-6 bg-sky-100 hover:bg-sky-500 border-4 border-sky-200 hover:border-sky-600 border-b-[14px] hover:border-b-[14px] rounded-[3rem] text-6xl font-black text-gray-900 hover:text-white transition-all active:border-b-4 active:translate-y-2 relative' 
    : 'py-6 px-8 bg-slate-800 hover:bg-indigo-600 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-2xl text-4xl font-bold text-white transition-all transform hover:scale-105 shadow-[0_8px_0_rgb(30,41,59)] hover:shadow-[0_8px_0_rgb(79,70,229)] active:translate-y-2 active:shadow-none relative';

  const textColor = isRookie ? 'text-gray-900' : 'text-slate-100';

  const handleAnswer = (answer: number) => {
    const isCorrect = answer === currentProblem.correctAnswer;
    setVisualFeedback(isCorrect ? 'correct' : 'incorrect');
    const feedbackDuration = (isCorrect && isRookie) ? 1000 : 400;
    setTimeout(() => { setVisualFeedback(null); }, feedbackDuration); 
    submitAnswer(answer, GAME_CONFIG.ROUND_DURATION_SEC - timeRemaining);
    setTypedAnswer('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    handleAnswer(Number(typedAnswer));
  };

  const timerColor = timeRemaining > 20 ? 'text-cyan-400' : timeRemaining > 10 ? 'text-yellow-400' : 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
      {isRookie ? <RookieBackground /> : <ProBackground />}
      
      <div className={`w-full max-w-4xl flex flex-col items-center p-6 md:p-12 transition-all duration-300 relative overflow-visible z-10 ${cardShape} ${
        visualFeedback === 'correct' 
          ? (isRookie ? 'border-green-400 shadow-[0_24px_0_rgba(74,222,128,1)]' : 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]')
          : visualFeedback === 'incorrect' 
            ? (isRookie ? 'border-red-400 shadow-[0_24px_0_rgba(248,113,113,1)]' : 'border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.5)]')
            : ''
      }`}>
        {isRookie && visualFeedback === 'correct' && (
          <>
            <div className="absolute -top-4 -left-4"><FireworkBurst delay={0} /></div>
            <div className="absolute -top-4 -right-4"><FireworkBurst delay={100} /></div>
            <div className="absolute top-1/2 -left-8"><FireworkBurst delay={150} /></div>
            <div className="absolute top-1/2 -right-8"><FireworkBurst delay={50} /></div>
            <div className="absolute -bottom-4 -left-4"><FireworkBurst delay={200} /></div>
            <div className="absolute -bottom-4 -right-4"><FireworkBurst delay={0} /></div>
          </>
        )}

        {!isRookie && visualFeedback === 'correct' && <CheckCircle2 className="absolute top-8 right-8 w-12 h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[spin_0.3s_linear_1]" />}
        {!isRookie && visualFeedback === 'incorrect' && <XCircle className="absolute top-8 right-8 w-12 h-12 text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] animate-[pulse_0.3s_ease-in-out_1]" />}

        <div className={`w-full max-w-3xl flex justify-between items-center mb-10 p-4 ${hudShape}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <Flame className={`w-6 h-6 md:w-8 md:h-8 ${roundStreak > 2 ? (isRookie ? 'text-orange-500 animate-bounce' : 'text-fuchsia-400 drop-shadow-[0_0_10px_currentColor] animate-pulse') : 'text-slate-500'}`} />
            <span className={`text-xl md:text-2xl font-bold ${textColor}`}>{roundStreak}</span>
          </div>
          <div className={`flex items-center gap-2 md:gap-3 ${timerColor}`}>
            <Timer className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-2xl md:text-3xl font-black">{timeRemaining}s</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {isRookie 
              ? <div className="w-10 h-10 border border-violet-200 shadow-inner rounded-full bg-violet-50 text-yellow-500 font-bold text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] flex items-center justify-center animate-[bounce_4s_infinite_ease-in-out]">★</div>
              : <Zap className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
            <span className={`text-xl md:text-2xl font-bold ${textColor}`}>{roundScore}</span>
          </div>
        </div>

        <div className={`mb-4 transition-all duration-200 ${problemFont}`}>
          {currentProblem.num1} <span className={isRookie ? "text-orange-500" : "text-fuchsia-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"}>{currentProblem.operation}</span> {currentProblem.num2}
        </div>
        {isRookie && <MathVisualizer problem={currentProblem} />}

        {!isRookie && (
          <div className="mb-6 flex gap-4 w-full max-w-md">
            <button onClick={() => setInputMode('buttons')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${inputMode === 'buttons' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-indigo-500/30'}`}>Multiple Choice</button>
            <button onClick={() => setInputMode('typing')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${inputMode === 'typing' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-indigo-500/30'}`}>Type Answer</button>
          </div>
        )}

        {inputMode === 'buttons' || isRookie ? (
          <div className={`grid grid-cols-2 gap-4 w-full ${isRookie ? 'max-w-xl' : 'max-w-2xl'}`}>
            {currentProblem.options.map((opt, i) => {
              const isLastOfThree = currentProblem.options.length === 3 && i === 2;
              return <button key={`btn-${i}`} onClick={() => handleAnswer(opt)} className={`${buttonStyle} ${isLastOfThree ? 'col-span-2' : ''}`}>{opt}</button>;
            })}
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="w-full max-w-md flex flex-col gap-4">
            <input type="number" autoFocus value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} className="w-full bg-slate-900 border-2 border-indigo-500/50 focus:border-cyan-400 rounded-2xl text-center text-5xl font-bold text-white py-6 outline-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all" placeholder="..." />
            <button type="submit" className="w-full py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-2xl text-2xl font-bold text-white hover:opacity-90 transform hover:-translate-y-1 transition-all shadow-[0_0_25px_rgba(217,70,239,0.4)]">Submit Answer</button>
          </form>
        )}
      </div>
    </div>
  );
};