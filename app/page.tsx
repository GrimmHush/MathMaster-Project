'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LandingPage } from '../components/LandingPage';
import { GameInterface } from '../components/GameInterface';
import { Dashboard } from '../components/Dashboard';

export default function GameController() {
  const { currentView } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-cyan-400 animate-pulse">Loading Game Engine...</div>;

  if (currentView === 'game') return <GameInterface />;
  if (currentView === 'dashboard') return <Dashboard />;
  
  return <LandingPage />;
}