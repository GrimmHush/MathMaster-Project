import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MistakeReview } from './MistakeReview';
import { Play, Flame, Star, Target, Activity, AlertTriangle } from 'lucide-react';
import { ACHIEVEMENTS, GAME_CONFIG } from '../config/gameConfig';
import { AuthModal } from './AuthModal';
import { Leaderboard } from './Leaderboard';
import { backgroundSymbols } from './LandingPage'; 

const DashboardBackground = ({ isRookie }: { isRookie: boolean }) => {
  if (isRookie) {
    return (
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-lime-100 to-violet-100 overflow-hidden pointer-events-none">
        <style dangerouslySetInnerHTML={{ __html: `@keyframes gentleFloat { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-40px) rotate(5deg); } }`}} />
        {backgroundSymbols.map((item, i) => {
          const colors = ['text-violet-400/30', 'text-sky-400/30', 'text-lime-500/30', 'text-orange-400/30'];
          return (
            <div key={i} className={`absolute font-black ${colors[i % colors.length]} drop-shadow-sm`} style={{ fontSize: item.size, left: item.left, top: item.top, animation: `gentleFloat ${item.dur} ease-in-out infinite`, animationDelay: item.delay }}>
              {item.sym}
            </div>
          );
        })}
      </div>
    );
  }
  
  // NEW: Pro Circuit Dashboard Background
  return (
    <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-hidden pointer-events-none">
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
};

export const Dashboard: React.FC = () => {
  const { totalXP, level, globalStreak, lifetimeCorrect, lifetimeAttempted, lastPlayedDate, startRound, unlockedTrophies, inferredAge, targetAge, roundScore, isGuest, username, logout, resetGuestSession } = useGameStore();
  const [viewState, setViewState] = useState<'stats' | 'review' | 'leaderboard'>('stats');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const displayAge = targetAge || inferredAge;
  const isRookie = displayAge === '6-10';

  const accuracy = lifetimeAttempted === 0 ? 0 : Math.round((lifetimeCorrect / lifetimeAttempted) * 100);
  const nextLevelXP = Math.pow(level + 1, 2) * GAME_CONFIG.BASE_LEVEL_XP;
  const currentLevelBaseXP = Math.pow(level, 2) * GAME_CONFIG.BASE_LEVEL_XP;
  const progressPercent = ((totalXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100;
  const currentTier = Math.min(5, Math.ceil(level / 3));
  const tierProgress = ((level - 1) % 3); 
  const levelsToNextTier = 3 - tierProgress;

  const isStreakAtRisk = () => {
    if (!lastPlayedDate || globalStreak === 0) return false;
    const lastPlayed = new Date(lastPlayedDate);
    const today = new Date();
    return !(lastPlayed.getUTCFullYear() === today.getUTCFullYear() && lastPlayed.getUTCMonth() === today.getUTCMonth() && lastPlayed.getUTCDate() === today.getUTCDate());
  };

  // REVAMPED PRO THEME CLASSES
  const textColor = isRookie ? 'text-gray-900' : 'text-slate-100';
  const subTextColor = isRookie ? 'text-gray-500' : 'text-indigo-300';
  const cardBg = isRookie ? 'bg-white/90 backdrop-blur-sm border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.05)] rounded-[2rem]' : 'bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_8px_32px_rgba(99,102,241,0.15)] rounded-[2rem]';
  const headerBg = isRookie ? 'bg-white/90 backdrop-blur-md border-4 border-white shadow-md rounded-[2rem]' : 'bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-3xl';
  const btnClass = isRookie 
    ? 'px-8 py-4 bg-orange-400 hover:bg-orange-500 text-white rounded-[2rem] font-black text-xl border-b-[8px] border-orange-600 hover:border-b-4 hover:translate-y-1 transition-all'
    : 'px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transform hover:-translate-y-1';
  const tabActive = isRookie ? 'bg-sky-400 text-white shadow-md' : 'text-fuchsia-400 border-b-2 border-fuchsia-400 bg-slate-800 shadow-[inset_0_-2px_10px_rgba(217,70,239,0.1)]';
  const tabInactive = isRookie ? 'bg-white text-gray-500 hover:bg-gray-50 border-2 border-transparent' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden ${textColor}`}>
      <DashboardBackground isRookie={isRookie} />
      <div className="w-full max-w-6xl space-y-6 relative z-10">
        
        <header className={`flex flex-col sm:flex-row justify-between items-center p-4 mb-6 ${headerBg}`}>
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl ${isRookie ? 'bg-sky-400 text-white shadow-inner' : 'bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}>M</div>
            <h1 className="text-2xl font-black tracking-wider">MathQuest</h1>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isGuest ? (
              <>
                <button onClick={() => useGameStore.getState().navigate('landing')} className={`px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-cyan-400 hover:bg-slate-800'}`}>Home</button>
                <button onClick={() => { if(window.confirm("Are you sure? This will erase your current guest progress!")) resetGuestSession(); }} className={`px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-400 hover:bg-slate-800'}`}>Quit Game</button>
                <button onClick={() => setIsAuthModalOpen(true)} className={`px-5 py-2.5 rounded-xl font-black text-white transition-transform hover:-translate-y-1 ${isRookie ? 'bg-sky-500 shadow-[0_4px_0_rgb(2,132,199)]' : 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 shadow-[0_0_15px_rgba(217,70,239,0.4)]'}`}>Save Progress</button>
              </>
            ) : (
              <button onClick={() => logout()} className={`px-4 py-2 rounded-xl font-bold transition-colors ${isRookie ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-fuchsia-400 hover:bg-fuchsia-900/30 border border-fuchsia-500/30'}`}>Log Out</button>
            )}
          </div>
        </header>
        
        <div className={`flex flex-col md:flex-row justify-between items-center p-6 md:p-8 ${cardBg}`}>
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className={`text-4xl font-black ${isRookie ? 'text-sky-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]'}`}>
              Welcome, {username || 'Challenger'}!
            </h2>
            <p className={`mt-2 font-bold ${subTextColor}`}>
              Arena: <span className={isRookie ? 'text-orange-500' : 'text-cyan-400 drop-shadow-[0_0_5px_currentColor]'}>{isRookie ? 'Rookie (6-10)' : 'Pro Circuit (11-14+)'}</span> 
            </p>
          </div>
          <button onClick={startRound} className={`flex items-center gap-2 ${btnClass}`}>
            <Play fill="currentColor" className="w-8 h-8" /> ENTER MATCH
          </button>
        </div>

        {isStreakAtRisk() && (
          <div className="bg-orange-500/20 border-4 border-orange-500 rounded-3xl p-6 flex items-center gap-4 animate-bounce">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
            <div>
              <h4 className="font-black text-orange-600 dark:text-orange-400 text-xl">Streak at Risk!</h4>
              <p className="font-bold text-orange-800 dark:text-orange-200">Play a round today to keep your {globalStreak}-day streak alive!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`md:col-span-8 p-8 flex flex-col justify-center relative overflow-hidden ${cardBg}`}>
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className={`text-lg font-black uppercase tracking-wider ${subTextColor}`}>Current Rank</p>
                <h1 className="text-8xl font-black drop-shadow-md">{level}</h1>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${subTextColor}`}>Total XP</p>
                <p className={`text-4xl font-black ${isRookie ? 'text-sky-500' : 'text-cyan-400 drop-shadow-[0_0_10px_currentColor]'}`}>{totalXP.toLocaleString()}</p>
              </div>
            </div>

            <div className={`w-full rounded-full h-6 mb-2 overflow-hidden ${isRookie ? 'bg-gray-100 shadow-inner' : 'bg-slate-800 border border-slate-700'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isRookie ? 'bg-sky-400' : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]'}`}
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              ></div>
            </div>
            <p className={`text-right text-sm font-bold ${subTextColor}`}>{nextLevelXP - totalXP} XP to Level {level + 1}</p>
          </div>

          <div className={`md:col-span-4 p-8 flex flex-col items-center justify-center text-center ${cardBg}`}>
            <Flame className={`w-24 h-24 mb-4 ${globalStreak > 0 ? (isRookie ? 'text-orange-500 drop-shadow-md' : 'text-fuchsia-500 drop-shadow-[0_0_20px_rgba(217,70,239,0.6)]') : 'text-gray-300 dark:text-slate-700'}`} />
            <h3 className="text-6xl font-black">{globalStreak}</h3>
            <p className={`font-black uppercase tracking-widest mt-2 ${subTextColor}`}>Day Streak</p>
          </div>

          <div className={`md:col-span-12 p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${cardBg}`}>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isRookie ? 'bg-orange-100 text-orange-500' : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400'}`}>
                <Activity className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Difficulty Tier {currentTier}/5</h3>
                <p className={`font-bold text-sm ${subTextColor}`}>
                  {currentTier === 5 
                    ? "Maximum challenge reached!" 
                    : `Advance ${levelsToNextTier} level${levelsToNextTier > 1 ? 's' : ''} for Tier ${currentTier + 1}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`h-4 w-20 rounded-full transition-all duration-500 ${step <= tierProgress ? (isRookie ? 'bg-orange-400' : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]') : (isRookie ? 'bg-gray-200' : 'bg-slate-800')}`} />
              ))}
            </div>
          </div>

          <div className={`md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`}>
            <div className={`p-4 rounded-2xl ${isRookie ? 'bg-blue-100 text-blue-500' : 'bg-cyan-500/20 text-cyan-400'}`}><Target className="w-10 h-10"/></div>
            <div>
              <p className={`font-bold ${subTextColor}`}>Accuracy</p>
              <p className="text-3xl font-black">{accuracy}%</p>
            </div>
          </div>
          <div className={`md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`}>
            <div className={`p-4 rounded-2xl ${isRookie ? 'bg-green-100 text-green-500' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}><Activity className="w-10 h-10"/></div>
            <div>
              <p className={`font-bold ${subTextColor}`}>Solved</p>
              <p className="text-3xl font-black">{lifetimeCorrect}</p>
            </div>
          </div>
          <div className={`md:col-span-4 p-6 flex items-center gap-4 ${cardBg}`}>
            <div className={`p-4 rounded-2xl ${isRookie ? 'bg-yellow-100 text-yellow-500' : 'bg-violet-500/20 text-violet-400'}`}><Star className="w-10 h-10"/></div>
            <div>
              <p className={`font-bold ${subTextColor}`}>Last Score</p>
              <p className="text-3xl font-black">{roundScore}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap gap-4 mb-6 pb-2">
            <button onClick={() => setViewState('stats')} className={`px-6 py-3 font-black rounded-xl transition-all ${viewState === 'stats' ? tabActive : tabInactive}`}>Achievements</button>
            <button onClick={() => setViewState('review')} className={`px-6 py-3 font-black rounded-xl transition-all ${viewState === 'review' ? tabActive : tabInactive}`}>Mistakes</button>
            <button onClick={() => setViewState('leaderboard')} className={`px-6 py-3 font-black rounded-xl transition-all ${viewState === 'leaderboard' ? tabActive : tabInactive}`}>Leaderboards</button>
          </div>

          {viewState === 'stats' ? (
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = unlockedTrophies.includes(ach.id);
                  return (
                    <div key={ach.id} className={`p-6 rounded-[2rem] text-center transition-all ${
                      isUnlocked 
                        ? (isRookie ? 'bg-yellow-100 border-4 border-yellow-300' : 'bg-slate-800 border-2 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.2)]')
                        : (isRookie ? 'bg-white/50 border-4 border-gray-200 opacity-60 grayscale' : 'bg-slate-900/50 border border-slate-800 opacity-50 grayscale')
                    }`}>
                      <div className="text-5xl mb-3 flex justify-center">{ach.icon}</div>
                      <h4 className={`font-black ${isUnlocked ? (isRookie ? 'text-yellow-600' : 'text-fuchsia-400') : subTextColor}`}>{ach.title}</h4>
                    </div>
                  );
                })}
             </div>
          ) : viewState === 'review' ? (
            <div className={cardBg + ' p-4'}><MistakeReview /></div>
          ) : (
            <Leaderboard />
          )}
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
};