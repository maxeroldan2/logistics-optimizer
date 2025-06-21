import React from 'react';
import { Save, Edit2 } from 'lucide-react';
import { ShipmentActionCardProps } from './types';

export const ShipmentActionCard: React.FC<ShipmentActionCardProps> = ({
  currentShipment,
  onEditClick,
  onSaveClick
}) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 min-w-[280px]">
      <div className="flex items-center group mb-2">
        <h2 
          className="text-white text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors truncate max-w-[200px]"
          onClick={onEditClick}
          title={`${currentShipment.name} (Click to edit)`}
        >
          {currentShipment.name}
        </h2>
        <button
          onClick={onEditClick}
          className="ml-2 text-slate-400 hover:text-blue-200 transition-colors"
          title="Edit shipment"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>
      <p className="text-slate-300 text-sm mb-6">Ready to optimize.</p>
      <button 
        onClick={onSaveClick}
        className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Save className="h-4 w-4 mr-2" />
        Save
      </button>
    </div>
  );
};