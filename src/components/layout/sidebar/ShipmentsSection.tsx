import React, { useState, useMemo } from 'react';
import { FolderPlus } from 'lucide-react';
import { Shipment } from '../../../types';
import { FolderList } from './FolderList';
import { NewFolderInput } from './NewFolderInput';
import { UnfolderedShipments } from './UnfolderedShipments';

interface ShipmentsSectionProps {
  savedShipments: Shipment[];
  currentShipment: Shipment | null;
  folders: Array<{ id: string; name: string }>;
  shipmentFolders: Record<string, string>;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onLoadShipment: (shipment: Shipment) => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const ShipmentsSection: React.FC<ShipmentsSectionProps> = ({
  savedShipments,
  currentShipment,
  folders,
  shipmentFolders,
  expandedFolders,
  onToggleFolder,
  onLoadShipment,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // Group shipments by folder
  const groupedShipments = useMemo(() => {
    const groups: Record<string, Shipment[]> = {
      '': [] // No folder
    };
    
    folders.forEach(folder => {
      groups[folder.id] = [];
    });

    savedShipments.forEach(shipment => {
      const folderId = shipment.folderId || shipmentFolders[shipment.id] || '';
      if (!groups[folderId]) {
        groups[folderId] = [];
      }
      groups[folderId].push(shipment);
    });

    return groups;
  }, [savedShipments, shipmentFolders, folders]);

  const handleCreateFolder = (name: string) => {
    onCreateFolder(name);
    setShowNewFolderInput(false);
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">SAVED SHIPMENTS</h3>
        <button
          onClick={() => setShowNewFolderInput(true)}
          className="text-gray-400 hover:text-gray-600"
          title="Create new folder"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      <NewFolderInput
        isVisible={showNewFolderInput}
        onCreateFolder={handleCreateFolder}
        onCancel={() => setShowNewFolderInput(false)}
      />

      <div className="space-y-4">
        <FolderList
          folders={folders}
          groupedShipments={groupedShipments}
          currentShipment={currentShipment}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onLoadShipment={onLoadShipment}
          onRenameShipment={onRenameShipment}
          onMoveToFolder={onMoveToFolder}
          onArchiveShipment={onArchiveShipment}
          onDeleteShipment={onDeleteShipment}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />

        <UnfolderedShipments
          shipments={groupedShipments['']}
          currentShipment={currentShipment}
          folders={folders}
          onLoadShipment={onLoadShipment}
          onRenameShipment={onRenameShipment}
          onMoveToFolder={onMoveToFolder}
          onArchiveShipment={onArchiveShipment}
          onDeleteShipment={onDeleteShipment}
        />
      </div>
    </div>
  );
};