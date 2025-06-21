import React from 'react';
import { Shipment } from '../../../types';
import { ShipmentItem } from './ShipmentItem';

interface UnfolderedShipmentsProps {
  shipments: Shipment[];
  currentShipment: Shipment | null;
  folders: Array<{ id: string; name: string }>;
  onLoadShipment: (shipment: Shipment) => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
}

export const UnfolderedShipments: React.FC<UnfolderedShipmentsProps> = ({
  shipments,
  currentShipment,
  folders,
  onLoadShipment,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment
}) => {
  if (shipments.length === 0) return null;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Sin carpeta ({shipments.length})
      </div>
      {shipments.map((shipment, index) => (
        <ShipmentItem
          key={shipment.id}
          shipment={shipment}
          isActive={currentShipment?.id === shipment.id}
          timeAgo={formatTimeAgo(shipment.createdAt)}
          status={index === 0 ? 'Active' : 'Draft'}
          folders={folders}
          onLoadShipment={onLoadShipment}
          onRenameShipment={onRenameShipment}
          onMoveToFolder={onMoveToFolder}
          onArchiveShipment={onArchiveShipment}
          onDeleteShipment={onDeleteShipment}
        />
      ))}
    </div>
  );
};