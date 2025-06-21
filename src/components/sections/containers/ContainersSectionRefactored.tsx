import React, { useState } from 'react';
import { Container, Product, GlobalConfig } from '../../../types';
import { ContainerFormRefactored } from '../../forms/container';
import { ContainerActions } from './ContainerActions';
import { ContainerGrid } from './ContainerGrid';
import { EmptyContainersState } from './EmptyContainersState';

interface ContainersSectionRefactoredProps {
  containers: Container[];
  products: Product[];
  config: GlobalConfig;
  onAddContainer: (container: Omit<Container, 'id' | 'products'>) => void;
  onUpdateContainer: (id: string, updates: Partial<Container>) => void;
  onRemoveContainer: (id: string) => void;
  onEditContainer: (container: Container) => void;
  editingContainer: string | null;
  containerBeingEdited?: Container;
  onCancelEdit: () => void;
}

export const ContainersSectionRefactored: React.FC<ContainersSectionRefactoredProps> = ({
  containers,
  products,
  config,
  onAddContainer,
  onUpdateContainer,
  onRemoveContainer,
  onEditContainer,
  editingContainer,
  containerBeingEdited,
  onCancelEdit
}) => {
  const [showNewContainerForm, setShowNewContainerForm] = useState(false);

  const handleAddContainer = () => {
    setShowNewContainerForm(true);
  };

  return (
    <div>
      <ContainerActions onAddContainer={handleAddContainer} />

      {/* Container Form Modal */}
      <ContainerFormRefactored
        isOpen={showNewContainerForm}
        onAddContainer={container => {
          onAddContainer(container);
          setShowNewContainerForm(false);
        }}
        onCancel={() => setShowNewContainerForm(false)}
      />

      {/* Container Content */}
      {containers.length === 0 && !showNewContainerForm ? (
        <EmptyContainersState onAddContainer={handleAddContainer} />
      ) : (
        <ContainerGrid
          containers={containers}
          products={products}
          config={config}
          onEditContainer={onEditContainer}
          onRemoveContainer={onRemoveContainer}
          onAddContainer={handleAddContainer}
        />
      )}

      {/* Edit Container Modal */}
      {editingContainer && containerBeingEdited && (
        <ContainerFormRefactored
          container={containerBeingEdited}
          isOpen={true}
          onUpdateContainer={updates => {
            onUpdateContainer(containerBeingEdited.id, updates);
            onCancelEdit();
          }}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
};