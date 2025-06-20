import React from 'react';
import { Product, Container } from '../../types';
import UnassignedProductsZone from './UnassignedProductsZone';
import ContainerDropZone from '../containers/ContainerDropZone';

interface DragAndDropSectionProps {
  products: Product[];
  containers: Container[];
  onEditProduct: (productId: string) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onEditContainer: (container: Container) => void;
  onDeleteContainer: (containerId: string) => void;
}

const DragAndDropSection: React.FC<DragAndDropSectionProps> = ({
  products,
  containers,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onEditContainer,
  onDeleteContainer
}) => {
  const unassignedProducts = products.filter(p => !p.containerId);
  const hasContainers = containers.length > 0;
  const hasProducts = products.length > 0;

  if (!hasContainers || !hasProducts) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">📦 Drag & Drop Assignment</h2>
      
      {/* Unassigned Products Zone */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">
          📋 Unassigned Products (Drag to assign to containers)
        </h3>
        <UnassignedProductsZone
          products={unassignedProducts}
          onEdit={onEditProduct}
          onDuplicate={onDuplicateProduct}
          onDelete={onDeleteProduct}
        />
      </div>

      {/* Container Drop Zones */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">
          🎯 Containers (Drop products here)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {containers.map(container => (
            <ContainerDropZone
              key={container.id}
              container={container}
              products={products}
              onEdit={onEditContainer}
              onDelete={onDeleteContainer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragAndDropSection;