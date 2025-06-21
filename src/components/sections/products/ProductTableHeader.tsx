import React from 'react';
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';

interface ProductTableHeaderProps {
  sortBy: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status' | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status') => void;
}

export const ProductTableHeader: React.FC<ProductTableHeaderProps> = ({
  sortBy,
  sortDirection,
  onSort
}) => {
  const SortableHeader: React.FC<{ 
    column: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status';
    children: React.ReactNode;
    className?: string;
  }> = ({ column, children, className = '' }) => (
    <div 
      className={`flex items-center cursor-pointer hover:text-gray-800 transition-colors ${className}`}
      onClick={() => onSort(column)}
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
  );
};