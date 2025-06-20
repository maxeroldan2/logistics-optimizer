import { useState } from 'react';
import { Product, Container } from '../types';

export const useShipmentManagement = () => {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingContainer, setEditingContainer] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
    setSelectedProduct(productId);
  };

  const handleEditContainer = (container: Container) => {
    setEditingContainer(container.id);
  };

  const handleDuplicateProduct = (product: Product) => {
    // Return the product without id for duplication
    const { id, ...productWithoutId } = product;
    return productWithoutId;
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditingContainer(null);
    setSelectedProduct(null);
  };

  return {
    editingProduct,
    editingContainer,
    selectedProduct,
    handleEditProduct,
    handleEditContainer,
    handleDuplicateProduct,
    cancelEditing
  };
};