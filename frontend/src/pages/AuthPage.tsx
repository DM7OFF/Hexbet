import { useState, useEffect, useRef } from 'react';
import { Gamepad2, TrendingUp, Eye, EyeOff, Trophy, Dice5, Target, CircleDot, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LiveWin {
  id: number;
  player: string;
  game: string;
  amount: string;
  multiplier: string;
  color: string;
}

const GAMES = [
  { name: 'Crash', icon: TrendingUp, color: 'from-red-500 to-orange-500', desc: 'Ride the multiplier' },
  { name: 'Dice', icon: Dice5, color: 'from-purple-500 to-pink-500', desc: 'Roll to win' },
  { name: 'Plinko', icon: Target, color: 'from-blue-500 to-cyan-500', desc: 'Drop & multiply' },
  { name: 'Roulette', icon: CircleDot, color: 'from-green-500 to-emerald-500', desc: 'Spin the wheel' },
  { name: 'Ranked PvP', icon: Trophy, color: 'from-yellow-500 to-amber-500', desc: 'Challenge players' },
];

const PLAYERS = ['CryptoKing', 'MoonShot', 'DiamondHands', 'WhaleAlert', 'LuckyDev', 'NightTrader', 'BlockChainX', 'EtherBull', 'SatoshiG', 'Vitalik99'];
const GAME_NAMES = ['Crash', 'Dice', 'Plinko', 'Roulette', 'Ranked PvP'];

function generateWin(id: number): LiveWin {
  const multipliers = ['2.4x', '5.7x', '11.2x', '3.1x', '24.5x', '8.8x', '1.9x', '42.0x'];
  const amounts = ['0.12', '0.45', '1.2', '0.08', '2.5', '0.33', '5.0', '0.9'];
  const colors = ['text-green-400', 'text-yellow-400', 'text-purple-400', 'text-cyan-400', 'text-pink-400'];
  return {
    id,
    player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
    game: GAME_NAMES[Math.floor(Math.random() * GAME_NAMES.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    multiplier: multipliers[Math.floor(Math.random() * multipliers.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

interface AuthPageProps {
  onAuth: () => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showGamePrompt, setShowGamePrompt] = useState(false);
  const [wins, setWins] = useState<LiveWin[]>(() => Array.from({ length: 8 }, (_, i) => generateWin(i)));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const counterRef = useRef(100);

  // Live wins feed
  useEffect(() => {
    const interval = setInterval(() => {
      setWins(prev => [generateWin(counterRef.current++), ...prev.slice(0, 14)]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Listen for OAuth redirect
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        onAuth();
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [onAuth]);

  const handleGameClick = () => {
    setShowGamePrompt(true);
    setTimeout(() => setShowGamePrompt(false), 2500);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        setSuccessMsg('✅ Vérifiez votre email pour confirmer votre compte !');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(123,44,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(123,44,191,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* LEFT — Live feed + Games */}
        <div className="hidden lg:flex flex-col flex-1 p-10 gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-wider">HEX<span className="text-pink-400">BET</span></span>
          </div>

          <div className="mt-4">
            <h1 className="text-5xl font-black leading-tight">
              Jouez.<br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Gagnez.</span><br />
              Recommencez.
            </h1>
            <p className="mt-4 text-gray-400 text-lg max-w-md">
              La plateforme crypto PvP et Casino la plus avancée. Provably fair. Gains instantanés.
            </p>
            <div className="flex gap-6 mt-6">
              {[['Shield', 'text-green-400', 'Provably Fair'], ['Zap', 'text-yellow-400', 'Instantané'], ['Trophy', 'text-purple-400', 'PvP Ranked']].map(([, color, label]) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Games */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">Nos jeux</p>
            <div className="grid grid-cols-5 gap-3">
              {GAMES.map((game) => {
                const Icon = game.icon;
                return (
                  <button
                    key={game.name}
                    onClick={handleGameClick}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 transition-all duration-300 hover:scale-105 hover:border-white/20 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:shadow-lg transition-all`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{game.name}</span>
                    <span className="text-[10px] text-gray-500">{game.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live wins */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Gains en direct</p>
            </div>
            <div className="space-y-2 overflow-hidden max-h-52">
              {wins.map((win, i) => (
                <div
                  key={win.id}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/3 border border-white/5 text-sm"
                  style={{ animation: i === 0 ? 'slideIn 0.4s ease-out' : 'none', opacity: 1 - i * 0.06 }}
                >
                  <span className="text-gray-400 font-medium w-24 truncate">{win.player}</span>
                  <span className="text-gray-500 text-xs">{win.game}</span>
                  <span className="text-purple-400 font-mono text-xs">{win.multiplier}</span>
                  <span className={`font-mono font-bold ${win.color}`}>+{win.amount} ETH</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Auth form */}
        <div className="w-full lg:w-[440px] flex items-center justify-center p-6 lg:p-10 relative">
          <div className="absolute inset-0 bg-white/2 backdrop-blur-sm border-l border-white/5 hidden lg:block" />

          <div className="relative w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-wider">HEX<span className="text-pink-400">BET</span></span>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-8">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                    mode === m
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-black mb-1">
              {mode === 'login' ? 'Content de vous revoir 👋' : 'Rejoignez HexBet 🚀'}
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              {mode === 'login' ? 'Connectez-vous pour accéder à vos jeux.' : 'Créez votre compte et commencez à gagner.'}
            </p>

            {/* Error / Success */}
            {error && (
              <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="CryptoKing"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Mot de passe oublié ?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-pink-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Chargement...
                  </span>
                ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-600">ou continuer avec</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="animate-spin w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continuer avec Google
            </button>

            {mode === 'register' && (
              <p className="mt-5 text-center text-[11px] text-gray-600">
                En créant un compte, vous acceptez nos{' '}
                <span className="text-purple-400 cursor-pointer hover:underline">conditions d'utilisation</span>
                {' '}et notre{' '}
                <span className="text-purple-400 cursor-pointer hover:underline">politique de confidentialité</span>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Game click prompt */}
      {showGamePrompt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/90 to-purple-600/90 backdrop-blur-md text-white text-sm font-bold shadow-2xl border border-white/20" style={{ animation: 'slideIn 0.3s ease-out' }}>
          🔒 Connectez-vous pour jouer !
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
