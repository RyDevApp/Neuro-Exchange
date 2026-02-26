import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCryptoPrice } from './services/geminiService';
import ConverterCard from './components/ConverterCard';
import { Currency } from './types';
import { BitcoinIcon } from './components/icons/BitcoinIcon';
import { EthIcon } from './components/icons/EthIcon';
import { LtcIcon } from './components/icons/LtcIcon';
import { XmrIcon } from './components/icons/XmrIcon';
import { SolanaIcon } from './components/icons/SolanaIcon';
import { UsdIcon } from './components/icons/UsdIcon';

export const supportedCurrencies = [
  { currency: Currency.BTC, name: 'Bitcoin', icon: <BitcoinIcon className="w-6 h-6" /> },
  { currency: Currency.ETH, name: 'Ethereum', icon: <EthIcon className="w-6 h-6" /> },
  { currency: Currency.LTC, name: 'Litecoin', icon: <LtcIcon className="w-6 h-6" /> },
  { currency: Currency.XMR, name: 'Monero', icon: <XmrIcon className="w-6 h-6" /> },
  { currency: Currency.SOL, name: 'Solana', icon: <SolanaIcon className="w-6 h-6" /> },
  { currency: Currency.USD, name: 'US Dollar', icon: <UsdIcon className="w-6 h-6" /> },
];

const App: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency>(Currency.BTC);
  const [toCurrency, setToCurrency] = useState<Currency>(Currency.USD);
  const [prices, setPrices] = useState<Partial<Record<Currency, number>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  const [isShocking, setIsShocking] = useState<boolean>(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleFetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
            const cryptoList = [Currency.BTC, Currency.ETH, Currency.LTC, Currency.XMR, Currency.SOL];
      const pricePromises = cryptoList.map(crypto => fetchCryptoPrice(crypto));
      const results = await Promise.allSettled(pricePromises);
      
      const newPrices: Partial<Record<Currency, number>> = {};
      let hasError = false;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          newPrices[cryptoList[index]] = result.value;
        } else {
          console.error(`Failed to fetch price for ${cryptoList[index]}`, result.reason);
          hasError = true;
        }
      });

      setPrices(newPrices);
      if (hasError) {
        setError('Could not fetch all crypto prices. Some conversions may not be available.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setPrices({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchPrices();
    const intervalId = setInterval(handleFetchPrices, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
    }, [handleFetchPrices]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    let shockTimeout: number;

    const triggerShock = () => {
      setIsShocking(true);
      clearTimeout(shockTimeout);
      shockTimeout = window.setTimeout(() => {
        setIsShocking(false);
      }, 250); // Duration of the animation
    };

    const handleScroll = () => {
      triggerShock();
    };

    container.addEventListener('wheel', handleScroll);

    // Random neuro shocks
    const randomShockInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerShock();
      }
    }, 5000);

    return () => {
      container.removeEventListener('wheel', handleScroll);
      clearTimeout(shockTimeout);
      clearInterval(randomShockInterval);
    };
  }, []);

  const handleSelectFromCurrency = (currency: Currency) => {
    if (currency === toCurrency) {
      // If user selects the same currency as the 'to' currency, swap them
      setToCurrency(fromCurrency);
    }
    setFromCurrency(currency);
  };

  return (
    <div 
      ref={mainContainerRef}
      className={`min-h-screen w-full bg-cyber-blue text-cyber-accent flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden ${isShocking ? 'animate-shock' : ''}`}>

      <div className="absolute inset-0 cyber-grid [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyber-blue via-cyber-blue to-cyber-blue-light/80 pointer-events-none"></div>
      
      <main className="z-10 flex flex-col items-center w-full max-w-4xl">
        <h1 
          className="text-4xl md:text-6xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-cyber-accent glitch-text"
          data-text="NEURO_EXCHANGE"
        >
          NEURO_EXCHANGE
        </h1>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-blood-orange rounded-full animate-pulse"></div>
          <p className="text-cyber-accent/70 text-sm tracking-widest uppercase">
            Live Crypto Feed // System Active
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {supportedCurrencies.filter(c => c.currency !== toCurrency).map(({ currency, name, icon }) => (
            <button
              key={currency}
              onClick={() => handleSelectFromCurrency(currency)}
              className={`px-4 py-2 rounded-sm flex items-center gap-2 cyber-button ${
                fromCurrency === currency ? 'active' : ''
              }`}
              aria-pressed={fromCurrency === currency}
            >
              <span className="opacity-80">{icon}</span>
              <span className="font-bold tracking-wider">{currency}</span>
            </button>
          ))}
        </div>

        <ConverterCard
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          setFromCurrency={setFromCurrency}
          setToCurrency={setToCurrency}
          prices={prices}
          isLoading={isLoading}
          error={error}
          onRefresh={handleFetchPrices}
        />
        
        <footer className="mt-12 text-center text-cyber-accent/50 text-xs uppercase tracking-widest border-t border-cyber-accent/20 pt-4 w-full max-w-md">
            <p className="mb-1">SYS.DATE: {new Date().toISOString().split('T')[0]}</p>
            <p>DATA_SOURCE: GEMINI_ORACLE</p>
        </footer>
      </main>
    </div>
  );
};

export default App;