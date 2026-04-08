import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Loader2, Globe, Calendar } from 'lucide-react';

interface AllTimeEntry {
  username: string;
  total_xp: number;
  level: number;
  global_streak: number;
}

interface WeeklyEntry {
  username: string;
  weekly_xp: number;
  max_weekly_streak: number;
}

export const Leaderboard: React.FC = () => {
  const [allTime, setAllTime] = useState<AllTimeEntry[]>([]);
  const [weekly, setWeekly] = useState<WeeklyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'allTime' | 'weekly'>('allTime');

  useEffect(() => {
    fetch('http://localhost:4000/api/game/leaderboards')
      .then(res => res.json())
      .then(data => {
        setAllTime(data.allTime);
        setWeekly(data.weekly);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  const currentData = activeTab === 'allTime' ? allTime : weekly;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden mt-6">
      <div className="flex gap-4 p-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('allTime')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'allTime' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:bg-gray-800'}`}
        >
          <Globe className="w-4 h-4" /> All-Time
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'weekly' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:bg-gray-800'}`}
        >
          <Calendar className="w-4 h-4" /> Weekly
        </button>
      </div>

      <div className="p-4 bg-gray-900 border-b border-gray-800 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-2 text-center">Rank</div>
        <div className="col-span-5">Challenger</div>
        <div className="col-span-2 text-center">{activeTab === 'allTime' ? 'Level' : 'Best Streak'}</div>
        <div className="col-span-3 text-right pr-4">{activeTab === 'allTime' ? 'Total XP' : 'Weekly XP'}</div>
      </div>

      <div className="divide-y divide-gray-800/50">
        {currentData.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-semibold">No challengers on the board yet.</div>
        ) : currentData.map((player: any, index) => (
          <div key={index} className={`p-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-gray-800/50 ${index < 3 ? 'bg-gray-800/20' : ''}`}>
            <div className="col-span-2 flex justify-center">
              {index === 0 ? <Trophy className="w-6 h-6 text-yellow-400" /> :
               index === 1 ? <Trophy className="w-6 h-6 text-gray-400" /> :
               index === 2 ? <Trophy className="w-6 h-6 text-amber-600" /> :
               <span className="text-gray-500 font-bold">#{index + 1}</span>}
            </div>
            <div className="col-span-5 font-bold text-white flex items-center gap-2">
              {player.username}
              {(activeTab === 'allTime' ? player.global_streak : player.max_weekly_streak) >= 3 && <Flame className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="col-span-2 text-center text-cyan-400 font-bold">
              {activeTab === 'allTime' ? player.level : (player.max_weekly_streak || 0)}
            </div>
            <div className="col-span-3 text-right pr-4 font-mono text-purple-400">
              {Number(activeTab === 'allTime' ? player.total_xp : player.weekly_xp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};