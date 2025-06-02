import React from 'react';
import { Crown, Check, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PremiumBanner: React.FC = () => {
  const { isPremiumUser, togglePremiumFeatures } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(true);
  
  if (isPremiumUser || !isOpen) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-4 mb-6 text-white relative overflow-hidden">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-shrink-0 bg-yellow-500 rounded-full p-2 md:mr-4 mb-3 md:mb-0">
          <Crown className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-lg font-semibold mb-1">Upgrade to Premium</h3>
          <p className="text-blue-100 text-sm mb-2">
            Unlock advanced features to maximize your logistics profits
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="flex items-center">
              <Check className="h-3 w-3 text-green-300 mr-1" />
              <span>Save & Compare Shipments</span>
            </div>
            <div className="flex items-center">
              <Check className="h-3 w-3 text-green-300 mr-1" />
              <span>AI Dimension Autocompletion</span>
            </div>
            <div className="flex items-center">
              <Check className="h-3 w-3 text-green-300 mr-1" />
              <span>Dumping Penalizer</span>
            </div>
            <div className="flex items-center">
              <Check className="h-3 w-3 text-green-300 mr-1" />
              <span>40+ Market Presets</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 md:mt-0 md:ml-4">
          <button
            onClick={togglePremiumFeatures}
            className="px-4 py-2 bg-white text-blue-700 rounded-md font-medium text-sm hover:bg-blue-50 transition-colors"
          >
            Try Premium Demo
          </button>
        </div>
      </div>
      
      <div className="absolute right-0 bottom-0 opacity-10">
        <svg className="h-24 w-24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default PremiumBanner;