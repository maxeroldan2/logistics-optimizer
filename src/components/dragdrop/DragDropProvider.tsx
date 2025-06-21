import React, { createContext, useContext, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { Container, Product } from '../../types';

interface DragDropContextType {
  draggedProduct: string | null;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useDraggedProduct = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDraggedProduct must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
  containers: Container[];
  products: Product[];
  onProductAssignment: (productId: string, containerId?: string) => void;
}

const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  containers,
  products,
  onProductAssignment
}) => {
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);

  // Configure sensors with improved accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get the product being dragged for the overlay
  const draggedProduct = activeProductId ? products.find(p => p.id === activeProductId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveProductId(active.id as string);
    console.log(`Drag started: Product ${active.id}`);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      console.log(`Dragging over: ${over.id}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const productId = active.id as string;
    
    setActiveProductId(null);

    if (over) {
      const dropTargetId = over.id as string;
      
      if (dropTargetId === 'unassigned-products') {
        // Dropped on unassigned products zone - unassign from container
        onProductAssignment(productId, undefined);
        console.log(`✅ Product ${productId} unassigned from container`);
      } else {
        // Check if the drop target is a container
        const targetContainer = containers.find(c => c.id === dropTargetId);
        if (targetContainer) {
          onProductAssignment(productId, dropTargetId);
          console.log(`✅ Product ${productId} assigned to container ${targetContainer.name}`);
        } else {
          console.log(`❌ Invalid drop target: ${dropTargetId}`);
        }
      }
    } else {
      // Dropped outside any valid drop zone - unassign from container
      onProductAssignment(productId, undefined);
      console.log(`✅ Product ${productId} unassigned (dropped outside)`);
    }
  };

  const handleDragCancel = () => {
    setActiveProductId(null);
    console.log('Drag cancelled');
  };

  // Helper functions for drag overlay
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

  const contextValue = useMemo(() => ({ 
    draggedProduct: activeProductId 
  }), [activeProductId]);

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          restoreFocus: true,
        }}
      >
        {children}
        <DragOverlay>
          {draggedProduct ? (
            <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-4 max-w-sm">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-sm mr-3 flex items-center justify-center text-white text-sm ${getProductColor(draggedProduct)}`}>
                  {getProductIcon(draggedProduct)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{draggedProduct.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {draggedProduct.quantity}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
};

export default DragDropProvider;