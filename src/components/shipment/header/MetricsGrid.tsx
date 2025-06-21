import React from 'react';
import { TrendingUp, DollarSign, Zap, Package } from 'lucide-react';
import { calculateCompleteShipmentScore } from '../../../utils/calculations';
import { MetricCard } from './MetricCard';
import { MetricsGridProps } from './types';

export const MetricsGrid: React.FC<MetricsGridProps> = ({ currentShipment }) => {
  // Calculate metrics
  const { score } = calculateCompleteShipmentScore(currentShipment);
  
  // Calculate if we have any data
  const hasProducts = currentShipment.products.length > 0;
  const hasContainers = currentShipment.containers.length > 0;
  const hasData = hasProducts && hasContainers;

  const metrics = [
    {
      icon: TrendingUp,
      title: 'SCORE',
      value: hasData ? score.rawScore.toFixed(1) : '--',
      subtitle: hasData ? 'Calculated' : 'Awaiting data',
      iconColor: 'text-blue-500'
    },
    {
      icon: DollarSign,
      title: 'PROFIT MARGIN',
      value: hasData ? `${(score.profitMargin * 100).toFixed(1)}%` : '--%',
      subtitle: hasData ? `$${score.totalResale.toFixed(2)} estimated` : '$0.00 estimated',
      iconColor: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'EFFICIENCY',
      value: hasData ? score.efficiencyScore.toFixed(1) : '--',
      subtitle: 'Based on turnover',
      iconColor: 'text-purple-500'
    },
    {
      icon: Package,
      title: 'SPACE UTILIZED',
      value: hasData ? `${(score.volumeUtilization * 100).toFixed(0)}%` : '--%',
      subtitle: 'Container efficiency',
      iconColor: 'text-orange-500'
    }
  ];

  return (
    <div className="flex-1 grid grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  );
};