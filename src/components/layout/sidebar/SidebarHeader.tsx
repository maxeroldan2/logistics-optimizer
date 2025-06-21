import React from 'react';
import { Package, Menu } from 'lucide-react';

interface SidebarHeaderProps {
  onToggleSidebar: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-lg font-bold text-gray-900">
            Logistics Optimizer
          </span>
        </div>
        <button 
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          title="Hide sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};