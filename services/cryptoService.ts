
import { CryptoAsset } from '../types';

const MOCK_ASSETS: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 64230.50, price_change_percentage_24h: 2.45, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3450.20, price_change_percentage_24h: -1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, image: 'https://assets.coingecko.com/coins/images/325/large/tether.png' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 580.45, price_change_percentage_24h: 0.85, image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.30, price_change_percentage_24h: 5.6, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.62, price_change_percentage_24h: -0.4, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1.00, price_change_percentage_24h: 0.0, image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: -2.1, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 38.90, price_change_percentage_24h: 1.4, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.16, price_change_percentage_24h: 3.2, image: 'https://assets.coingecko.com/coins/images/1496/large/dogecoin.png' }
];

export const fetchMarketData = async (): Promise<CryptoAsset[]> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h',
      { signal: AbortController ? new AbortController().signal : undefined }
    );
    if (!response.ok) throw new Error('API limit reached');
    const data = await response.json();
    return data.length > 0 ? data : MOCK_ASSETS;
  } catch (error) {
    console.warn('Market data fetch failed, using fallback data:', error);
    return MOCK_ASSETS;
  }
};
