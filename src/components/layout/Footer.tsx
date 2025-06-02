import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Footer: React.FC = () => {
  const { config } = useAppContext();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Logistics Investment Optimizer
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {config.language === 'en' ? 'English' : 
                 config.language === 'es' ? 'Español' : 'Português'}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">
                {config.currency}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-500">
                {config.measurement === 'metric' ? 'Metric' : 'Imperial'}
              </span>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0">
            <div className="flex -space-x-1 overflow-hidden">
              {['Amazon', 'MercadoLibre', 'Shopify', 'eBay'].map((platform, index) => (
                <span 
                  key={platform}
                  className={`inline-block h-6 w-6 rounded-full text-xs flex items-center justify-center text-white font-bold
                           ${index % 4 === 0 ? 'bg-blue-500' : 
                             index % 4 === 1 ? 'bg-yellow-500' : 
                             index % 4 === 2 ? 'bg-green-500' : 'bg-red-500'}`}
                  title={platform}
                >
                  {platform.charAt(0)}
                </span>
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-500">+ more platforms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;