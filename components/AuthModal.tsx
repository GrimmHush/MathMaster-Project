import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { soundFx } from '../lib/audioEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    soundFx.playClick();

    const currentState = useGameStore.getState();

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' 
        ? { 
            email, 
            username, 
            password,
            totalXP: currentState.totalXP,
            level: currentState.level,
            globalStreak: currentState.globalStreak,
            lifetimeCorrect: currentState.lifetimeCorrect,
            lifetimeAttempted: currentState.lifetimeAttempted,
            targetAge: currentState.targetAge,
            // ADDED: Send unlocked trophies to the backend
            unlockedTrophies: currentState.unlockedTrophies
          } 
        : { email, password };

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      
      useGameStore.setState({ 
        isGuest: false,
        username: data.user.username,
        totalXP: mode === 'register' ? currentState.totalXP : (data.user.total_xp || 0),
        level: mode === 'register' ? currentState.level : (data.user.level || 1),
        globalStreak: mode === 'register' ? currentState.globalStreak : (data.user.global_streak || 0),
        lifetimeCorrect: mode === 'register' ? currentState.lifetimeCorrect : (data.user.lifetime_correct || 0),
        lifetimeAttempted: mode === 'register' ? currentState.lifetimeAttempted : (data.user.lifetime_attempted || 0),
        targetAge: mode === 'register' ? currentState.targetAge : (data.user.target_age || data.user.targetAge || null),
        // ADDED: Restore trophies from the database
        unlockedTrophies: mode === 'register' ? currentState.unlockedTrophies : (data.user.unlocked_trophies || []),
      });
      
      soundFx.playLevelUp();
      onClose();
    } catch (err: any) {
      setError(err.message);
      soundFx.playIncorrect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] relative">
        <button 
          onClick={() => { soundFx.playClick(); onClose(); }}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {mode === 'register' ? 'Save Progress' : 'Welcome Back'}
        </h2>
        <p className="text-gray-400 mb-8">
          {mode === 'register' ? 'Create an account to lock in your XP and climb the leaderboards.' : 'Log in to continue your streak.'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors" />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-colors" />
          </div>

          <button disabled={isLoading} type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>{mode === 'register' ? 'Create Account' : 'Log In'} <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => { soundFx.playClick(); setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
            className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            {mode === 'register' ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};