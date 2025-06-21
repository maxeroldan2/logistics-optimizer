import React from 'react';
import { Plus } from 'lucide-react';

interface ContainerActionsProps {
  onAddContainer: () => void;
}

export const ContainerActions: React.FC<ContainerActionsProps> = ({
  onAddContainer
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Containers</h2>
      <button
        onClick={onAddContainer}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Container
      </button>
    </div>
  );
};