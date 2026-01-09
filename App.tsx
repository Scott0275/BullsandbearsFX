
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
  Shield,
  Star,
  Send,
  Share2,
  Quote,
  Plus,
  Bell,
  Copy,
  AlertCircle,
  CheckCircle,
  Gift,
  ClipboardList
} from 'lucide-react';
import { fetchMarketData } from './services/cryptoService';
import { getMarketInsights } from './services/aiService';
import { authService } from './services/authService';
import { walletService } from './services/walletService';
import { transactionService } from './services/transactionService';
import { investmentService } from './services/investmentService';
import { adminService } from './services/adminService';
import { dashboardService } from './services/dashboardService';
import { kycService } from './services/kycService';
import { notificationService } from './services/notificationService';
import { userService } from './services/userService';
import { CryptoAsset } from './types';
import { INVESTMENT_PLANS, SERVICES, WHY_CHOOSE_US, FAQS, TESTIMONIALS } from './constants';

/**
 * Higher-order component to protect routes based on authentication and roles.
 * Handles case-insensitive role matching and provides clear access denial.
 */
const ProtectedRoute = ({ 
  children, 
  user,
  allowedRoles 
}: { 
  children: React.ReactNode, 
  user: any,
  allowedRoles?: string[] 
}) => {
  // Redirect unauthenticated users
  if (!user) {
    console.warn('Access denied: No authenticated user');
    return <Navigate to="/" replace />;
  }

  // Check if user has required role (case-insensitive comparison)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase() || '';
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`Access denied: User role '${user.role}' not in allowed roles:`, allowedRoles);
      return <Navigate to="/" replace />;
    }
  }

  return children;
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
          setFormData(prev => ({ ...prev, name: '', password: '', confirmPassword: '' }));
        }, 2000);
      } else {
        const result = await authService.login(formData);
        
        // Update global user state ONLY
        onLoginSuccess(result.user);
        
        // Close modal immediately
        setIsSuccess(false);
        onClose();
      }
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-amber-500 transition-colors">
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold">{mode === 'signup' ? 'Account Created!' : 'Welcome Back!'}</h2>
            <p className="text-slate-500 dark:text-gray-400">{mode === 'signup' ? 'Switching to login form...' : 'Securely logging you in...'}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-slate-500 dark:text-gray-400">{mode === 'signup' ? 'Start your journey with BullsandbearsFx.' : 'Access your portfolio and start trading.'}</p>
            </div>
            {apiError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                <ShieldAlert size={20} className="shrink-0" /><p>{apiError}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="John Doe" className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 px-1">{errors.name}</p>}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" placeholder="john@example.com" className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 px-1">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" placeholder="••••••••" className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 px-1">{errors.password}</p>}
              </div>
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 dark:text-gray-500 px-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" placeholder="••••••••" className={`w-full bg-slate-100 dark:bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 px-1">{errors.confirmPassword}</p>}
                </div>
              )}
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70 active:scale-95">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (mode === 'signup' ? 'Create Secure Account' : 'Log In')}
                </button>
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-gray-400 pt-2">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"} 
                <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-amber-500 font-bold ml-1 hover:underline">
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

const NotificationDropdown = ({ user }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(1, 5);
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationColor = (type: string) => {
    if (type.includes('APPROVED')) return 'emerald';
    if (type.includes('REJECTED')) return 'red';
    if (type.includes('EARNED') || type.includes('CREDITED')) return 'amber';
    return 'slate';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-amber-500 hover:text-amber-600 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-2 p-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      notif.read
                        ? 'bg-slate-100 dark:bg-white/5'
                        : 'bg-amber-500/10 dark:bg-amber-500/20 border-l-4 border-amber-500'
                    }`}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-2">
                      {notif.type.includes('APPROVED') && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
                      {notif.type.includes('REJECTED') && <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                      {notif.type.includes('CREDITED') && <Gift size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-bold">{notif.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

const DashboardShell = ({ title, children, user, onLogout }: any) => {
  const navigate = useNavigate();
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
            <NotificationDropdown user={user} />
            <button 
              onClick={() => navigate('/profile')} 
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
            >
              <User size={20} />
            </button>
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

const DepositForm = ({ onSuccess }: any) => {
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cryptoOptions = ['BTC', 'ETH', 'USDT', 'USDC'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!walletAddress) {
      alert('Please enter your wallet address');
      return;
    }

    try {
      setSubmitting(true);
      const deposit = await walletService.requestDeposit(parseFloat(amount), selectedCrypto, walletAddress);
      alert(`Deposit request created! Transaction ID: ${deposit.id}\nSend ${amount} ${selectedCrypto} to the provided address.`);
      setAmount('');
      setWalletAddress('');
      onSuccess?.();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Cryptocurrency</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto}
              type="button"
              onClick={() => setSelectedCrypto(crypto)}
              className={`p-4 rounded-xl border-2 font-bold transition-all ${
                selectedCrypto === crypto
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-500/50'
              }`}
            >
              {crypto}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Amount ({selectedCrypto})</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          step="0.01"
          min="0"
          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Your Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder={`Enter your ${selectedCrypto} wallet address`}
          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <ArrowUpRight size={20} />}
        {submitting ? 'Submitting...' : 'Request Deposit'}
      </button>
    </form>
  );
};

const WithdrawalForm = ({ balance, onSuccess }: any) => {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > balance) {
      alert(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      return;
    }
    if (!recipientAddress) {
      alert('Please enter recipient address');
      return;
    }

    try {
      setSubmitting(true);
      const withdrawal = await walletService.requestWithdrawal(parseFloat(amount), recipientAddress);
      alert(`Withdrawal request created! Transaction ID: ${withdrawal.id}\nYour withdrawal is pending admin approval.`);
      setAmount('');
      setRecipientAddress('');
      onSuccess?.();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Available Balance</p>
        <p className="text-3xl font-black text-blue-500">${balance?.toFixed(2) || '0.00'}</p>
      </div>

      <div>
        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Withdrawal Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to withdraw"
          step="0.01"
          min="0"
          max={balance || 0}
          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Recipient Bank/Wallet Address</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter bank account or wallet address"
          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        {submitting ? 'Processing...' : 'Request Withdrawal'}
      </button>
    </form>
  );
};

const InvestorDashboard = ({ user, onLogout }: any) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, deposit, withdraw, referrals
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading investor dashboard...');
        const data = await dashboardService.getInvestorDashboard();
        console.log('Dashboard data received:', data);
        
        if (!data) {
          throw new Error('No dashboard data returned from server');
        }
        
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load investor dashboard:', err);
        console.error('Error details:', err.message, err.stack);
        setError(err.message || 'Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Investor Dashboard" user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell title="Investor Dashboard" user={user} onLogout={onLogout}>
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      </DashboardShell>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardShell title="Investor Dashboard" user={user} onLogout={onLogout}>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
          <p className="text-amber-400 font-bold mb-4">Dashboard data is not available</p>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">This may indicate the backend is not responding or the endpoint is not configured.</p>
          <button
            onClick={handleRefreshDashboard}
            className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </DashboardShell>
    );
  }

  const wallet = dashboardData.wallet;
  const investments = dashboardData.investments;
  const transactions = dashboardData.transactions || [];
  const kycStatus = dashboardData.kycStatus;
  const unreadNotifications = dashboardData.unreadNotifications || 0;
  const paymentAddresses = dashboardData.paymentAddresses || [];

  // Get KYC badge styling
  const getKYCBadgeStyle = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  // Map color names to static Tailwind classes (avoids dynamic class generation)
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
      red: { bg: 'bg-red-500/10', text: 'text-red-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
    };
    return colorMap[color] || colorMap.emerald;
  };

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    if (filterType !== 'ALL') {
      filtered = filtered.filter(txn => txn.type === filterType);
    }
    
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(txn => txn.status === filterStatus);
    }
    
    // Sort transactions
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }
    
    return filtered;
  }, [transactions, filterType, filterStatus, sortBy]);

  const handleRefreshDashboard = async () => {
    try {
      const data = await dashboardService.getInvestorDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to refresh dashboard:', err);
    }
  };

  return (
    <DashboardShell title="Investor Dashboard" user={user} onLogout={onLogout}>
      {/* KYC Status & Notifications Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className={`glass-card p-4 rounded-2xl border ${getKYCBadgeStyle()} flex items-center justify-between`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-1">KYC Status</p>
            <p className="text-lg font-bold capitalize">{kycStatus.replace('_', ' ')}</p>
          </div>
          <ShieldCheck size={32} />
        </div>
        <div className="glass-card p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between bg-blue-500/5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-1">Unread Notifications</p>
            <p className="text-lg font-bold text-blue-400">{unreadNotifications} new</p>
          </div>
          <MessageCircle size={32} className="text-blue-400" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'deposit', label: 'Deposit', icon: ArrowUpRight },
          { id: 'withdraw', label: 'Withdraw', icon: Send },
          { id: 'referrals', label: 'Referrals', icon: Share2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Wallet Balance', value: `$${wallet?.balance?.toFixed(2) || '0.00'}`, icon: CreditCard, color: 'emerald' },
          { label: 'Total Invested', value: `$${wallet?.totalInvested?.toFixed(2) || '0.00'}`, icon: Briefcase, color: 'blue' },
          { label: 'Total Earned', value: `$${wallet?.totalEarned?.toFixed(2) || '0.00'}`, icon: ArrowUpRight, color: 'amber' }
        ].map((stat, i) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div key={i} className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <div className={`p-3 ${colorClasses.bg} ${colorClasses.text} w-fit rounded-xl mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Investment Summary & Transaction Filtering */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Investment Stats */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-6">Investment Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Repeat size={20} className="text-blue-500" />
                    <div>
                      <p className="font-bold text-sm">Active Investments</p>
                      <p className="text-xs text-slate-500">ongoing</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-blue-500">{investments?.active || 0}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <div>
                      <p className="font-bold text-sm">Completed</p>
                      <p className="text-xs text-slate-500">finished</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-emerald-500">{investments?.completed || 0}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-amber-500" />
                    <div>
                      <p className="font-bold text-sm">Total Value</p>
                      <p className="text-xs text-slate-500">portfolio</p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-amber-500">${investments?.totalValue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            {/* Transaction Filtering & Display */}
            <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-6">Transactions</h3>
              
              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="ALL">All Types</option>
                      <option value="DEPOSIT">Deposits</option>
                      <option value="WITHDRAWAL">Withdrawals</option>
                      <option value="INVESTMENT_DEBIT">Investments</option>
                      <option value="ROI_CREDIT">ROI Credits</option>
                      <option value="REFERRAL_CREDIT">Referrals</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="ALL">All Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="amount-desc">Amount (High)</option>
                      <option value="amount-asc">Amount (Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{txn.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${txn.type.includes('CREDIT') || txn.type.includes('ROI') ? 'text-emerald-500' : 'text-red-500'}`}>
                          {txn.type.includes('CREDIT') || txn.type.includes('ROI') ? '+' : '-'}${txn.amount.toFixed(2)}
                        </p>
                        <p className={`text-xs ${txn.status === 'APPROVED' ? 'text-emerald-500' : txn.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>{txn.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">No transactions match the filters</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Addresses for Deposits */}
          {paymentAddresses.length > 0 && (
            <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-6">Deposit Payment Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentAddresses.map((addr) => (
                  <div key={addr.id} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <p className="font-bold text-sm mb-2 text-slate-600 dark:text-slate-300">{addr.crypto}</p>
                    <p className="text-xs font-mono text-slate-500 break-all">{addr.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'deposit' && (
        <div className="max-w-2xl">
          <div className="glass-card rounded-[2.5rem] p-12 border border-slate-200 dark:border-white/10">
            <h2 className="text-3xl font-bold mb-2">Request Deposit</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">Send cryptocurrency to our wallet address and we'll credit your account once verified on the blockchain.</p>
            <DepositForm onSuccess={handleRefreshDashboard} />
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="max-w-2xl">
          <div className="glass-card rounded-[2.5rem] p-12 border border-slate-200 dark:border-white/10">
            <h2 className="text-3xl font-bold mb-2">Request Withdrawal</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">Withdraw your available balance. Your request will be reviewed and processed within 24-48 hours.</p>
            <WithdrawalForm balance={wallet?.balance || 0} onSuccess={handleRefreshDashboard} />
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
          <button
            onClick={() => navigate('/referrals')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 mb-6"
          >
            <Share2 size={20} /> View Full Referral Dashboard
          </button>
          <p className="text-slate-600 dark:text-slate-400">
            Click the button above to access your complete referral program dashboard with detailed analytics, referral statistics, and earning tracking.
          </p>
        </div>
      )}
    </DashboardShell>
  );
};

const AdminSettings = ({ user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('addresses'); // addresses, plans, users
  const [paymentAddresses, setPaymentAddresses] = useState<any[]>([]);
  const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ crypto: 'BTC', address: '' });
  const [submittingAddress, setSubmittingAddress] = useState(false);

  // Investment Plan Form State
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', minAmount: 0, maxAmount: 0, roi: 0, duration: 30, description: '', features: '' });
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // User Management State
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'addresses') {
        const data = await adminService.getPaymentAddresses();
        setPaymentAddresses(data || []);
      } else if (activeTab === 'plans') {
        const data = await adminService.listInvestmentPlans();
        setInvestmentPlans(data || []);
      } else if (activeTab === 'users') {
        const data = await adminService.listUsers();
        setUsers(data || []);
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.crypto || !newAddress.address) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSubmittingAddress(true);
      await adminService.addPaymentAddress(newAddress.crypto, newAddress.address);
      setNewAddress({ crypto: 'BTC', address: '' });
      setShowAddressForm(false);
      await loadData();
      alert('Payment address added successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await adminService.deletePaymentAddress(addressId);
      await loadData();
      alert('Payment address deleted successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || newPlan.minAmount <= 0 || newPlan.maxAmount <= 0 || newPlan.roi <= 0 || !newPlan.features) {
      alert('Please fill all required fields correctly');
      return;
    }

    try {
      setSubmittingPlan(true);
      await adminService.createInvestmentPlan({
        name: newPlan.name,
        minAmount: newPlan.minAmount,
        maxAmount: newPlan.maxAmount,
        roi: newPlan.roi,
        duration: newPlan.duration,
        description: newPlan.description,
        features: newPlan.features.split(',').map(f => f.trim())
      });
      setNewPlan({ name: '', minAmount: 0, maxAmount: 0, roi: 0, duration: 30, description: '', features: '' });
      setShowPlanForm(false);
      await loadData();
      alert('Investment plan created successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    try {
      setSuspendingUserId(userId);
      await adminService.suspendUser(userId, 'Suspended by admin');
      await loadData();
      alert('User suspended successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSuspendingUserId(null);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to unsuspend this user?')) return;

    try {
      setSuspendingUserId(userId);
      await adminService.unsuspendUser(userId);
      await loadData();
      alert('User unsuspended successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSuspendingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchUser.trim()) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [users, searchUser]);

  return (
    <DashboardShell title="Admin Settings" user={user} onLogout={onLogout}>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'addresses', label: 'Payment Addresses', icon: Layers },
          { id: 'plans', label: 'Investment Plans', icon: PieChart },
          { id: 'users', label: 'User Management', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <>
          {/* Payment Addresses Tab */}
          {activeTab === 'addresses' && (
            <>
              <div className="mb-8">
                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} /> Add Payment Address
                  </button>
                ) : (
                  <div className="max-w-2xl">
                    <div className="glass-card rounded-[2.5rem] p-12 border border-slate-200 dark:border-white/10">
                      <h3 className="text-2xl font-bold mb-8">Add Payment Address</h3>
                      <form onSubmit={handleAddAddress} className="space-y-6">
                        <div>
                          <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Cryptocurrency</label>
                          <select
                            value={newAddress.crypto}
                            onChange={(e) => setNewAddress({...newAddress, crypto: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="USDC">USD Coin (USDC)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Wallet Address</label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            placeholder="Enter cryptocurrency address"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={submittingAddress}
                            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            {submittingAddress ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                            {submittingAddress ? 'Adding...' : 'Add Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="flex-1 py-4 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Addresses List */}
              <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold mb-6">Active Payment Addresses ({paymentAddresses.length})</h3>
                {paymentAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentAddresses.map((addr) => (
                      <div key={addr.id} className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg text-amber-500">{addr.crypto}</h4>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all mb-2">{addr.address}</p>
                        <p className="text-[10px] text-slate-500">Added: {new Date(addr.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-12">No payment addresses configured yet</p>
                )}
              </div>
            </>
          )}

          {/* Investment Plans Tab */}
          {activeTab === 'plans' && (
            <>
              <div className="mb-8">
                {!showPlanForm ? (
                  <button
                    onClick={() => setShowPlanForm(true)}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Plus size={20} /> Create Investment Plan
                  </button>
                ) : (
                  <div className="max-w-2xl">
                    <div className="glass-card rounded-[2.5rem] p-12 border border-slate-200 dark:border-white/10">
                      <h3 className="text-2xl font-bold mb-8">Create Investment Plan</h3>
                      <form onSubmit={handleAddPlan} className="space-y-6">
                        <div>
                          <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Plan Name</label>
                          <input
                            type="text"
                            value={newPlan.name}
                            onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                            placeholder="e.g., Platinum Tier"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Min Amount ($)</label>
                            <input
                              type="number"
                              value={newPlan.minAmount}
                              onChange={(e) => setNewPlan({...newPlan, minAmount: parseFloat(e.target.value) || 0})}
                              placeholder="e.g., 50000"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Max Amount ($)</label>
                            <input
                              type="number"
                              value={newPlan.maxAmount}
                              onChange={(e) => setNewPlan({...newPlan, maxAmount: parseFloat(e.target.value) || 0})}
                              placeholder="e.g., 100000"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">ROI % (Annually)</label>
                            <input
                              type="number"
                              value={newPlan.roi}
                              onChange={(e) => setNewPlan({...newPlan, roi: parseFloat(e.target.value) || 0})}
                              placeholder="e.g., 45"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Duration (Days)</label>
                            <input
                              type="number"
                              value={newPlan.duration}
                              onChange={(e) => setNewPlan({...newPlan, duration: parseInt(e.target.value) || 30})}
                              placeholder="e.g., 30"
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Description (Optional)</label>
                          <input
                            type="text"
                            value={newPlan.description}
                            onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                            placeholder="Plan description"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Features (comma-separated)</label>
                          <input
                            type="text"
                            value={newPlan.features}
                            onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                            placeholder="e.g., VIP support, Early access, Priority execution"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={submittingPlan}
                            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            {submittingPlan ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                            {submittingPlan ? 'Creating...' : 'Create Plan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPlanForm(false)}
                            className="flex-1 py-4 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Plans List */}
              <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold mb-6">Investment Plans ({investmentPlans.length})</h3>
                {investmentPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investmentPlans.map((plan) => (
                      <div key={plan.id} className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg">{plan.name}</h4>
                        </div>
                        <p className="text-sm text-amber-500 font-bold mb-2">{plan.roi}% ROI</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">${plan.minAmount?.toLocaleString()} - ${plan.maxAmount?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mb-3">Duration: {plan.duration} days</p>
                        <div className="space-y-1">
                          {plan.features?.slice(0, 3).map((f: string, i: number) => (
                            <p key={i} className="text-xs text-slate-500 flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-500" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-12">No investment plans created yet</p>
                )}
              </div>
            </>
          )}
          {/* User Management Tab */}
          {activeTab === 'users' && (
            <>
              <div className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {searchUser && (
                    <button
                      onClick={() => setSearchUser('')}
                      className="px-6 py-4 bg-slate-200 dark:bg-white/10 rounded-2xl font-bold transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Users List */}
              <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold mb-6">Users ({filteredUsers.length})</h3>
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5">
                          <th className="pb-4 font-black text-slate-400">Name</th>
                          <th className="pb-4 font-black text-slate-400">Email</th>
                          <th className="pb-4 font-black text-slate-400">Role</th>
                          <th className="pb-4 font-black text-slate-400">KYC Status</th>
                          <th className="pb-4 font-black text-slate-400">Status</th>
                          <th className="pb-4 font-black text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                            <td className="py-4 font-bold">{u.name}</td>
                            <td className="py-4 text-xs text-slate-600 dark:text-slate-400">{u.email}</td>
                            <td className="py-4">
                              <span className="inline-block px-3 py-1 bg-slate-200 dark:bg-white/10 rounded-full text-xs font-bold">
                                {u.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                u.kycStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                u.kycStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                'bg-red-500/20 text-red-600 dark:text-red-400'
                              }`}>
                                {u.kycStatus}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                'bg-red-500/20 text-red-600 dark:text-red-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-4">
                              {u.status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleSuspendUser(u.id)}
                                  disabled={suspendingUserId === u.id}
                                  className="px-3 py-2 bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50 text-xs"
                                >
                                  {suspendingUserId === u.id ? <Loader2 size={14} className="inline animate-spin" /> : 'Suspend'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnsuspendUser(u.id)}
                                  disabled={suspendingUserId === u.id}
                                  className="px-3 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-500/30 transition-all disabled:opacity-50 text-xs"
                                >
                                  {suspendingUserId === u.id ? <Loader2 size={14} className="inline animate-spin" /> : 'Unsuspend'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-12">
                    {searchUser ? 'No users match your search' : 'No users found'}
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
};

const UserProfile = ({ user, onLogout }: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '' });
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || ''
        });
        setError(null);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await userService.updateProfile(formData);
      const updatedProfile = await userService.getProfile();
      setProfile(updatedProfile);
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMode(false);
      alert('Password changed successfully');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="User Profile" user={user} onLogout={onLogout}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : profile ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <p className="text-sm text-slate-500">{profile.email}</p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Member Since</p>
                  <p className="text-sm font-bold">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="md:col-span-2">
              {!editMode && !passwordMode ? (
                <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-6">Account Information</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Full Name</p>
                        <p className="font-bold">{profile.name}</p>
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Email</p>
                        <p className="font-bold">{profile.email}</p>
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Phone</p>
                        <p className="font-bold">{profile.phone || 'Not provided'}</p>
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Address</p>
                        <p className="font-bold">{profile.address ? `${profile.address}, ${profile.city}, ${profile.country}` : 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Settings size={20} /> Edit Profile
                    </button>
                    <button
                      onClick={() => setPasswordMode(true)}
                      className="flex-1 px-6 py-3 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={20} /> Change Password
                    </button>
                  </div>
                </div>
              ) : editMode ? (
                <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
                  <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Optional"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Optional"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Optional"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          placeholder="Optional"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="flex-1 py-4 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10">
                  <h3 className="text-xl font-bold mb-6">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest mb-3 block text-slate-600 dark:text-slate-400">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {submitting ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasswordMode(false)}
                        className="flex-1 py-4 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};

const ReferralDashboard = ({ user, onLogout }: any) => {
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const stats = await userService.getReferralStats();
        setReferralStats(stats);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load referral stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleCopyReferralCode = async () => {
    try {
      await userService.copyReferralCode();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <DashboardShell title="Referral Program" user={user} onLogout={onLogout}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : referralStats ? (
        <>
          {/* Referral Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <Gift size={24} />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Your Referral Code</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-black text-amber-500">{referralStats.referralCode}</p>
                <button
                  onClick={handleCopyReferralCode}
                  className={`p-3 rounded-xl transition-all ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <Users size={24} />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Total Referrals</p>
              </div>
              <p className="text-4xl font-black text-emerald-500">{referralStats.totalReferrals}</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <BarChart3 size={24} />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Earnings</p>
              </div>
              <p className="text-3xl font-black text-blue-500">${referralStats.referralEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ClipboardList size={24} className="text-amber-500" /> How the Referral Program Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                  <h3 className="font-bold">Share Your Code</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Share your unique referral code with friends and family. You can copy it with one click above.</p>
              </div>
              <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                  <h3 className="font-bold">They Sign Up</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">When someone signs up using your code, they become your referral and receive a welcome bonus.</p>
              </div>
              <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                  <h3 className="font-bold">You Earn Rewards</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Earn 5% commission on their first investment. Keep earning as they continue to invest.</p>
              </div>
            </div>
          </div>

          {/* Referral Benefits */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star size={24} className="text-amber-500" /> Referral Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">5% Lifetime Commission</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Earn 5% on every referral's investment</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Unlimited Referrals</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">No cap on how many friends you can refer</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Instant Payouts</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Commissions credited instantly to your wallet</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Bonus Rewards</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tier-based bonuses when you reach milestones</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};

const AdminDashboard = ({ user, onLogout }: any) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getAdminDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load admin dashboard:', err);
        setError(err.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      setApproving(transactionId);
      await transactionService.approveTransaction(transactionId);
      // Reload dashboard
      const data = await dashboardService.getAdminDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to approve transaction:', err);
      alert(err.message);
    } finally {
      setApproving(null);
    }
  };

  const handleApproveKYC = async (kycRequestId: string) => {
    try {
      setApproving(kycRequestId);
      await kycService.approveKYC(kycRequestId);
      // Reload dashboard
      const data = await dashboardService.getAdminDashboard();
      setDashboardData(data);
      alert('KYC request approved successfully');
    } catch (err: any) {
      console.error('Failed to approve KYC:', err);
      alert(err.message);
    } finally {
      setApproving(null);
    }
  };

  const handleRejectKYC = async (kycRequestId: string) => {
    const reason = rejectReason[kycRequestId] || 'No reason provided';
    if (!reason || reason.trim().length === 0) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(kycRequestId);
      await kycService.rejectKYC(kycRequestId, reason);
      // Reload dashboard
      const data = await dashboardService.getAdminDashboard();
      setDashboardData(data);
      setRejectReason({ ...rejectReason, [kycRequestId]: '' });
      alert('KYC request rejected successfully');
    } catch (err: any) {
      console.error('Failed to reject KYC:', err);
      alert(err.message);
    } finally {
      setRejecting(null);
    }
  };

  return (
    <DashboardShell title="Tenant Administration" user={user} onLogout={onLogout}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : dashboardData ? (
        <>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-black">Dashboard Overview</h2>
            <button
              onClick={() => navigate('/admin/settings')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Settings size={20} /> Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Clients', value: dashboardData.overview?.totalUsers?.toString() || '0', icon: Users },
              { label: 'Total AUM', value: `$${((dashboardData.overview?.totalInvested || 0) / 1000000).toFixed(1)}M`, icon: BarChart3 },
              { label: 'Pending Approvals', value: (dashboardData.pendingTransactions?.length || 0).toString(), icon: Clock },
              { label: 'Pending KYC', value: (dashboardData.pendingKyc || 0).toString(), icon: ShieldAlert }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <stat.icon size={20} />
                  </div>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* KYC Requests Queue */}
          <div className="mb-8 p-8 glass-card rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck size={20} /> KYC Verification Requests ({dashboardData.pendingKyc || 0})
            </h3>
            {dashboardData.kycRequests && dashboardData.kycRequests.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {dashboardData.kycRequests.map((kyc: any) => (
                  <div key={kyc.id} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-sm">{kyc.firstName} {kyc.lastName}</p>
                        <p className="text-xs text-slate-500">ID Type: {kyc.idType} | Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${kyc.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {kyc.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleApproveKYC(kyc.id)}
                        disabled={approving === kyc.id}
                        className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {approving === kyc.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Approve
                      </button>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={rejectReason[kyc.id] || ''}
                          onChange={(e) => setRejectReason({ ...rejectReason, [kyc.id]: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                        <button
                          onClick={() => handleRejectKYC(kyc.id)}
                          disabled={rejecting === kyc.id}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {rejecting === kyc.id ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">No pending KYC requests</p>
            )}
          </div>

          {/* Pending Transactions */}
          <div className="mb-8 p-8 glass-card rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} /> Pending Transactions ({(dashboardData.pendingTransactions?.length || 0)})
            </h3>
            {dashboardData.pendingTransactions && dashboardData.pendingTransactions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {dashboardData.pendingTransactions.slice(0, 10).map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-4 flex-grow">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{txn.type}</p>
                        <p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${txn.amount.toFixed(2)}</p>
                        <p className="text-xs text-amber-500 font-semibold">{txn.status}</p>
                      </div>
                      <button
                        onClick={() => handleApproveTransaction(txn.id)}
                        disabled={approving === txn.id}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        {approving === txn.id ? <Loader2 size={16} className="animate-spin" /> : 'Approve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">No pending transactions</p>
            )}
          </div>

          {/* Investment Summary */}
          <div className="p-8 glass-card rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-bold mb-6">Investment Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Active', value: (dashboardData.investmentStats?.activeInvestments || 0).toString(), color: 'emerald' },
                { label: 'Completed', value: (dashboardData.investmentStats?.completedInvestments || 0).toString(), color: 'blue' },
                { label: 'Total Value', value: `$${((dashboardData.investmentStats?.totalValue || 0) / 1000).toFixed(1)}K`, color: 'amber' }
              ].map((item, i) => (
                <div key={i} className={`p-6 bg-${item.color}-500/10 rounded-2xl border border-${item.color}-500/20`}>
                  <p className={`text-sm font-bold text-${item.color}-600 dark:text-${item.color}-400 uppercase tracking-widest mb-2`}>{item.label}</p>
                  <p className="text-3xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};

const SuperAdminDashboard = ({ user, onLogout }: any) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getSuperAdminDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load super admin dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDistributeROI = async () => {
    try {
      setDistributing(true);
      const result = await adminService.distributeROI();
      alert(`ROI Distributed: ${result.distributed.count} investments, $${(result.distributed.totalAmount / 1000000).toFixed(2)}M`);
      // Reload dashboard data
      const data = await dashboardService.getSuperAdminDashboard();
      setDashboardData(data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDistributing(false);
    }
  };

  return (
    <DashboardShell title="Super-Admin Core" user={user} onLogout={onLogout}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : dashboardData ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: dashboardData.overview.totalUsers.toString(), color: 'blue' },
              { label: 'Total AUM', value: `$${(dashboardData.overview.totalAUM / 1000000).toFixed(1)}M`, color: 'emerald' },
              { label: 'Active Investments', value: dashboardData.investments.active.toString(), color: 'amber' },
              { label: 'Expected Returns', value: `$${(dashboardData.overview.totalExpectedReturns / 1000000).toFixed(1)}M`, color: 'purple' }
            ].map((stat, i) => (
              <div key={i} className={`glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-${stat.color}-500/5`}>
                <p className={`text-xs text-${stat.color}-600 dark:text-${stat.color}-400 font-bold uppercase tracking-widest mb-2`}>{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Global Platform Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="p-8 bg-amber-500 text-black rounded-[2.5rem] shadow-2xl shadow-amber-500/20 mb-8">
                <h3 className="text-2xl font-black mb-2">Global Platform Status</h3>
                <p className="font-medium opacity-80 mb-6">
                  {dashboardData.overview.totalUsers} users • ${(dashboardData.overview.totalAUM / 1000000).toFixed(1)}M AUM • {dashboardData.investments.active} active investments
                </p>
                <button
                  onClick={handleDistributeROI}
                  disabled={distributing}
                  className="px-6 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {distributing ? <Loader2 size={18} className="animate-spin" /> : <Shield size={20} />}
                  {distributing ? 'Distributing ROI...' : 'Distribute ROI'}
                </button>
              </div>

              {/* Investment Overview */}
              <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold mb-6">Investment Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-2">Active Investments</p>
                    <p className="text-4xl font-black text-blue-500">{dashboardData.investments.active}</p>
                    {dashboardData.investments.activeDetails && (
                      <p className="text-xs text-blue-500/60 mt-2">
                        Total: ${dashboardData.investments.activeDetails.reduce((s: number, i: any) => s + i.amount, 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-2">Completed Investments</p>
                    <p className="text-4xl font-black text-emerald-500">{dashboardData.investments.completed}</p>
                    <p className="text-xs text-emerald-500/60 mt-2">ROI distributed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
                <h4 className="font-bold flex items-center gap-2 mb-4"><BarChart3 size={18} /> Pending Actions</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-slate-500">Pending Transactions</span>
                    <span className="text-lg font-black text-amber-500">{dashboardData.transactions?.pending?.count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-slate-500">Pending KYC</span>
                    <span className="text-lg font-black text-amber-500">{dashboardData.kyc?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-slate-500">Pending Deposits</span>
                    <span className="text-lg font-black text-amber-500">{dashboardData.wallet?.pendingDeposits || 0}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
                <h4 className="font-bold flex items-center gap-2 mb-4"><Shield size={18} /> Platform Security</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> JWT auth enabled</p>
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Role-based access</p>
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Crypto verified</p>
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> KYC enforcement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction & User Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-6">Transaction Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">Approved</span>
                  <span className="text-lg font-black text-emerald-500">{dashboardData.transactions?.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">Rejected</span>
                  <span className="text-lg font-black text-red-500">{dashboardData.transactions?.rejected || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">Pending</span>
                  <span className="text-lg font-black text-amber-500">{dashboardData.transactions?.pending?.count || 0}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-6">User Analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">Active Users</span>
                  <span className="text-lg font-black text-blue-500">{dashboardData.users?.active || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">KYC Verified</span>
                  <span className="text-lg font-black text-emerald-500">{dashboardData.users?.kycVerified || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                  <span className="font-bold">Suspended</span>
                  <span className="text-lg font-black text-red-500">{dashboardData.users?.suspended || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
};

const LandingPage = ({ isDarkMode, setIsDarkMode, user, onLogout, setAuthModal, aiInsight, marketData }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, text: '' });
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
            <a href="#services" onClick={(e) => scrollToSection(e, '#services')} className="hover:text-amber-500 transition-colors">Services</a>
            <a href="#plans" onClick={(e) => scrollToSection(e, '#plans')} className="hover:text-amber-500 transition-colors">Plans</a>
            <a href="#referrals" onClick={(e) => scrollToSection(e, '#referrals')} className="hover:text-amber-500 transition-colors">Referrals</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="hover:text-amber-500 transition-colors">Contact</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform active:scale-95 shadow-sm">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(authService.getRedirectPath(user.role))} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-amber-500/20">Dashboard</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} className="px-6 py-2.5 text-slate-900 dark:text-white font-bold hover:text-amber-500 transition-colors">Sign In</button>
                <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-amber-500/20">Get Started</button>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-gray-400"><Menu size={28} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-40 lg:hidden bg-white dark:bg-[#05070a] border-b border-slate-200 dark:border-white/5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex flex-col p-6 gap-4">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="py-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-700 dark:text-gray-300 font-medium transition-colors">Home</a>
            <a href="#services" onClick={(e) => scrollToSection(e, '#services')} className="py-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-700 dark:text-gray-300 font-medium transition-colors">Services</a>
            <a href="#plans" onClick={(e) => scrollToSection(e, '#plans')} className="py-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-700 dark:text-gray-300 font-medium transition-colors">Plans</a>
            <a href="#referrals" onClick={(e) => scrollToSection(e, '#referrals')} className="py-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-700 dark:text-gray-300 font-medium transition-colors">Referrals</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="py-3 px-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-700 dark:text-gray-300 font-medium transition-colors">Contact</a>
            <div className="border-t border-slate-200 dark:border-white/5 pt-4 mt-2 space-y-2">
              <button onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }} className="w-full py-3 px-4 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center gap-2 justify-center font-medium transition-colors">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <button onClick={() => { navigate(authService.getRedirectPath(user.role)); setIsMenuOpen(false); }} className="w-full py-3 px-4 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-600 transition-colors">Dashboard</button>
              ) : (
                <>
                  <button onClick={() => { setAuthModal({ isOpen: true, mode: 'login' }); setIsMenuOpen(false); }} className="w-full py-3 px-4 rounded-lg text-slate-900 dark:text-white font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Sign In</button>
                  <button onClick={() => { setAuthModal({ isOpen: true, mode: 'signup' }); setIsMenuOpen(false); }} className="w-full py-3 px-4 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-600 transition-colors">Get Started</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero & Market Ticker */}
      <section id="home" className="pt-32 pb-20 px-6">
        {/* Live Market Ticker */}
        {marketData && marketData.length > 0 && (
          <div className="max-w-7xl mx-auto mb-16 overflow-hidden rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
            <div className="flex gap-8 px-6 py-4 overflow-x-auto scrollbar-hide animate-scroll">
              {marketData.slice(0, 10).map((asset, idx) => (
                <div key={idx} className="flex-shrink-0 flex items-center gap-4 min-w-max">
                  <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{asset.symbol.toUpperCase()}</span>
                    <span className="text-xs text-slate-500">${asset.current_price.toFixed(2)}</span>
                  </div>
                  <div className={`text-xs font-bold ${asset.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
              <Zap size={14} /> New Institutional Tiers Live
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Premium Markets. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Institutional ROI.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
              Experience the power of a fully automated investment ecosystem. Copy expert traders, access global liquidity, and grow your wealth.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="px-10 py-5 bg-amber-500 text-black font-black rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center gap-2 hover:scale-105 transition-all">Start Now <ArrowUpRight size={22} /></button>
              <button onClick={(e) => scrollToSection(e, '#plans')} className="px-10 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">View Plans</button>
            </div>
          </div>
          <div className="flex-1 glass-card p-1 rounded-[3rem] shadow-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1611974717535-7dd0c111e64d?auto=format&fit=crop&q=80&w=1200" alt="Market View" className="w-full h-[450px] object-cover rounded-[2.8rem] transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24 px-6 bg-slate-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">Investment Tiers</h2>
          <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">Select a tier that matches your investment goals. Higher tiers unlock advanced desk support and premium ROI structures.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {INVESTMENT_PLANS.map((plan, i) => (
            <div key={i} className="glass-card p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col hover:border-amber-500/50 transition-all group shadow-xl shadow-slate-200/20 dark:shadow-none">
              <div className={`mb-6 p-3 rounded-2xl w-fit ${plan.accent}`}>
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-black text-amber-500 mb-6">{plan.roi}</p>
              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-400 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-500" /> {f}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 mb-6 tracking-widest uppercase">{plan.range}</p>
              <button onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-black transition-all">Select Plan</button>
            </div>
          ))}
        </div>
      </section>

      {/* Referrals Section */}
      <section id="referrals" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-amber-500/5 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 glass-card p-12 rounded-[3rem] border border-amber-500/20 shadow-2xl shadow-amber-500/5">
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-8">
              <Share2 size={32} />
            </div>
            <h2 className="text-4xl font-bold mb-6">Earn While You Grow Your Network</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">
              Our partner ecosystem rewards you for every investor you bring to the platform. Build your own institutional network and earn passive income.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { l: 'Tier 1 Referral', v: '10%' },
                { l: 'Tier 2 Referral', v: '15%' },
                { l: 'Tier 3 Referral', v: '20%' },
                { l: 'Platinum Partner', v: '25%' }
              ].map((r, i) => (
                <div key={i} className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{r.l}</p>
                  <p className="text-2xl font-black text-amber-500">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <h3 className="text-3xl font-bold">Why Partner With Us?</h3>
            <div className="space-y-6">
              {[
                { t: 'Instant Commission', d: 'Earn rewards as soon as your referrals fund their first tier.' },
                { t: 'No Earning Caps', d: 'There is no limit to how much you can earn through network growth.' },
                { t: 'Marketing Assets', d: 'Access premium banners and tracking tools to scale your reach.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500"><CheckCircle2 size={20} /></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                    <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Verified Investor Feedback</h2>
          <p className="text-slate-500 dark:text-gray-400">Join over 30,000 active investors scaling their wealth daily.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-card p-10 rounded-[2.5rem] border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/10 dark:shadow-none">
              <Quote className="text-amber-500/20 mb-6" size={40} />
              <p className="text-slate-600 dark:text-gray-300 italic mb-8 font-medium leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-amber-500/20" />
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Feedback */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">Connect With Our Desk</h2>
              <p className="text-slate-600 dark:text-gray-400 text-lg font-medium">Have specific requirements? Our institutional support desk is available 24/7 for premium tier clients.</p>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Name</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Email</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="Email address" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-2">Message</label>
                <textarea rows={4} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="How can we assist your investment journey?"></textarea>
              </div>
              <button type="button" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-black transition-all flex items-center justify-center gap-2">Send Message <Send size={20} /></button>
            </form>
          </div>

          <div className="glass-card p-12 rounded-[3rem] border-amber-500/20 bg-amber-500/5">
            <h3 className="text-3xl font-bold mb-6">Voice of the Investor</h3>
            <p className="text-slate-600 dark:text-gray-400 mb-8 font-medium italic">Help us optimize the BullsandbearsFx ecosystem by sharing your recent experience.</p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Rate your experience</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFeedback({...feedback, rating: s})} className={`p-3 rounded-xl border transition-all ${feedback.rating >= s ? 'bg-amber-500 text-black border-amber-500' : 'bg-transparent text-slate-400 border-slate-300 dark:border-white/10 hover:border-amber-500/50'}`}>
                      <Star size={24} fill={feedback.rating >= s ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Feature Requests / Feedback</p>
                <textarea rows={3} value={feedback.text} onChange={(e) => setFeedback({...feedback, text: e.target.value})} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="What features would you like to see next?"></textarea>
              </div>

              <button type="button" className="px-8 py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2">Submit Feedback <Zap size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-24 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/50">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-black">BB</div>
            <span className="text-2xl font-black tracking-tighter">Bullsandbears<span className="text-amber-500">Fx</span></span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed text-sm">
            BullsandbearsFx is a registered multi-asset broker providing institutional-grade liquidity and execution. Trading financial instruments involves significant risk.
          </p>
          <div className="pt-12 border-t border-slate-200 dark:border-white/5 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            © 2024 BullsandbearsFx Corporation. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

const AppContent: React.FC<{
  marketData: CryptoAsset[];
  aiInsight: string;
  authModal: {isOpen: boolean, mode: 'login' | 'signup'};
  setAuthModal: (modal: {isOpen: boolean, mode: 'login' | 'signup'}) => void;
  user: any;
  isInitializing: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  handleLogout: () => void;
  handleLoginSuccess: (userData: any) => void;
}> = ({ marketData, aiInsight, authModal, setAuthModal, user, isInitializing, isDarkMode, setIsDarkMode, handleLogout, handleLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect authenticated users from landing page to role-based dashboard
    if (!isInitializing && user && location.pathname === '/') {
      const redirectPath = authService.getRedirectPath(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, isInitializing, location.pathname, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a] selection:bg-amber-500/30">
        <div className="relative flex flex-col items-center gap-6 p-12 glass-card rounded-[3rem] border-white/5 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50"></div>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative">
            <Loader2 className="animate-spin text-amber-500 relative z-10" size={52} strokeWidth={2} />
            <div className="absolute inset-0 animate-ping bg-amber-500/20 rounded-full blur-xl"></div>
          </div>
          
          <div className="text-center space-y-3 relative z-10">
            <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Security Protocol</p>
            <h3 className="text-white text-xl font-bold tracking-tight">Securing Session...</h3>
            <div className="flex justify-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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

        <Route path="/dashboard" element={
          <ProtectedRoute user={user} allowedRoles={['INVESTOR']}>
            <InvestorDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRoles={['TENANT_ADMIN']}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute user={user} allowedRoles={['TENANT_ADMIN']}>
            <AdminSettings user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <UserProfile user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/referrals" element={
          <ProtectedRoute user={user} allowedRoles={['INVESTOR']}>
            <ReferralDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/super-admin" element={
          <ProtectedRoute user={user} allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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

  useEffect(() => {
    // Load user from localStorage on app boot and refresh from backend
    const initializeAuth = async () => {
      const existingUser = authService.getCurrentUser();
      if (existingUser) {
        // Refresh from backend to ensure latest user data from database
        const freshUser = await authService.refreshUserData();
        setUser(freshUser || existingUser);
      }
      setIsInitializing(false);
    };
    initializeAuth();
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
    };
    loadMarket();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/'; 
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-[#05070a] text-slate-900 dark:text-white transition-colors duration-300">
        <AppContent 
          marketData={marketData}
          aiInsight={aiInsight}
          authModal={authModal}
          setAuthModal={setAuthModal}
          user={user}
          isInitializing={isInitializing}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          handleLogout={handleLogout}
          handleLoginSuccess={handleLoginSuccess}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
