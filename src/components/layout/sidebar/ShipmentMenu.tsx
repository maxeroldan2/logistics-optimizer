import React, { useState } from 'react';
import { Edit, Folder, Archive, Trash2 } from 'lucide-react';

interface ShipmentMenuProps {
  shipmentId: string;
  shipmentName: string;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
  onMoveToFolder: (id: string, folderId: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  folders: Array<{ id: string; name: string }>;
}

export const ShipmentMenu: React.FC<ShipmentMenuProps> = ({
  shipmentId,
  shipmentName,
  isOpen,
  onClose,
  onRename,
  onMoveToFolder,
  onArchive,
  onDelete,
  folders
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [newName, setNewName] = useState(shipmentName);

  if (!isOpen) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== shipmentName) {
      onRename(shipmentId, newName.trim());
    }
    setShowRenameInput(false);
    onClose();
  };

  const handleMoveToFolder = (folderId: string) => {
    onMoveToFolder(shipmentId, folderId);
    setShowFolderSelect(false);
    onClose();
  };

  const handleArchive = () => {
    onArchive(shipmentId);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este envío?')) {
      onDelete(shipmentId);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
        {showRenameInput ? (
          <div className="px-3 py-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setShowRenameInput(false);
                  setNewName(shipmentName);
                }
              }}
              onBlur={handleRename}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : showFolderSelect ? (
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Move to folder:</div>
            <div className="space-y-1">
              <button
                onClick={() => handleMoveToFolder('')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                📁 No folder
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveToFolder(folder.id)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  📁 {folder.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFolderSelect(false)}
              className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded mt-2"
            >
              ← Back
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowRenameInput(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Edit className="h-4 w-4 mr-3" />
              Cambiar el nombre
            </button>
            
            <button
              onClick={() => setShowFolderSelect(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Folder className="h-4 w-4 mr-3" />
              Añadir al folder
            </button>
            
            <button
              onClick={handleArchive}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Archive className="h-4 w-4 mr-3" />
              Archivar
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Eliminar
            </button>
          </>
        )}
      </div>
    </>
  );
};