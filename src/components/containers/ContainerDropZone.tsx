import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Container, Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { calculateContainerScore } from '../../utils/calculations';
import ScoreCard from '../common/ScoreCard';
import { Package, Edit2, Trash2 } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { getIconByName } from '../common/IconSelector';

interface ContainerDropZoneProps {
  container: Container;
  products: Product[];
  onEdit?: (container: Container) => void;
  onDelete?: (id: string) => void;
}

const ContainerDropZone: React.FC<ContainerDropZoneProps> = ({ 
  container, 
  products,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: container.id,
  });
  
  const { config } = useAppContext();
  const containerProducts = products.filter(p => p.containerId === container.id);
  const containerScore = calculateContainerScore(containerProducts, container);
  const ContainerIcon = getIconByName(container.icon);
  
  return (
    <>
      <div
        ref={setNodeRef}
        className={`p-4 rounded-lg border-2 transition-colors ${
          isOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              <ContainerIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{container.name}</h3>
            </div>
            <div className="text-sm text-gray-500">
              {container.height} × {container.width} × {container.length} 
              {config.measurement === 'metric' ? ' cm' : ' in'}
            </div>
          </div>
          
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(container)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-100"
                title="Edit container"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-gray-100"
                title="Delete container"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {containerProducts.map(product => {
            const ProductIcon = getIconByName(product.icon);
            return (
              <div 
                key={product.id}
                className="p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center">
                  <ProductIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium text-gray-700">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Qty: {product.quantity}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {containerProducts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Drop products here
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <ScoreCard 
            score={containerScore}
            title="Container Score"
            description="Optimization score for this container"
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Container"
        message={`Are you sure you want to delete "${container.name}"? All products in this container will be unassigned.`}
        onConfirm={() => {
          onDelete?.(container.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default ContainerDropZone;