import React, { useState } from 'react';

interface NewFolderInputProps {
  isVisible: boolean;
  onCreateFolder: (name: string) => void;
  onCancel: () => void;
}

export const NewFolderInput: React.FC<NewFolderInputProps> = ({
  isVisible,
  onCreateFolder,
  onCancel
}) => {
  const [folderName, setFolderName] = useState('');

  if (!isVisible) return null;

  const handleSubmit = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
      setFolderName('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setFolderName('');
  };

  return (
    <div className="mb-3 p-2 bg-gray-50 rounded">
      <input
        type="text"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Folder name"
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        autoFocus
      />
      <div className="flex gap-1">
        <button
          onClick={handleSubmit}
          disabled={!folderName.trim()}
          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};