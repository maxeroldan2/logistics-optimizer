import React, { useState, useMemo } from 'react';
import { Product, GlobalConfig } from '../../../types';
import { calculateProductScore } from '../../../utils/calculations';
import { ProductFormRefactored } from '../../forms/product';
import { useSavedProducts } from '../../../hooks/useSavedProducts';
import { ProductActions } from './ProductActions';
import { ProductTable } from './ProductTable';

interface ProductsSectionRefactoredProps {
  products: Product[];
  config: GlobalConfig;
  aiDimensionsEnabled: boolean;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onRemoveProduct: (id: string) => void;
  onEditProduct: (productId: string) => void;
  onDuplicateProduct: (product: Product) => void;
  editingProduct: string | null;
  productBeingEdited?: Product;
  onCancelEdit: () => void;
}

export const ProductsSectionRefactored: React.FC<ProductsSectionRefactoredProps> = ({
  products,
  config,
  aiDimensionsEnabled: _aiDimensionsEnabled, // eslint-disable-line @typescript-eslint/no-unused-vars
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  onEditProduct,
  onDuplicateProduct: _onDuplicateProduct, // eslint-disable-line @typescript-eslint/no-unused-vars
  editingProduct,
  productBeingEdited,
  onCancelEdit
}) => {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'profit' | 'efficiency' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { saveProduct } = useSavedProducts();

  const handleSaveProduct = async (product: Product) => {
    const success = await saveProduct(product);
    if (success) {
      // Could add a toast notification here
      console.log('Product saved successfully!');
    }
  };

  const handleSort = (column: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedProducts = useMemo(() => {
    if (!sortBy) return products;

    return [...products].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'profit':
          aValue = (a.resalePrice - a.purchasePrice) * a.quantity;
          bValue = (b.resalePrice - b.purchasePrice) * b.quantity;
          break;
        case 'efficiency': {
          const aScore = calculateProductScore(a);
          const bScore = calculateProductScore(b);
          aValue = aScore.efficiencyScore;
          bValue = bScore.efficiencyScore;
          break;
        }
        case 'status':
          // Sort by assignment status: Assigned first, then Unassigned
          aValue = a.containerId ? 'assigned' : 'unassigned';
          bValue = b.containerId ? 'assigned' : 'unassigned';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [products, sortBy, sortDirection]);

  const handleAddProduct = () => {
    setShowNewProductForm(true);
  };

  return (
    <div>
      <ProductActions onAddProduct={handleAddProduct} />

      {/* Product Form Modal */}
      <ProductFormRefactored
        isOpen={showNewProductForm}
        onAddProduct={product => {
          onAddProduct(product);
          setShowNewProductForm(false);
        }}
        onClose={() => setShowNewProductForm(false)}
      />

      {/* Products Table */}
      <ProductTable
        products={sortedProducts}
        config={config}
        sortBy={sortBy}
        sortDirection={sortDirection}
        showNewProductForm={showNewProductForm}
        onSort={handleSort}
        onEditProduct={onEditProduct}
        onRemoveProduct={onRemoveProduct}
        onSaveProduct={handleSaveProduct}
        onAddProduct={handleAddProduct}
      />

      {/* Edit Product Modal */}
      {editingProduct && productBeingEdited && (
        <ProductFormRefactored 
          product={productBeingEdited}
          isOpen={true}
          onUpdateProduct={(id, updates) => {
            onUpdateProduct(id, updates);
            onCancelEdit();
          }}
          onClose={onCancelEdit}
        />
      )}
    </div>
  );
};