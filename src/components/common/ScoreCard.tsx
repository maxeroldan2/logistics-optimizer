import React from 'react';
import { formatCurrency, formatPercentage } from '../../utils/calculations';
import { useAppContext } from '../../context/AppContext';
import Tooltip from './Tooltip';
import { ShipmentScore } from '../../types';

interface ScoreCardProps {
  score: ShipmentScore;
  title: string;
  description?: string;
  isPrimary?: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ 
  score, 
  title, 
  description,
  isPrimary = false
}) => {
  const { config } = useAppContext();
  
  const formatScore = (value: number): string => {
    return value.toFixed(2);
  };
  
  return (
    <div className={`rounded-lg shadow-md p-4 transition-all duration-200 
                   ${isPrimary 
                     ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' 
                     : 'bg-white hover:shadow-lg'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isPrimary ? 'text-white' : 'text-gray-700'}`}>
          {title}
        </h3>
        {description && (
          <Tooltip content={description} position="top" />
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {isPrimary && (
          <div className="flex justify-between">
            <div className="text-3xl font-bold">{formatScore(score.rawScore)}</div>
            <div className="flex flex-col items-end">
              <div className="text-sm opacity-70">Efficiency</div>
              <div className="text-xl font-semibold">{formatScore(score.efficiencyScore)}</div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className={isPrimary ? 'text-blue-100' : 'text-gray-600'}>
            Total Cost
          </span>
          <span className="font-medium">
            {formatCurrency(score.totalCost, config.currency)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={isPrimary ? 'text-blue-100' : 'text-gray-600'}>
            Total Resale
          </span>
          <span className="font-medium">
            {formatCurrency(score.totalResale, config.currency)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={isPrimary ? 'text-blue-100' : 'text-gray-600'}>
            Profit Margin
          </span>
          <span className="font-medium">
            {formatPercentage(score.profitMargin)}
          </span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-opacity-20 flex justify-between text-sm">
          <span className={isPrimary ? 'text-blue-100' : 'text-gray-600'}>
            Volume Used
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${score.volumeUtilization * 100}%` }}
            ></div>
          </div>
          <span className={`${isPrimary ? 'text-white' : 'text-gray-900'} ml-2`}>
            {formatPercentage(score.volumeUtilization)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={isPrimary ? 'text-blue-100' : 'text-gray-600'}>
            Weight Used
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${score.weightUtilization * 100}%` }}
            ></div>
          </div>
          <span className={`${isPrimary ? 'text-white' : 'text-gray-900'} ml-2`}>
            {formatPercentage(score.weightUtilization)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;