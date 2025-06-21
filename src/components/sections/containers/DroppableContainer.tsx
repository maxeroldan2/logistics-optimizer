import React from 'react';
import { Edit2, Trash2, Package, Briefcase, Info } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { Container, Product, GlobalConfig } from '../../../types';
import { formatCurrency } from '../../../utils/calculations';
import { useDraggedProduct } from '../../dragdrop/DragDropProvider';

interface DroppableContainerProps {
  container: Container;
  products: Product[];
  config: GlobalConfig;
  onEditContainer: (container: Container) => void;
  onRemoveContainer: (id: string) => void;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  container,
  products,
  config,
  onEditContainer,
  onRemoveContainer
}) => {
  const { draggedProduct } = useDraggedProduct();
  const { isOver, setNodeRef } = useDroppable({
    id: container.id,
  });

  const getAssignedProducts = (containerId: string) => {
    return products.filter(product => product.containerId === containerId);
  };

  const calculateUtilization = (container: Container) => {
    const assignedProducts = getAssignedProducts(container.id);
    const totalVolume = container.length * container.width * container.height;
    const totalWeight = container.maxWeight;
    
    let usedVolume = 0;
    let usedWeight = 0;
    let totalProfit = 0;

    assignedProducts.forEach(product => {
      const productVolume = product.length * product.width * product.height;
      usedVolume += productVolume * product.quantity;
      usedWeight += product.weight * product.quantity;
      totalProfit += (product.resalePrice - product.purchasePrice) * product.quantity;
    });

    return {
      volumeUsed: Math.round((usedVolume / totalVolume) * 100),
      weightUsed: Math.round((usedWeight / totalWeight) * 100),
      totalProfit
    };
  };

  const getContainerIcon = (container: Container) => {
    if (container.name.toLowerCase().includes('carry-on') || container.name.toLowerCase().includes('samsonite')) {
      return <Briefcase className="h-5 w-5 text-green-600" />;
    }
    return <Package className="h-5 w-5 text-blue-600" />;
  };

  const utilization = calculateUtilization(container);
  const assignedProducts = getAssignedProducts(container.id);

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-lg border-2 transition-all duration-200 ${
        draggedProduct ? 
          (isOver ? 'border-blue-500 bg-blue-50' : 'border-blue-300 border-dashed') 
          : 'border-gray-200'
      }`}
    >
      {/* Container Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {getContainerIcon(container)}
            <h3 className="ml-2 font-semibold text-gray-900">{container.name}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEditContainer(container)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit container"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemoveContainer(container.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete container"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Costo de envío: {formatCurrency(container.shippingCost, config.currency)} | {container.shippingDuration || 0} días
        </div>
      </div>

      {/* Product Drop Zone */}
      <div className={assignedProducts.length > 0 ? "p-6" : "p-12 text-center"}>
        {assignedProducts.length > 0 ? (
          <div className="space-y-2">
            {assignedProducts.map(product => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    product.name.includes('iPhone') ? 'bg-blue-500' :
                    product.name.includes('Sony') ? 'bg-red-500' :
                    product.name.includes('Macbook') ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {product.name} (x{product.quantity})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 text-sm">
                    {formatCurrency((product.resalePrice - product.purchasePrice) * product.quantity, config.currency)} Profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-lg transition-colors ${
            draggedProduct ? 
              (isOver ? 'border-blue-500 bg-blue-50' : 'border-blue-300') 
              : 'border-gray-300'
          }`}>
            {draggedProduct ? (
              <div className="text-gray-600">
                <Package className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-lg font-medium text-gray-900 mb-2">Drop here to assign</p>
                <p className="text-gray-500">Release to add product to this container</p>
              </div>
            ) : (
              <div className="text-gray-600">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">This container is empty</h3>
                <p className="text-gray-500">
                  Add a product to the palette below, then drag it here to assign it.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Utilization Bars */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Volume Used</span>
            <span>{utilization.volumeUsed}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization.volumeUsed > 90 ? 'bg-red-500' :
                utilization.volumeUsed > 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(utilization.volumeUsed, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Weight Used</span>
            <span>{utilization.weightUsed}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization.weightUsed > 90 ? 'bg-red-500' :
                utilization.weightUsed > 70 ? 'bg-yellow-500' :
                'bg-orange-500'
              }`}
              style={{ width: `${Math.min(utilization.weightUsed, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};