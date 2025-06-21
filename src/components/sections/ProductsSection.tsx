import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, GripVertical, HelpCircle, ChevronUp, ChevronDown, Heart } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { Product, GlobalConfig } from '../../types';
import { calculateProductScore, formatCurrency } from '../../utils/calculations';
import { ProductFormRefactored } from '../forms/product';
import { useSavedProducts } from '../../hooks/useSavedProducts';

interface ProductsSectionProps {
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

// Draggable Product Row Component
interface DraggableProductRowProps {
  product: Product;
  config: GlobalConfig;
  onEditProduct: (productId: string) => void;
  onRemoveProduct: (id: string) => void;
  onSaveProduct: (product: Product) => void;
}

const DraggableProductRow: React.FC<DraggableProductRowProps> = ({
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

const ProductsSection: React.FC<ProductsSectionProps> = ({
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

  const SortableHeader: React.FC<{ 
    column: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status';
    children: React.ReactNode;
    className?: string;
  }> = ({ column, children, className = '' }) => (
    <div 
      className={`flex items-center cursor-pointer hover:text-gray-800 transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      {children}
      {sortBy === column && (
        sortDirection === 'asc' ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Palette</h2>
        <button
          onClick={() => setShowNewProductForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-3">
              <SortableHeader column="name">PRODUCTO</SortableHeader>
            </div>
            <div className="col-span-1">
              <SortableHeader column="quantity">QTY</SortableHeader>
            </div>
            <div className="col-span-2">
              <SortableHeader column="profit">PROFIT/UNIT</SortableHeader>
            </div>
            <div className="col-span-2">
              <SortableHeader column="efficiency" className="flex items-center">
                EFFICIENCY SCORE
                <HelpCircle className="h-3 w-3 ml-1 text-gray-400" />
              </SortableHeader>
            </div>
            <div className="col-span-2">
              <SortableHeader column="status">ESTADO</SortableHeader>
            </div>
            <div className="col-span-1">ACCIONES</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedProducts.map(product => (
            <DraggableProductRow
              key={product.id}
              product={product}
              config={config}
              onEditProduct={onEditProduct}
              onRemoveProduct={onRemoveProduct}
              onSaveProduct={handleSaveProduct}
            />
          ))}
          
          {sortedProducts.length === 0 && !showNewProductForm && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Add your first product to start building your shipment</p>
              <button
                onClick={() => setShowNewProductForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          )}
        </div>
      </div>

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

export default ProductsSection;