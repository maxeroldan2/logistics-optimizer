import React from 'react';
import { MetricCardProps } from './types';

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center mb-3">
        <Icon className={`h-5 w-5 ${iconColor} mr-2`} />
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-500">
        {subtitle}
      </div>
    </div>
  );
};