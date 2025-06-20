import React, { useState } from 'react';
import { Save, TrendingUp, DollarSign, Zap, Package, Edit2, Menu } from 'lucide-react';
import { Shipment, GlobalConfig } from '../../types';
import { calculateCompleteShipmentScore } from '../../utils/calculations';
import UpgradeModal from '../premium/UpgradeModal';
import EditShipmentModal from './EditShipmentModal';
import { useAuth } from '../auth/AuthProvider';

interface ShipmentHeaderProps {
  currentShipment: Shipment;
  config: GlobalConfig;
  dumpingPenalizerEnabled: boolean;
  subscriptionTier: string;
  sidebarVisible?: boolean;
  folders: Array<{ id: string; name: string }>;
  currentFolderId?: string;
  onUpdateShipment: (updates: {
    name?: string;
    description?: string;
    folderId?: string;
    shippingDate?: string;
  }) => void;
  onCurrencyChange: (currency: string) => void;
  onMeasurementChange: (measurement: string) => void;
  onSettingsClick: () => void;
  onSaveShipment: () => void;
  onToggleSidebar?: () => void;
}

const ShipmentHeader: React.FC<ShipmentHeaderProps> = ({
  currentShipment,
  config,
  dumpingPenalizerEnabled,
  subscriptionTier,
  sidebarVisible = true,
  folders,
  currentFolderId,
  onUpdateShipment,
  onCurrencyChange,
  onMeasurementChange,
  onSettingsClick,
  onSaveShipment,
  onToggleSidebar
}) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Calculate metrics
  const { score, dumpingCalculations } = calculateCompleteShipmentScore(currentShipment);
  
  // Calculate if we have any data
  const hasProducts = currentShipment.products.length > 0;
  const hasContainers = currentShipment.containers.length > 0;
  const hasData = hasProducts && hasContainers;

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
    // Allow dev account to save regardless of plan
    const isDev = user?.email === 'dev@example.com';
    
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
          <button 
            onClick={onToggleSidebar}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Show sidebar"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        )}
        {/* New Shipment Card */}
        <div className="bg-slate-800 rounded-xl p-6 min-w-[280px]">
          <div className="flex items-center group mb-2">
            <h2 
              className="text-white text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors truncate max-w-[200px]"
              onClick={handleEditClick}
              title={`${currentShipment.name} (Click to edit)`}
            >
              {currentShipment.name}
            </h2>
            <button
              onClick={handleEditClick}
              className="ml-2 text-slate-400 hover:text-blue-200 transition-colors"
              title="Edit shipment"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-slate-300 text-sm mb-6">Ready to optimize.</p>
          <button 
            onClick={handleSaveClick}
            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="flex-1 grid grid-cols-4 gap-4">
          {/* Score Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">SCORE</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {hasData ? score.rawScore.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500">
              {hasData ? 'Calculated' : 'Awaiting data'}
            </div>
          </div>

          {/* Profit Margin Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">PROFIT MARGIN</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {hasData ? `${(score.profitMargin * 100).toFixed(1)}%` : '--%'}
            </div>
            <div className="text-sm text-gray-500">
              {hasData ? `$${score.totalResale.toFixed(2)} estimated` : '$0.00 estimated'}
            </div>
          </div>

          {/* Efficiency Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <Zap className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">EFFICIENCY</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {hasData ? score.efficiencyScore.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500">
              Based on turnover
            </div>
          </div>

          {/* Space Utilized Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <Package className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">SPACE UTILIZED</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {hasData ? `${(score.volumeUtilization * 100).toFixed(0)}%` : '--%'}
            </div>
            <div className="text-sm text-gray-500">
              Container efficiency
            </div>
          </div>
        </div>
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

export default ShipmentHeader;