import React, { useState } from 'react';
import { Shipment } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../auth/AuthProvider';
import type { User } from '@supabase/supabase-js';

// Import all the modular components
import { SidebarHeader } from './sidebar/SidebarHeader';
import { ActionButtons } from './sidebar/ActionButtons';
import { ShipmentsSection } from './sidebar/ShipmentsSection';
import { UserProfile } from './sidebar/UserProfile';
import { SearchModal } from './sidebar/SearchModal';

interface SidebarProps {
  user: User | null;
  subscriptionTier: string;
  savedShipments: Shipment[];
  currentShipment: Shipment | null;
  folders: Array<{ id: string; name: string }>;
  shipmentFolders: Record<string, string>;
  onCreateNewShipment: () => void;
  onLoadShipment: (shipment: Shipment) => void;
  onSettingsClick: () => void;
  onSignOut: () => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleSidebar: () => void;
}

const SidebarRefactored: React.FC<SidebarProps> = ({
  user,
  subscriptionTier,
  savedShipments,
  currentShipment,
  folders,
  shipmentFolders,
  onCreateNewShipment,
  onLoadShipment,
  onSettingsClick,
  onSignOut,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleSidebar
}) => {
  const { toggleSubscriptionTier } = useAppContext();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showSearchModal, setShowSearchModal] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleSearchShipments = () => {
    setShowSearchModal(true);
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <SidebarHeader onToggleSidebar={onToggleSidebar} />
        
        <ActionButtons 
          onCreateNewShipment={onCreateNewShipment}
          onSearchShipments={handleSearchShipments}
        />

        <ShipmentsSection
          savedShipments={savedShipments}
          currentShipment={currentShipment}
          folders={folders}
          shipmentFolders={shipmentFolders}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
          onLoadShipment={onLoadShipment}
          onRenameShipment={onRenameShipment}
          onMoveToFolder={onMoveToFolder}
          onArchiveShipment={onArchiveShipment}
          onDeleteShipment={onDeleteShipment}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />

        <UserProfile
          user={user}
          subscriptionTier={subscriptionTier}
          onSettingsClick={onSettingsClick}
          onSignOut={onSignOut}
          onToggleSubscriptionTier={toggleSubscriptionTier}
        />
      </div>

      <SearchModal
        isOpen={showSearchModal}
        savedShipments={savedShipments}
        folders={folders}
        onClose={() => setShowSearchModal(false)}
        onLoadShipment={onLoadShipment}
        onRenameShipment={onRenameShipment}
        onMoveToFolder={onMoveToFolder}
        onArchiveShipment={onArchiveShipment}
        onDeleteShipment={onDeleteShipment}
      />
    </>
  );
};

export default SidebarRefactored;