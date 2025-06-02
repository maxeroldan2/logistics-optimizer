import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
  showIcon?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  position = 'top', 
  children,
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { config } = useAppContext();
  
  if (!config.showTooltips) {
    return <>{children}</>;
  }
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  };
  
  return (
    <div className="relative inline-flex items-center group">
      {children}
      
      {showIcon && (
        <span 
          className="ml-1 text-blue-500 cursor-pointer" 
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <Info size={16} />
        </span>
      )}
      
      {isVisible && (
        <div 
          className={`absolute z-10 bg-gray-800 text-white text-sm rounded p-2 shadow-lg max-w-xs pointer-events-none
                    ${positionClasses[position]}`}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45
                      ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 -mb-1' : ''}
                      ${position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -ml-1' : ''}
                      ${position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -mt-1' : ''}
                      ${position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 -mr-1' : ''}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;