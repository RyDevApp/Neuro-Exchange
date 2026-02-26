import React, { useState, useEffect, useMemo } from 'react';
import { Currency } from '../types';
import CurrencyInput from './CurrencyInput';
import { RefreshIcon } from './icons/RefreshIcon';
import { SwapIcon } from './icons/SwapIcon';
import { supportedCurrencies } from '../App';

interface ConverterCardProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  setFromCurrency: (c: Currency) => void;
  setToCurrency: (c: Currency) => void;
  prices: Partial<Record<Currency, number>>;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/**
 * Formats a number to a string with high precision, stripping insignificant trailing zeros.
 * @param num The number to format.
 * @returns A string representing the number with high precision.
 */
const formatPreciseNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '';
  // Use toFixed for high precision, then strip trailing zeros and any trailing decimal point.
  return num.toFixed(18).replace(/0+$/, '').replace(/\.$/, '');
};

const ConverterCard: React.FC<ConverterCardProps> = ({ 
  fromCurrency, 
  toCurrency, 
  setFromCurrency,
  setToCurrency,
  prices, 
  isLoading, 
  error, 
  onRefresh 
}) => {
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  
  const rate = useMemo(() => {
    const fromPrice = fromCurrency === Currency.USD ? 1 : prices[fromCurrency];
    const toPrice = toCurrency === Currency.USD ? 1 : prices[toCurrency];

    if (!fromPrice || !toPrice || fromPrice === 0 || toPrice === 0) return 0;

    return fromPrice / toPrice;
  }, [fromCurrency, toCurrency, prices]);

  const isDataReady = !isLoading && !error && rate > 0;

  useEffect(() => {
    const numericFromValue = parseFloat(fromValue);
    if (rate > 0 && !isNaN(numericFromValue)) {
      const newToValue = numericFromValue * rate;
      setToValue(formatPreciseNumber(newToValue));
    } else {
      setToValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, rate]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromValue(value);
    const numericValue = parseFloat(value);
    if (value && !isNaN(numericValue) && rate > 0) {
      const converted = numericValue * rate;
      setToValue(formatPreciseNumber(converted));
    } else {
      setToValue('');
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToValue(value);
    const numericValue = parseFloat(value);
    if (value && !isNaN(numericValue) && rate > 0) {
      const converted = numericValue / rate;
      setFromValue(formatPreciseNumber(converted));
    } else {
      setFromValue('');
    }
  };

  const handleSwap = () => {
    const oldFromValue = fromValue;
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromValue(toValue);
    setToValue(oldFromValue);
  };

  const formattedRate = useMemo(() => {
    if (isLoading && rate === 0) return 'Fetching rate...';
    if (error && rate === 0) return 'Rate unavailable';
    return rate > 0 ? `1 ${fromCurrency} ≈ ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${toCurrency}` : 'N/A';
  }, [rate, isLoading, error, fromCurrency, toCurrency]);

  const fromCurrencyInfo = supportedCurrencies.find(c => c.currency === fromCurrency);
  const toCurrencyInfo = supportedCurrencies.find(c => c.currency === toCurrency);

  const availableToCurrencies = supportedCurrencies.filter(c => c.currency !== fromCurrency);

  return (
    <div className="w-full max-w-md cyber-panel rounded-sm p-6 space-y-6 relative">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neon-green"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neon-green"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neon-green"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neon-green"></div>

      <div className="flex justify-between items-center border-b border-cyber-accent/20 pb-4">
        <p className="text-cyber-accent/70 text-xs uppercase tracking-widest">Exchange_Rate</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-blood-orange font-mono tracking-tight">{formattedRate}</p>
          <button 
            onClick={onRefresh} 
            disabled={isLoading} 
            className="text-cyber-accent/50 hover:text-neon-green disabled:text-cyber-accent/20 transition-colors"
            aria-label="Refresh prices"
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center space-y-4">
        <CurrencyInput
          label="INPUT_STREAM"
          currency={fromCurrency}
          value={fromValue}
          onChange={handleFromChange}
          icon={fromCurrencyInfo?.icon}
          disabled={!isDataReady}
        />
        
        <div className="w-full flex justify-center py-2 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyber-accent/20 -translate-y-1/2"></div>
          <button 
            onClick={handleSwap} 
            className="p-2 bg-cyber-blue border border-cyber-accent/50 text-cyber-accent hover:text-neon-green hover:border-neon-green hover:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all relative z-10"
            aria-label="Swap currencies"
          >
            <SwapIcon className="w-4 h-4" />
          </button>
        </div>

        <CurrencyInput
          label="OUTPUT_STREAM"
          currency={toCurrency}
          value={toValue}
          onChange={handleToChange}
          icon={toCurrencyInfo?.icon}
          disabled={!isDataReady}
          availableCurrencies={availableToCurrencies}
          onCurrencyChange={setToCurrency}
        />
      </div>

      {error && rate === 0 && (
        <div className="mt-4 p-2 border border-blood-orange/50 bg-blood-orange/10 text-blood-orange text-xs uppercase tracking-wider text-center">
          ERR: {error}
        </div>
      )}
    </div>
  );
};

export default ConverterCard;