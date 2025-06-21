import React from 'react';
import { Package } from 'lucide-react';
import { Container, Product } from '../../../types';

interface CompactContainerProps {
  container: Container;
  products: Product[];
  onEditContainer: (container: Container) => void;
}

export const CompactContainer: React.FC<CompactContainerProps> = ({
  container,
  products,
  onEditContainer
}) => {
  const assignedProducts = products.filter(product => product.containerId === container.id);
  const totalVolume = container.length * container.width * container.height;
  const usedVolume = assignedProducts.reduce((sum, product) => {
    const productVolume = product.length * product.width * product.height;
    return sum + (productVolume * product.quantity);
  }, 0);
  const volumePercentage = Math.round((usedVolume / totalVolume) * 100);

  const getContainerIcon = () => {
    if (container.name.toLowerCase().includes('cargo') || container.name.toLowerCase().includes('air')) {
      return <div className="text-blue-500 mr-2">✈️</div>;
    } else if (container.name.toLowerCase().includes('box')) {
      return <div className="text-orange-500 mr-2">📦</div>;
    } else {
      return <Package className="h-4 w-4 text-blue-500 mr-2" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center mb-2">
        {getContainerIcon()}
        <h4 className="font-medium text-gray-900 text-sm">{container.name}</h4>
        <button
          onClick={() => onEditContainer(container)}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          <span className="text-lg">⋯</span>
        </button>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Volume</span>
          <span>{volumePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              volumePercentage > 90 ? 'bg-red-500' :
              volumePercentage > 70 ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(volumePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => onEditContainer(container)}
        className="w-full py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Expand
      </button>
    </div>
  );
};