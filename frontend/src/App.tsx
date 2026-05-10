import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Gamepad2, Trophy, Wallet, User, Home, Dice5, History } from 'lucide-react';
import { io } from 'socket.io-client';
import type { Session } from '@supabase/supabase-js';
import Dashboard from './pages/Dashboard.tsx';
import RankedLobby from './pages/RankedLobby.tsx';
import Casino from './pages/Casino.tsx';
import CasinoDice from './pages/CasinoDice.tsx';
import PvPDice from './pages/PvPDice.tsx';

export const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

function Sidebar({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
  const avatarUrl = session.user.user_metadata?.avatar_url;

  const links = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/ranked', label: 'Ranked PvP', icon: Trophy, accent: 'text-primary' },
    { path: '/casino', label: 'Casino', icon: Dice5, accent: 'text-secondary' },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-white/10 glass-panel flex flex-col z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <Gamepad2 className="w-8 h-8 text-secondary" />
        <h1 className="text-2xl font-display font-bold tracking-wider">HEX<span className="text-primary">BET</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive(link.path)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${link.accent || ''} ${isActive(link.path) ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
              : <User className="w-5 h-5" />
            }
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{username}</div>
            <div className="text-xs text-primary font-mono font-medium">Gold Rank</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors py-1"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="h-20 ml-64 flex items-center justify-between px-8 border-b border-white/10 glass-panel sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 rounded-full bg-surface border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span className="text-sm font-medium text-gray-300">Server Status: Online</span>
        </div>
        <div className="px-4 py-2 rounded-full bg-surface border border-white/10 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">PvP Players: <span className="text-primary">1,402</span></span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="text-lg font-mono font-bold text-success">2.450 ETH</div>
          </div>
          <button className="btn-primary py-2 px-4 text-sm">Deposit</button>
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
      <main className="ml-64 p-8 min-h-[calc(100vh-5rem)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ranked" element={<RankedLobby />} />
          <Route path="/ranked/dice" element={<PvPDice />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/casino/dice" element={<CasinoDice />} />
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
    <Router>
      <AppLayout session={mockSession} onLogout={() => alert("L'authentification est temporairement désactivée")} />
    </Router>
  );
}

export default App;
