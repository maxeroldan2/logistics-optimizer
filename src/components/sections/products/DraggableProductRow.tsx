import React from 'react';
import { Edit2, Trash2, GripVertical, Heart } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { Product, GlobalConfig } from '../../../types';
import { calculateProductScore, formatCurrency } from '../../../utils/calculations';

interface DraggableProductRowProps {
  product: Product;
  config: GlobalConfig;
  onEditProduct: (productId: string) => void;
  onRemoveProduct: (id: string) => void;
  onSaveProduct: (product: Product) => void;
}

export const DraggableProductRow: React.FC<DraggableProductRowProps> = ({
  product,
  config,
  onEditProduct,
  onRemoveProduct,
  onSaveProduct
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: product.id,
  });

  const getProductIcon = (product: Product) => {
    const name = product.name.toLowerCase();
    if (name.includes('iphone')) return '📱';
    if (name.includes('macbook') || name.includes('laptop')) return '💻';
    if (name.includes('sony') || name.includes('headphone')) return '🎧';
    return '📦';
  };

  const getProductColor = (product: Product) => {
    const name = product.name.toLowerCase();
    if (name.includes('iphone')) return 'bg-blue-500';
    if (name.includes('macbook')) return 'bg-purple-500';
    if (name.includes('sony')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getEfficiencyScore = (product: Product) => {
    const score = calculateProductScore(product);
    return Math.round(score.rawScore);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEfficiencyTextColor = (score: number) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-700';
    if (score >= 30) return 'text-orange-700';
    return 'text-red-700';
  };

  const getAssignmentStatus = (product: Product) => {
    if (product.containerId) {
      return {
        status: 'In Container 1',
        color: 'bg-blue-100 text-blue-800',
        textColor: 'text-blue-800'
      };
    }
    return {
      status: 'Unassigned',
      color: 'bg-gray-100 text-gray-600',
      textColor: 'text-gray-600'
    };
  };

  const calculateProfitPerUnit = (product: Product) => {
    return product.resalePrice - product.purchasePrice;
  };

  const efficiencyScore = getEfficiencyScore(product);
  const assignmentStatus = getAssignmentStatus(product);
  const profitPerUnit = calculateProfitPerUnit(product);

  return (
    <div 
      ref={setNodeRef}
      className={`px-6 py-4 transition-colors ${
        isDragging ? 'opacity-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Drag Handle */}
        <div className="col-span-1">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Product */}
        <div className="col-span-3">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-sm mr-3 flex items-center justify-center text-white text-xs ${getProductColor(product)}`}>
              {getProductIcon(product)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-1">
          <span className="text-gray-900 font-medium">{product.quantity}</span>
        </div>

        {/* Profit per Unit */}
        <div className="col-span-2">
          <span className="text-green-600 font-semibold">
            {formatCurrency(profitPerUnit, config.currency)}
          </span>
        </div>

        {/* Efficiency Score */}
        <div className="col-span-2">
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getEfficiencyColor(efficiencyScore)}`}
                style={{ width: `${efficiencyScore}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${getEfficiencyTextColor(efficiencyScore)}`}>
                  {efficiencyScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Status */}
        <div className="col-span-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignmentStatus.color}`}>
            {assignmentStatus.status}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onSaveProduct(product)}
              className="p-1 text-gray-400 hover:text-pink-600 transition-colors"
              title="Save as preset"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEditProduct(product.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit product"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemoveProduct(product.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};