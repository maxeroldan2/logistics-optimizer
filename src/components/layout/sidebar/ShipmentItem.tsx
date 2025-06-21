import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Shipment } from '../../../types';
import { ShipmentMenu } from './ShipmentMenu';

interface ShipmentItemProps {
  shipment: Shipment;
  isActive: boolean;
  timeAgo: string;
  status: string;
  folders: Array<{ id: string; name: string }>;
  onLoadShipment: (shipment: Shipment) => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
}

export const ShipmentItem: React.FC<ShipmentItemProps> = ({
  shipment,
  isActive,
  timeAgo,
  status,
  folders,
  onLoadShipment,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === shipment.id ? null : shipment.id);
  };

  return (
    <div 
      className={`relative p-3 rounded-md cursor-pointer transition-colors ${
        isActive 
          ? 'bg-blue-50 border border-blue-200' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div 
        className="flex items-center justify-between"
        onClick={() => onLoadShipment(shipment)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {shipment.name}
          </p>
          <p className={`text-xs ${
            status === 'Active' ? 'text-green-600' : 'text-gray-500'
          }`}>
            {status}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {timeAgo}
          </span>
          <button
            onClick={handleMenuToggle}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <ShipmentMenu
        shipmentId={shipment.id}
        shipmentName={shipment.name}
        isOpen={openMenuId === shipment.id}
        onClose={() => setOpenMenuId(null)}
        onRename={onRenameShipment}
        onMoveToFolder={onMoveToFolder}
        onArchive={onArchiveShipment}
        onDelete={onDeleteShipment}
        folders={folders}
      />
    </div>
  );
};