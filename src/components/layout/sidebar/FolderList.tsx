import React, { useState } from 'react';
import { Folder, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { Shipment } from '../../../types';
import { ShipmentItem } from './ShipmentItem';
import { FolderMenu } from './FolderMenu';

interface FolderListProps {
  folders: Array<{ id: string; name: string }>;
  groupedShipments: Record<string, Shipment[]>;
  currentShipment: Shipment | null;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onLoadShipment: (shipment: Shipment) => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  groupedShipments,
  currentShipment,
  expandedFolders,
  onToggleFolder,
  onLoadShipment,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);

  const handleStartEditingFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
    setOpenFolderMenuId(null);
  };

  const handleSaveFolderEdit = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onRenameFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleCancelFolderEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta carpeta? Los envíos se moverán a "Sin carpeta".')) {
      onDeleteFolder(folderId);
      setOpenFolderMenuId(null);
    }
  };

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
    <>
      {folders.map(folder => {
        const folderShipments = groupedShipments[folder.id] || [];
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id} className="space-y-2">
            {editingFolderId === folder.id ? (
              <div className="bg-gray-50 p-2 rounded">
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveFolderEdit();
                    if (e.key === 'Escape') handleCancelFolderEdit();
                  }}
                  onBlur={handleSaveFolderEdit}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <div className="relative">
                <div className="w-full flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors group">
                  <button
                    onClick={() => onToggleFolder(folder.id)}
                    className="flex items-center flex-1"
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    {folder.name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({folderShipments.length})
                    </span>
                    {folderShipments.length > 0 && (
                      <span className="ml-1">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </div>

                <FolderMenu
                  folderId={folder.id}
                  folderName={folder.name}
                  isOpen={openFolderMenuId === folder.id}
                  onClose={() => setOpenFolderMenuId(null)}
                  onEdit={handleStartEditingFolder}
                  onDelete={handleDeleteFolder}
                />
              </div>
            )}
            
            {isExpanded && folderShipments.map((shipment) => (
              <div key={shipment.id} className="ml-4">
                <ShipmentItem
                  shipment={shipment}
                  isActive={currentShipment?.id === shipment.id}
                  timeAgo={formatTimeAgo(shipment.createdAt)}
                  status="Draft"
                  folders={folders}
                  onLoadShipment={onLoadShipment}
                  onRenameShipment={onRenameShipment}
                  onMoveToFolder={onMoveToFolder}
                  onArchiveShipment={onArchiveShipment}
                  onDeleteShipment={onDeleteShipment}
                />
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};