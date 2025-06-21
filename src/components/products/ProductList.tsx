import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { calculateProductScore, formatCurrency } from '../../utils/calculations';
import { useAppContext } from '../../context/AppContext';
import { getIconByName } from '../common/IconSelector';

interface ProductListProps {
  products: Product[];
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onRemove, onEdit }) => {
  const { config } = useAppContext();
  
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
        No products added yet. Add products to calculate optimization.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dimensions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pricing
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const score = calculateProductScore(product);
              const unit = config.measurement === 'metric' ? 'cm' : 'in';
              const weightUnit = config.measurement === 'metric' ? 'kg' : 'lb';
              const ProductIcon = getIconByName(product.icon);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <ProductIcon size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {product.quantity} • {product.daysToSell} days to sell
                          {product.tag && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {product.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {product.height} × {product.width} × {product.length} {unit}
                    </div>
                    <div>{product.weight} {weightUnit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Buy: {formatCurrency(product.purchasePrice, config.currency)}
                    </div>
                    <div className="text-sm text-gray-900">
                      Sell: {formatCurrency(product.resalePrice, config.currency)}
                    </div>
                    <div className="text-xs text-green-600">
                      Profit: {formatCurrency(product.resalePrice - product.purchasePrice, config.currency)}/unit
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {score.rawScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Efficiency: {score.efficiencyScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Vol: {score.volume.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onEdit(product.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onRemove(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;