
export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export interface Plan {
  name: string;
  range: string;
  roi: string;
  features: string[];
  color: string;
  accent: string;
}

export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
