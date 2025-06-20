import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { Shipment } from '../../types';

interface EditShipmentModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  folders: Array<{ id: string; name: string }>;
  currentFolderId?: string;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    description?: string;
    folderId?: string;
    shippingDate?: string;
  }) => void;
}

const EditShipmentModal: React.FC<EditShipmentModalProps> = ({
  isOpen,
  shipment,
  folders,
  currentFolderId,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [shippingDate, setShippingDate] = useState('');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  useEffect(() => {
    if (isOpen && shipment) {
      setName(shipment.name);
      setDescription(shipment.description || '');
      setSelectedFolderId(currentFolderId || '');
      setShippingDate(shipment.shippingDate || '');
    }
  }, [isOpen, shipment, currentFolderId]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      folderId: selectedFolderId || undefined,
      shippingDate: shippingDate || undefined
    });

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Shipment</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shipment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Enter shipment name"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Add any relevant notes about this shipment..."
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Row for Folder and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Folder/Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder / Tag
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex items-center justify-between bg-white"
                >
                  <span className="text-gray-900">
                    {selectedFolder ? selectedFolder.name : 'Unsorted'}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {showFolderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolderId('');
                        setShowFolderDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                    >
                      Unsorted
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setShowFolderDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Backdrop click handler */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={handleCancel}
      />
    </div>
  );
};

export default EditShipmentModal;