import React from 'react';
import { Plus, Package } from 'lucide-react';

interface EmptyContainersStateProps {
  onAddContainer: () => void;
}

export const EmptyContainersState: React.FC<EmptyContainersStateProps> = ({
  onAddContainer
}) => {
  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No containers yet</h3>
      <p className="text-gray-500 mb-4">Add your first container to start organizing your shipment</p>
      <button
        onClick={onAddContainer}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Container
      </button>
    </div>
  );
};