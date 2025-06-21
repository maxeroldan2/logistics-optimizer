import React from 'react';
import { Plus, Search } from 'lucide-react';

interface ActionButtonsProps {
  onCreateNewShipment: () => void;
  onSearchShipments: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreateNewShipment,
  onSearchShipments
}) => {
  return (
    <div className="p-4 border-b border-gray-200 space-y-3">
      <button
        onClick={onCreateNewShipment}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Shipment
      </button>
      <button
        onClick={onSearchShipments}
        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
      >
        <Search className="h-4 w-4 mr-2" />
        Search Shipments
      </button>
    </div>
  );
};