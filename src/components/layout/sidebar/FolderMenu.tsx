import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface FolderMenuProps {
  folderId: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const FolderMenu: React.FC<FolderMenuProps> = ({
  folderId,
  folderName,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit(folderId, folderName);
    onClose();
  };

  const handleDelete = () => {
    onDelete(folderId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-6 z-50 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1">
        <button
          onClick={handleEdit}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Edit2 className="h-4 w-4 mr-3" />
          Rename
        </button>
        
        <button
          onClick={handleDelete}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-3" />
          Delete
        </button>
      </div>
    </>
  );
};