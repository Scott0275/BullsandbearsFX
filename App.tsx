
import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight, 
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Clock,
  Briefcase,
  PieChart,
  Globe,
  Repeat,
  BarChart3,
  CreditCard,
  Eye,
  Layers,
  Users,
  Sun,
  Moon,
  Lock,
  Mail,
  User,
  ShieldAlert,
  Loader2,
  TrendingDown,
  LogOut,
  LayoutDashboard,
  Settings,
  Shield
} from 'lucide-react';
import { fetchMarketData } from './services/cryptoService';
import { getMarketInsights } from './services/aiService';
import { authService } from './services/authService';
import { CryptoAsset } from './types';
import { INVESTMENT_PLANS, SERVICES, WHY_CHOOSE_US, FAQS } from './constants';

/**
 * Higher-order component to protect routes based on authentication and roles.
 * Updated to handle loading states and reactive user data.
 */
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-500" size={40} />
          <p className="text-amber-500/60 font-bold uppercase tracking-widest text-xs">Securing Session...</p>
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setApiError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup' && !formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (mode === 'signup' && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
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
        const result = await authService.login(formData);
        setIsSuccess(true);
        
        // CRITICAL: Update parent state BEFORE navigating to ensure ProtectedRoute has the user data
        onLoginSuccess(result.user);
        
        const redirectPath = authService.getRedirectPath(result.user.role);
        
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          navigate(redirectPath, { replace: true });
        }, 800);
      }
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-amber-500 transition-colors"
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold">{mode === 'signup' ? 'Account Created!' : 'Welcome Back!'}</h2>
            <p className="text-slate-500 dark:text-gray-400">
              {mode === 'signup' ? 'Switching to login...' : 'Securely logging you in...'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-slate-500 dark:text-gray-400">
                {mode === 'signup' ? 'Start your journey with BullsandbearsFx.' : 'Access your portfolio and start trading.'}
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                <ShieldAlert size={20} className="shrink-0" />
                <p>{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 px-1">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 px-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 px-1">{errors.password}</p>}
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 px-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (mode === 'signup' ? 'Sign Up' : 'Log In')}
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-gray-400 pt-2">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"} 
                <button 
                  type="button" 
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-amber-500 font-bold ml-1 hover:underline"
                >
                  {mode === 'signup' ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// Generic Dashboard Shell for Consistency
const DashboardShell = ({ title, children, user, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#05070a] text-slate-900 dark:text-white transition-colors">
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">BB</div>
            <span className="text-2xl font-bold tracking-tighter">Bullsandbears<span className="text-amber-500">Fx</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
              <p className="text-sm font-bold">{user?.name}</p>
            </div>
            <button onClick={onLogout} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium">Welcome back, {user?.name?.split(' ')[0]}. Here is your overview.</p>
        </div>
        {children}
      </main>
    </div>
  );
};

const InvestorDashboard = ({ user, onLogout }: any) => (
  <DashboardShell title="Investor Dashboard" user={user} onLogout={onLogout}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { label: 'Total Equity', value: '$124,500.00', icon: TrendingUp, color: 'emerald' },
        { label: 'Active Trades', value: '14', icon: Repeat, color: 'blue' },
        { label: 'ROI (30d)', value: '+8.4%', icon: ArrowUpRight, color: 'amber' }
      ].map((stat, i) => (
        <div key={i} className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-none">
          <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-500 w-fit rounded-xl mb-4`}>
            <stat.icon size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
          <p className="text-3xl font-black mt-1 tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-8 glass-card rounded-[2.5rem] p-10 h-64 flex items-center justify-center border border-dashed border-slate-300 dark:border-white/10 text-slate-400">
      Interactive Performance Chart Loading...
    </div>
  </DashboardShell>
);

const AdminDashboard = ({ user, onLogout }: any) => (
  <DashboardShell title="Tenant Administration" user={user} onLogout={onLogout}>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Clients', value: '1,240', icon: Users },
        { label: 'Revenue (MTD)', value: '$542,000', icon: BarChart3 },
        { label: 'Approval Queue', value: '12', icon: Clock },
        { label: 'System Health', value: '99.9%', icon: Zap }
      ].map((stat, i) => (
        <div key={i} className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-400 font-black uppercase mb-1 tracking-widest">{stat.label}</p>
          <p className="text-2xl font-black">{stat.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-8 p-10 glass-card rounded-[2.5rem] border border-slate-200 dark:border-white/10">
      <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><User size={18} /></div>
              <div><p className="font-bold text-sm">Transaction #{1000 + i}</p><p className="text-xs text-slate-500">2 minutes ago</p></div>
            </div>
            <p className="font-bold text-emerald-500">+$2,500.00</p>
          </div>
        ))}
      </div>
    </div>
  </DashboardShell>
);

const SuperAdminDashboard = ({ user, onLogout }: any) => (
  <DashboardShell title="Super-Admin Core" user={user} onLogout={onLogout}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
         <div className="p-8 bg-amber-500 text-black rounded-[2.5rem] shadow-2xl shadow-amber-500/20">
            <h3 className="text-2xl font-black mb-2">Global Platform Status</h3>
            <p className="font-medium opacity-80 mb-6">All server clusters operating at peak performance across 4 regions.</p>
            <button className="px-6 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"><Shield size={20} /> Server Logs</button>
         </div>
         <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6">Tenant Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5"><th className="pb-4 text-xs font-black uppercase text-slate-400">Tenant</th><th className="pb-4 text-xs font-black uppercase text-slate-400">Status</th><th className="pb-4 text-xs font-black uppercase text-slate-400">Actions</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-white/5"><td className="py-4 font-bold">BullsandbearsFx</td><td><span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase">Active</span></td><td className="py-4"><button className="text-amber-500 font-bold text-sm">Manage</button></td></tr>
                  <tr className="border-b border-slate-200 dark:border-white/5"><td className="py-4 font-bold">ZenithTrade</td><td><span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase">Active</span></td><td className="py-4"><button className="text-amber-500 font-bold text-sm">Manage</button></td></tr>
                </tbody>
              </table>
            </div>
         </div>
      </div>
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
          <h4 className="font-bold flex items-center gap-2 mb-4"><Settings size={18} /> Global Config</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Update platform-wide maintenance windows or fee structures from here.</p>
        </div>
      </div>
    </div>
  </DashboardShell>
);

const LandingPage = ({ isDarkMode, setIsDarkMode, user, onLogout, setAuthModal, aiInsight, marketData }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const IconMap: Record<string, React.FC<any>> = {
    Repeat, Briefcase, Globe, TrendingUp, BarChart3, PieChart
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-amber-500/10">BB</div>
            <span className="text-2xl font-bold tracking-tighter">Bullsandbears<span className="text-amber-500">Fx</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-gray-400">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="hover:text-amber-500 transition-colors">Home</a>
            <a href="#markets" onClick={(e) => scrollToSection(e, '#markets')} className="hover:text-amber-500 transition-colors">Markets</a>
            <a href="#services" onClick={(e) => scrollToSection(e, '#services')} className="hover:text-amber-500 transition-colors">Services</a>
            <a href="#plans" onClick={(e) => scrollToSection(e, '#plans')} className="hover:text-amber-500 transition-colors">Plans</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="hover:text-amber-500 transition-colors">Contact</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform active:scale-95 shadow-sm">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role?.replace('_', ' ')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={20} />
                </button>
                <button 
                  onClick={() => navigate(authService.getRedirectPath(user.role))}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-amber-500/20"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="px-6 py-2.5 text-slate-900 dark:text-white font-bold hover:text-amber-500 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-amber-500/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-400 active:scale-90">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-gray-400 active:scale-90">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Market Ticker */}
      <div id="markets" className="pt-24 pb-4 bg-slate-50/80 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 transition-colors overflow-hidden">
        <div className="ticker-mask relative w-full overflow-hidden">
          <div className="flex animate-scroll hover:[animation-play-state:paused] whitespace-nowrap py-2 cursor-pointer">
            {[...marketData, ...marketData, ...marketData].map((asset, idx) => (
              <div 
                key={`${asset.id}-${idx}`} 
                className="inline-flex items-center gap-4 px-10 border-r border-slate-200 dark:border-white/10 group transition-all"
              >
                <img src={asset.image} alt={asset.name} className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all duration-300" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-slate-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors uppercase tracking-widest">{asset.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={`flex items-center gap-0.5 text-[10px] font-black ${asset.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {asset.price_change_percentage_24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(asset.price_change_percentage_24h)?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="home" className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
              <Zap size={14} className="fill-current" /> Institutional Grade Trading
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Trade Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200">Scale Consistently.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl font-medium">
              Access the world's most robust financial markets with institutional tools, zero hidden fees, and lightning-fast execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => user ? navigate(authService.getRedirectPath(user.role)) : setAuthModal({ isOpen: true, mode: 'signup' })} 
                className="px-10 py-5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                {user ? 'Go to Dashboard' : 'Start Trading Now'} <ArrowUpRight size={22} />
              </button>
              <button onClick={(e) => scrollToSection(e, '#services')} className="px-10 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                Explore Services
              </button>
            </div>
            <div className="p-5 glass-card rounded-[2rem] border border-slate-200/50 dark:border-white/10 flex items-start gap-4 text-left shadow-xl shadow-slate-200/20 dark:shadow-none">
              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
                <MessageCircle size={28} />
              </div>
              <div>
                <h4 className="font-black text-amber-600 dark:text-amber-400 text-xs mb-1 uppercase tracking-tighter">AI Pulse Insight</h4>
                <p className="text-slate-600 dark:text-gray-300 text-sm italic font-medium">"{aiInsight}"</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative group">
            <div className="relative z-10 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl group-hover:rotate-1 transition-transform duration-700">
              <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=2070" alt="Trading Dashboard" className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#05070a] via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10 p-8 glass-card rounded-[2rem] animate-bounce-slow shadow-2xl">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">Portfolio Performance</p>
                    <p className="text-4xl font-black text-emerald-500 tracking-tight">+12.45%</p>
                  </div>
                  <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-500">
                    <TrendingUp size={32} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-6 bg-slate-50 dark:bg-[#0a0e17]/50 transition-colors">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Financial Mastery Tools</h2>
          <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">Elite financial technology designed to bridge the gap between retail trading and professional wealth management.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => {
            const Icon = IconMap[service.icon] || Globe;
            return (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-3 group shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500">
                  <Icon size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-medium">{service.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer id="contact" className="py-24 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/50 transition-colors">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-lg shadow-amber-500/20">BB</div>
            <span className="text-3xl font-black tracking-tighter">Bullsandbears<span className="text-amber-500">Fx</span></span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Leading the evolution of online trading with transparency, high-performance tools, and unwavering client commitment. Join 30,000+ investors worldwide.
          </p>
          <div className="pt-12 border-t border-slate-200 dark:border-white/5">
             <p className="text-[10px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-[0.3em]">© 2024 BullsandbearsFx Corporation. Global Registered Entity.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<CryptoAsset[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('Analyzing market sentiment...');
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'signup'}>({
    isOpen: false,
    mode: 'login'
  });
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  // CRITICAL: Handle initial session check on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadMarket = async () => {
      const data = await fetchMarketData();
      setMarketData(data);
      if (data && data.length > 0) {
        const topAssets = data.slice(0, 3).map(a => a.name).join(', ');
        const insight = await getMarketInsights(topAssets);
        setAiInsight(insight);
      }
    };
    loadMarket();
    const interval = setInterval(loadMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/'; // Hard redirect to clear all states and catch-all routes
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-[#05070a] text-slate-900 dark:text-white transition-colors duration-300">
        <AuthModal 
          isOpen={authModal.isOpen} 
          initialMode={authModal.mode}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        />
        
        <Routes>
          <Route path="/" element={
            <LandingPage 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              user={user} 
              onLogout={handleLogout}
              setAuthModal={setAuthModal}
              aiInsight={aiInsight}
              marketData={marketData}
            />
          } />

          {/* Role-Based Protected Routes with reactive user state */}
          <Route path="/dashboard" element={
            <ProtectedRoute user={user} isInitializing={isInitializing} allowedRoles={['INVESTOR']}>
              <InvestorDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute user={user} isInitializing={isInitializing} allowedRoles={['TENANT_ADMIN']}>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          <Route path="/super-admin" element={
            <ProtectedRoute user={user} isInitializing={isInitializing} allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
