import React from 'react';
import { Menu } from 'lucide-react';
import { SidebarToggleProps } from './types';

export const SidebarToggle: React.FC<SidebarToggleProps> = ({ onToggleSidebar }) => {
  return (
    <button 
      onClick={onToggleSidebar}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
      title="Show sidebar"
    >
      <Menu className="h-6 w-6 text-gray-600" />
    </button>
  );
};