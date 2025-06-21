import React from 'react';
import { Plus } from 'lucide-react';
import { Container, Product, GlobalConfig } from '../../../types';
import { DroppableContainer } from './DroppableContainer';
import { CompactContainer } from './CompactContainer';

interface ContainerGridProps {
  containers: Container[];
  products: Product[];
  config: GlobalConfig;
  onEditContainer: (container: Container) => void;
  onRemoveContainer: (id: string) => void;
  onAddContainer: () => void;
}

export const ContainerGrid: React.FC<ContainerGridProps> = ({
  containers,
  products,
  config,
  onEditContainer,
  onRemoveContainer,
  onAddContainer
}) => {
  return (
    <>
      {/* Main Containers (first 2) */}
      <div className={`grid gap-6 ${
        containers.length === 1 
          ? 'grid-cols-1' 
          : 'grid-cols-2'
      }`}>
        {containers.slice(0, 2).map(container => (
          <DroppableContainer
            key={container.id}
            container={container}
            products={products}
            config={config}
            onEditContainer={onEditContainer}
            onRemoveContainer={onRemoveContainer}
          />
        ))}
      </div>

      {/* Additional Containers Section */}
      {containers.length > 2 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Containers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {containers.slice(2).map(container => (
              <CompactContainer
                key={container.id}
                container={container}
                products={products}
                onEditContainer={onEditContainer}
              />
            ))}
            
            {/* Add Container Button */}
            <div 
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={onAddContainer}
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Plus className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-600">Add Container</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};