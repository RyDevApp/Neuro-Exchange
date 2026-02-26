import React, { useState, useEffect, useRef } from 'react';
import type { Currency } from '../types';

interface CurrencyInputProps {
  label: string;
  currency: Currency;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  onCurrencyChange?: (currency: Currency) => void;
  availableCurrencies?: { currency: Currency; name: string; icon: React.ReactNode }[];
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  label, 
  currency, 
  value, 
  onChange, 
  icon, 
  disabled = false,
  onCurrencyChange,
  availableCurrencies
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    if(onCurrencyChange) {
      onCurrencyChange(selectedCurrency);
    }
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value)) {
      onChange(e);
    }
  };

  const CurrencySelector: React.FC = () => (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 mt-[0.1rem] text-sm font-bold text-cyber-accent">
      {onCurrencyChange && availableCurrencies ? (
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="flex items-center gap-2 bg-cyber-blue-lighter/50 hover:bg-cyber-blue-lighter px-3 py-1.5 border-l border-cyber-accent/20 transition-colors h-full"
        >
          {currency}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <span className="px-4 border-l border-cyber-accent/20 h-full flex items-center">{currency}</span>
      )}
    </div>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-bold text-cyber-accent/70 mb-2 uppercase tracking-widest">{label}</label>
      <div className="relative flex items-center h-12">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0.00"
          className="w-full h-full cyber-input p-3 pl-12 pr-28 text-neon-green placeholder-cyber-accent/30 disabled:opacity-50"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-accent/50 w-5 h-5">
          {icon}
        </div>
        <CurrencySelector />
      </div>
      
      {isDropdownOpen && availableCurrencies && (
        <div className="absolute z-20 top-full right-0 mt-1 w-48 bg-cyber-blue-light border border-cyber-accent shadow-[0_0_15px_rgba(100,255,218,0.2)] overflow-hidden animate-fade-in-up">
          <ul className="max-h-60 overflow-y-auto">
            {availableCurrencies.map(item => (
              <li key={item.currency} className="border-b border-cyber-accent/10 last:border-0">
                <button
                  onClick={() => handleCurrencySelect(item.currency)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-cyber-accent hover:bg-neon-green/20 hover:text-neon-green transition-colors"
                >
                  <div className="w-5 h-5 opacity-80">{item.icon}</div>
                  <span className="font-mono tracking-wider">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CurrencyInput;