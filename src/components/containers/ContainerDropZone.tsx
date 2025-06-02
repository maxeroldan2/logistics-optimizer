import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Container, Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { calculateContainerScore } from '../../utils/calculations';
import ScoreCard from '../common/ScoreCard';

interface ContainerDropZoneProps {
  container: Container;
  products: Product[];
}

const ContainerDropZone: React.FC<ContainerDropZoneProps> = ({ container, products }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: container.id,
  });
  
  const { config } = useAppContext();
  const containerProducts = products.filter(p => p.containerId === container.id);
  const containerScore = calculateContainerScore(containerProducts, container);
  
  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border-2 transition-colors ${
        isOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{container.name}</h3>
        <div className="text-sm text-gray-500">
          {container.height} × {container.width} × {container.length} 
          {config.measurement === 'metric' ? ' cm' : ' in'}
        </div>
      </div>
      
      <div className="space-y-2">
        {containerProducts.map(product => (
          <div 
            key={product.id}
            className="p-2 bg-gray-50 rounded border border-gray-200"
          >
            <div className="font-medium text-gray-700">{product.name}</div>
            <div className="text-sm text-gray-500">
              Qty: {product.quantity}
            </div>
          </div>
        ))}
        
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
  );
};

export default ContainerDropZone;