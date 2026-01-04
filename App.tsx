
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { 
  Menu, 
  X, 
  CheckCircle2, 
  ArrowUpRight, 
  MessageCircle,
  TrendingUp,
  Zap,
  Globe,
  Repeat,
  BarChart3,
  PieChart,
  Briefcase,
  Sun,
  Moon,
  Lock,
  Mail,
  User,
  ShieldAlert,
  Loader2,
  TrendingDown,
  LogOut,
  Settings,
  Shield,
  Star,
  Send,
  Share2,
  Quote,
  Clock,
  Users
} from 'lucide-react';
import { fetchMarketData } from './services/cryptoService';
import { getMarketInsights } from './services/aiService';
import { authService } from './services/authService';
import { CryptoAsset } from './types';
import { INVESTMENT_PLANS, SERVICES, TESTIMONIALS } from './constants';

const ProtectedRoute = ({ 
  children, 
  user,
  isInitializing,
  allowedRoles 
}: { 
  children: React.ReactNode, 
  user: any,
  isInitializing: boolean,
  allowedRoles?: string[] 
}) => {
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="relative flex flex-col items-center gap-6 p-12 glass-card rounded-[3rem] border-white/5 shadow-2xl">
          <div className="relative">
            <Loader2 className="animate-spin text-amber-500 relative z-10" size={52} />
            <div className="absolute inset-0 animate-ping bg-amber-500/20 rounded-full blur-xl"></div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Security Protocol</p>
            <h3 className="text-white text-xl font-bold tracking-tight">Securing Session...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = authService.getRedirectPath(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

const AuthModal = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'login' 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onLoginSuccess: (user: any) => void,
  initialMode?: 'login' | 'signup' 
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setApiError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);
    
    try {
      if (mode === 'signup') {
        await authService.signup(formData);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMode('login');
        }, 2000);
      } else {
        // Authenticate and wait for result
        const result = await authService.login(formData);
        
        // Update user state first
        onLoginSuccess(result.user);
        
        // Success state for feedback if needed, though we navigate immediately
        setIsSuccess(true);
        
        // Immediate cleanup and navigation
        onClose();
        const redirectPath = authService.getRedirectPath(result.user.role);
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-card rounded-[2.5rem] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-amber-500"><X size={24} /></button>
        {isSuccess && mode === 'signup' ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce"><CheckCircle2 size={40} /></div>
            <h2 className="text-3xl font-bold">Account Created!</h2>
            <p className="text-slate-500">Switching to login form...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-slate-500">Access the world's most robust markets.</p>
            </div>
            {apiError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex gap-3"><ShieldAlert size={20} />{apiError}</div>}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 px-1">Full Name</label>
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="John Doe" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 px-1">Email</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" placeholder="john@example.com" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 px-1">Password</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" placeholder="••••••••" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-12 py-3" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-600 transition-all flex justify-center items-center shadow-xl shadow-amber-500/20">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : mode === 'signup' ? 'Join BullsAndBearsFx' : 'Launch Dashboard'}
            </button>
            <p className="text-center text-sm text-slate-500">
              {mode === 'signup' ? 'Existing member?' : "New here?"} 
              <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-amber-500 font-bold ml-1 hover:underline">{mode === 'signup' ? 'Log In' : 'Sign Up'}</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

const LandingPage = ({ isDarkMode, setIsDarkMode, user, onLogout, setAuthModal, aiInsight, marketData }: any) => {
  const navigate = useNavigate();
  const IconMap: Record<string, React.FC<any>> = { Repeat, Briefcase, Globe, TrendingUp, BarChart3, PieChart };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-amber-500" size={32} />
          <span className="text-2xl font-black tracking-tighter">BULLS<span className="text-amber-500">&</span>BEARS<span className="text-slate-500">FX</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <div className="flex gap-4 items-center">
              <span className="text-sm font-bold">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={() => navigate(authService.getRedirectPath(user.role))} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-full"><Settings size={20} /></button>
              <button onClick={onLogout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full"><LogOut size={20} /></button>
            </div>
          ) : (
            <button onClick={() => setAuthModal('login')} className="bg-amber-500 text-black px-6 py-2 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20">Client Login</button>
          )}
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
                <Shield size={14} /> Regulated Global Broker
              </div>
              <h1 className="text-7xl font-black leading-[1.1] tracking-tight">Institutional <br/><span className="text-amber-500">Precision</span> in Every Trade.</h1>
              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Experience the next generation of asset management. Powered by AI, protected by military-grade security, and built for the modern investor.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setAuthModal('signup')} className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform flex items-center gap-3">
                  Start Investing <ArrowUpRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-500/20 blur-[100px] rounded-full animate-pulse"></div>
              <div className="relative glass-card rounded-[3rem] p-8 border border-white/10 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <Zap className="text-amber-500" />
                    <span className="font-bold uppercase text-xs tracking-widest text-slate-400">Live AI Signals</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-slate-300">
                    "{aiInsight || 'Initializing institutional analysis protocols...'}"
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {marketData.slice(0, 4).map((asset: any) => (
                      <div key={asset.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{asset.symbol}</p>
                          <p className="font-bold">${asset.current_price.toLocaleString()}</p>
                        </div>
                        <div className={`text-xs font-bold ${asset.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="services" className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black">Our Premium <span className="text-amber-500">Services</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Diversified trading options designed to maximize your capital growth across multiple asset classes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {SERVICES.map((service, idx) => {
                const Icon = IconMap[service.icon] || Globe;
                return (
                  <div key={idx} className="p-8 glass-card rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all group">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const DashboardContent = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-12 rounded-[3rem] text-center space-y-6 max-w-lg">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto"><User size={40} /></div>
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <p className="text-slate-400">Welcome back, {user?.name}. Your institutional portfolio is being synchronized for this session.</p>
        <button onClick={() => navigate('/')} className="text-amber-500 font-bold hover:underline">Return to Overview</button>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [marketData, setMarketData] = useState<CryptoAsset[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchMarketData();
        setMarketData(data);
        if (data && data.length > 0) {
          const topAssets = data.slice(0, 3).map(a => a.symbol).join(', ');
          const insight = await getMarketInsights(topAssets);
          setAiInsight(insight);
        }
      } catch (e) {
        console.error("Platform initialization failed", e);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div className={isDarkMode ? 'dark bg-[#05070a] text-white' : 'bg-white text-slate-900'}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <LandingPage 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              user={user} 
              onLogout={handleLogout} 
              setAuthModal={(mode: 'login' | 'signup') => { setAuthModalMode(mode); setIsAuthModalOpen(true); }}
              aiInsight={aiInsight}
              marketData={marketData}
            />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute user={user} isInitializing={isInitializing} allowedRoles={['INVESTOR']}>
              <DashboardContent user={user} />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLoginSuccess={(userData) => setUser(userData)} 
          initialMode={authModalMode}
        />
      </BrowserRouter>
    </div>
  );
};

export default App;
