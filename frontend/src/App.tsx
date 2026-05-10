import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BalanceProvider, useBalance } from './context/BalanceContext.tsx';
import { Gamepad2, Trophy, Wallet, User, Home, Dice5, History, Zap, Coins, Search, Bell, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import type { Session } from '@supabase/supabase-js';
import Dashboard from './pages/Dashboard.tsx';
import RankedLobby from './pages/RankedLobby.tsx';
import Casino from './pages/Casino.tsx';
import CasinoDice from './pages/CasinoDice.tsx';
import CasinoPlinko from './pages/CasinoPlinko.tsx';
import CasinoShells from './pages/CasinoShells.tsx';
import PvPDice from './pages/PvPDice.tsx';
import PvPShells from './pages/PvPShells.tsx';
import Ranks from './pages/Ranks.tsx';
import Roulette from './pages/Roulette.tsx';
import Crash from './pages/Crash.tsx';
import Blackjack from './pages/Blackjack.tsx';

export const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

function Sidebar({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const { league, level } = useBalance();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';

  const menuSections = [
    {
      title: 'Main',
      links: [
        { path: '/', label: 'Lobby', icon: Home },
        { path: '/ranked', label: 'Ranked PvP', icon: Trophy, color: 'text-primary' },
        { path: '/ranks', label: 'Leaderboard', icon: Trophy },
      ]
    },
    {
      title: 'Casino',
      links: [
        { path: '/casino', label: 'All Games', icon: Dice5 },
        { path: '/casino/dice', label: 'Dice', icon: Dice5 },
        { path: '/casino/crash', label: 'Crash', icon: Zap },
      ]
    },
    {
      title: 'Account',
      links: [
        { path: '/wallet', label: 'Wallet', icon: Wallet },
        { path: '/history', label: 'History', icon: History },
      ]
    }
  ];

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-background border-r border-white/[0.03] flex flex-col z-50">
      <div className="p-6 mb-2">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-display font-black tracking-tighter uppercase italic">
            Hex<span className="text-primary">bet</span>
          </h1>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">{section.title}</h3>
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive(link.path) ? 'text-primary' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
                  <span className="text-sm font-bold tracking-tight">{link.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/[0.03]">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/40 border border-white/[0.03]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black truncate">{username}</div>
            <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
              {league} • Lvl {level}
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full text-[10px] font-bold text-gray-600 hover:text-danger transition-colors py-3 uppercase tracking-widest">
          Logout
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { balance, level } = useBalance();
  
  return (
    <header className="h-16 ml-60 flex items-center justify-between px-8 bg-background/80 backdrop-blur-xl border-b border-white/[0.03] sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Gamepad2 className="h-4 w-4 text-gray-600" />
          </div>
          <input
            type="text"
            placeholder="Search games..."
            className="block w-full pl-10 pr-3 py-2 bg-card/40 border border-white/[0.03] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-card border border-white/[0.03] rounded-2xl p-1 shadow-inner">
          <div className="px-4 py-1.5 rounded-xl bg-white/[0.03] flex items-center gap-2">
            <Coins className="w-4 h-4 text-warning" />
            <span className="text-sm font-mono font-black text-white">{balance.toFixed(2)}</span>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
            Deposit
          </button>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-card border border-white/[0.03] flex items-center justify-center text-xs font-black text-primary">
          {level}
        </div>
      </div>
    </header>
  );
}

function AppLayout({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background text-white font-sans">
      <Sidebar session={session} onLogout={onLogout} />
      <Topbar />
      <main className="ml-60 p-8 min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ranked" element={<RankedLobby />} />
          <Route path="/ranked/dice/:matchId" element={<PvPDice />} />
          <Route path="/ranked/shell/:matchId" element={<PvPShells />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/casino/dice" element={<CasinoDice />} />
          <Route path="/casino/plinko" element={<CasinoPlinko />} />
          <Route path="/casino/shells" element={<CasinoShells />} />
          <Route path="/casino/roulette" element={<Roulette />} />
          <Route path="/casino/crash" element={<Crash />} />
          <Route path="/casino/blackjack" element={<Blackjack />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/wallet" element={<div className="text-2xl font-bold p-8">Wallet Integration Coming Soon</div>} />
          <Route path="/history" element={<div className="text-2xl font-bold p-8">Match History Coming Soon</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  // Authentication temporarily disabled
  const mockSession = {
    user: {
      email: 'guest@hexbet.local',
      user_metadata: { username: 'GuestPlayer' }
    }
  } as any;

  return (
    <BalanceProvider>
      <Router>
        <AppLayout session={mockSession} onLogout={() => alert("L'authentification est temporairement désactivée")} />
      </Router>
    </BalanceProvider>
  );
}

export default App;
