import React from 'react';
import { Package, Settings, Lock, DollarSign } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const { isPremiumUser, togglePremiumFeatures } = useAppContext();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              Logistics Investment Optimizer
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePremiumFeatures}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium
                       ${isPremiumUser 
                         ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700' 
                         : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              {isPremiumUser ? (
                <>
                  <DollarSign className="h-4 w-4 mr-1" />
                  Premium
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Free
                </>
              )}
            </button>
            
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Settings"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-600 text-center py-3">
        <p className="text-white text-sm font-medium">
          Maximizá tus ganancias optimizando espacio, reventa y velocidad de rotación con inteligencia logística.
        </p>
      </div>
    </header>
  );
};

export default Header;