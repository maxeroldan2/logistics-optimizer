import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import UpgradeModal from '../../premium/UpgradeModal';
import EditShipmentModal from '../EditShipmentModal';
import { SidebarToggle } from './SidebarToggle';
import { ShipmentActionCard } from './ShipmentActionCard';
import { MetricsGrid } from './MetricsGrid';
import { ShipmentHeaderProps } from './types';

export const ShipmentHeaderRefactored: React.FC<ShipmentHeaderProps> = ({
  currentShipment,
  config: _config, // eslint-disable-line @typescript-eslint/no-unused-vars
  dumpingPenalizerEnabled: _dumpingPenalizerEnabled, // eslint-disable-line @typescript-eslint/no-unused-vars
  subscriptionTier,
  sidebarVisible = true,
  folders,
  currentFolderId,
  onUpdateShipment,
  onCurrencyChange: _onCurrencyChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  onMeasurementChange: _onMeasurementChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSettingsClick,
  onSaveShipment,
  onToggleSidebar
}) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditSave = (updates: {
    name: string;
    description?: string;
    folderId?: string;
    shippingDate?: string;
  }) => {
    onUpdateShipment(updates);
    setShowEditModal(false);
  };

  const handleSaveClick = () => {
    // Allow dev and demo accounts to save regardless of plan
    const isDev = user?.email === 'dev@example.com' || user?.email === 'demo@example.com';
    
    if (subscriptionTier === 'free' && !isDev) {
      setShowUpgradeModal(true);
    } else {
      onSaveShipment();
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    onSettingsClick(); // This opens the settings which could have upgrade options
  };
  
  return (
    <div className="bg-gray-50 px-6 py-6">
      <div className="flex items-stretch gap-6">
        {/* Show Sidebar Button (when sidebar is hidden) */}
        {!sidebarVisible && onToggleSidebar && (
          <SidebarToggle onToggleSidebar={onToggleSidebar} />
        )}

        {/* Shipment Action Card */}
        <ShipmentActionCard
          currentShipment={currentShipment}
          subscriptionTier={subscriptionTier}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
        />

        {/* Metrics Grid */}
        <MetricsGrid currentShipment={currentShipment} />
      </div>

      {/* Edit Shipment Modal */}
      <EditShipmentModal
        isOpen={showEditModal}
        shipment={currentShipment}
        folders={folders}
        currentFolderId={currentFolderId}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        feature="Save & Compare Multiple Shipments"
      />
    </div>
  );
};