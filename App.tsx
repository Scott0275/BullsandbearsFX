
import React, { useState, useEffect } from 'react';
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
  TrendingDown
} from 'lucide-react';
import { fetchMarketData } from './services/cryptoService';
import { getMarketInsights } from './services/aiService';
import { CryptoAsset } from './types';
import { INVESTMENT_PLANS, SERVICES, WHY_CHOOSE_US, FAQS } from './constants';

const RegistrationModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
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
            <h2 className="text-3xl font-bold">Welcome Aboard!</h2>
            <p className="text-slate-500 dark:text-gray-400">Your account has been created successfully. Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-slate-500 dark:text-gray-400">Start your trading journey with us today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<CryptoAsset[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('Analyzing market sentiment...');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

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
    <div className="min-h-screen bg-white dark:bg-[#05070a] text-slate-900 dark:text-white transition-colors duration-300">
      <RegistrationModal isOpen={isRegistrationOpen} onClose={() => setIsRegistrationOpen(false)} />

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
            <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-xl shadow-amber-500/20" onClick={() => setIsRegistrationOpen(true)}>
              Get Started
            </button>
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

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0a0e17] border-b border-slate-200 dark:border-white/5 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 shadow-xl">
            <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="text-lg py-2 font-medium">Home</a>
            <a href="#markets" onClick={(e) => scrollToSection(e, '#markets')} className="text-lg py-2 font-medium">Markets</a>
            <a href="#services" onClick={(e) => scrollToSection(e, '#services')} className="text-lg py-2 font-medium">Services</a>
            <button onClick={() => { setIsMenuOpen(false); setIsRegistrationOpen(true); }} className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl mt-4 shadow-lg shadow-amber-500/10">Get Started</button>
          </div>
        )}
      </nav>

      {/* Enhanced Market Ticker */}
      <div id="markets" className="pt-24 pb-4 bg-slate-50/80 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 transition-colors overflow-hidden">
        <div className="ticker-mask relative w-full overflow-hidden">
          <div className="flex animate-scroll hover:[animation-play-state:paused] whitespace-nowrap py-2 cursor-pointer">
            {[...marketData, ...marketData, ...marketData].map((asset, idx) => (
              <div 
                key={`${asset.id}-${idx}`} 
                className="inline-flex items-center gap-4 px-10 border-r border-slate-200 dark:border-white/10 group transition-all"
              >
                <div className="relative">
                  <img src={asset.image} alt={asset.name} className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all duration-300" />
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#05070a] ${asset.price_change_percentage_24h >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-slate-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors uppercase tracking-widest">{asset.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
        {/* Decorative elements */}
        <div className="absolute top-40 -left-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
              <Zap size={14} className="fill-current" /> Institutional Grade Trading
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
              Trade Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200">Scale Consistently.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl font-medium">
              Access the world's most robust financial markets with institutional tools, zero hidden fees, and lightning-fast execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => setIsRegistrationOpen(true)} className="px-10 py-5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl transition-all shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                Start Trading Now <ArrowUpRight size={22} />
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
                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-8 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-lg shadow-amber-500/5">
                  <Icon size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-medium">{service.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="plans" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Investment Portfolios</h2>
          <p className="text-slate-600 dark:text-gray-400 font-medium">Strategic asset management with optimized returns across four distinct tiers.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {INVESTMENT_PLANS.map((plan, idx) => (
            <div key={idx} className="relative p-10 rounded-[3rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all shadow-xl shadow-slate-200/10 dark:shadow-none flex flex-col group">
              {idx === 2 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-20">Recommended</div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">{plan.name}</h3>
                <div className={`inline-block px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest ${plan.accent}`}>{plan.roi}</div>
              </div>
              <div className="text-2xl font-black mb-8 tracking-tighter">{plan.range}</div>
              <div className="space-y-5 mb-12 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-400 font-semibold">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" strokeWidth={3} /> {feature}
                  </div>
                ))}
              </div>
              <button onClick={() => setIsRegistrationOpen(true)} className={`w-full py-5 rounded-[1.5rem] font-black transition-all hover:scale-105 active:scale-95 ${idx === 2 ? 'bg-amber-500 text-black shadow-2xl shadow-amber-500/30' : 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-300 dark:border-white/10'}`}>
                Start Now
              </button>
            </div>
          ))}
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
          <div className="flex flex-wrap justify-center gap-10 text-sm font-black uppercase tracking-[0.1em] text-slate-400 dark:text-gray-500">
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Risk Disclosure</a>
            <a href="mailto:support@bullsandbearsfx.com" className="hover:text-amber-500 transition-colors">Support Center</a>
          </div>
          <div className="pt-12 border-t border-slate-200 dark:border-white/5">
             <p className="text-[10px] text-slate-400 dark:text-gray-600 font-black uppercase tracking-[0.3em]">© 2024 BullsandbearsFx Corporation. Global Registered Entity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
