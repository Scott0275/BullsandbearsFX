
import React from 'react';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Eye, 
  Layers, 
  Zap,
  BarChart3,
  Globe,
  Briefcase,
  PieChart,
  Repeat
} from 'lucide-react';
import { Plan, Service, FAQItem } from './types';

export const INVESTMENT_PLANS: Plan[] = [
  {
    name: "Starter",
    range: "$1,000 – $5,000",
    roi: "30% ROI",
    features: ["24/7 Expert Support", "Basic Copy Trading", "10% Referral Earnings"],
    color: "emerald",
    accent: "bg-emerald-500/20 text-emerald-400"
  },
  {
    name: "Silver",
    range: "$5,000 – $50,000",
    roi: "45% ROI",
    features: ["Priority Copy Trading", "Market Insights", "15% Referral Earnings"],
    color: "blue",
    accent: "bg-blue-500/20 text-blue-400"
  },
  {
    name: "Gold",
    range: "$50,000 – $100,000",
    roi: "60% ROI",
    features: ["Dedicated Manager", "Institutional Tools", "20% Referral Earnings"],
    color: "amber",
    accent: "bg-amber-500/20 text-amber-400"
  },
  {
    name: "Platinum",
    range: "$100,000 and Above",
    roi: "80% ROI",
    features: ["All Premium Services", "Direct Desk Access", "25% Referral Earnings"],
    color: "purple",
    accent: "bg-purple-500/20 text-purple-400"
  }
];

export const TESTIMONIALS = [
  {
    name: "Alexander Wright",
    role: "Equity Trader",
    content: "The copy trading feature on BullsandbearsFx transformed my portfolio. Their execution speeds are unmatched in the retail space.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "Portfolio Manager",
    content: "Institutional-grade tools with a user-friendly interface. The AI insights provide that extra edge needed for volatile sessions.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Marcus Thorne",
    role: "Private Investor",
    content: "Withdrawals are consistently fast. I've been with the platform for 2 years and the service has only improved over time.",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  }
];

export const SERVICES: Service[] = [
  {
    title: "Copy Trading",
    description: "Allows users to automatically copy trades from experienced traders in real time.",
    icon: "Repeat"
  },
  {
    title: "Financial Advisory",
    description: "Smart financial advice powered by automation and expert analysis to improve decision-making.",
    icon: "Briefcase"
  },
  {
    title: "Forex Trading",
    description: "Trade global currency pairs in the decentralized foreign exchange market.",
    icon: "Globe"
  },
  {
    title: "Index Trading",
    description: "High ROI potential (up to 41%). Indices offer a balanced risk-to-reward sweet spot.",
    icon: "TrendingUp"
  },
  {
    title: "ETF Stocks",
    description: "Invest in stocks, commodities, bonds, and diversified securities designed for growth.",
    icon: "BarChart3"
  },
  {
    title: "CFDs Trading",
    description: "Trade CFDs without the need for a digital wallet or exchange account.",
    icon: "PieChart"
  }
];

export const WHY_CHOOSE_US = [
  { title: "Real-Time Market Data", icon: Zap },
  { title: "24/7 Online Support", icon: Clock },
  { title: "Advanced Security", icon: ShieldCheck },
  { title: "Multiple Deposit Options", icon: CreditCard },
  { title: "Instant Withdrawals", icon: Layers },
  { title: "Full Transparency", icon: Eye },
  { title: "User-Friendly Interface", icon: Users }
];

export const FAQS: FAQItem[] = [
  {
    question: "How does copy trading work?",
    answer: "Copy trading allows you to browse our top-performing traders, check their success rates, and choose to mirror their trades automatically in your own account."
  },
  {
    question: "How long do withdrawals take?",
    answer: "Most withdrawals are processed instantly. Depending on your payment method, funds typically arrive within 1-24 hours."
  },
  {
    question: "Is my investment secure?",
    answer: "Yes. We use military-grade AES-256 encryption and cold storage for digital assets. We are fully compliant with global financial security standards."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support major cryptocurrencies (BTC, ETH, USDT), Bank Wire Transfers, and major Credit/Debit Cards."
  },
  {
    question: "Can I upgrade my plan?",
    answer: "Absolutely. You can upgrade your investment plan at any time to take advantage of higher ROI tiers and premium services."
  }
];
