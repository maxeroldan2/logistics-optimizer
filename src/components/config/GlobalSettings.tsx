import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Currency, Language, Measurement } from '../../types';

interface GlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useAppContext();
  
  if (!isOpen) return null;
  
  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'BRL', 'ARS'];
  const languages: Language[] = ['en', 'es', 'pt'];
  const measurements: Measurement[] = ['metric', 'imperial'];
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ currency: e.target.value as Currency });
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ language: e.target.value as Language });
  };
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ measurement: e.target.value as Measurement });
  };
  
  const handleTooltipsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ showTooltips: e.target.checked });
  };
  
  const getLanguageLabel = (code: string): string => {
    switch (code) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'pt': return 'Português';
      default: return code;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Global Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={config.currency}
              onChange={handleCurrencyChange}
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={config.language}
              onChange={handleLanguageChange}
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {languages.map(language => (
                <option key={language} value={language}>
                  {getLanguageLabel(language)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measurement System
            </label>
            <select
              value={config.measurement}
              onChange={handleMeasurementChange}
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {measurements.map(measurement => (
                <option key={measurement} value={measurement}>
                  {measurement === 'metric' ? 'Metric (cm, kg)' : 'Imperial (in, lb)'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="tooltips"
              type="checkbox"
              checked={config.showTooltips}
              onChange={handleTooltipsChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tooltips" className="ml-2 block text-sm text-gray-700">
              Show explanatory tooltips
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent 
                     shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;