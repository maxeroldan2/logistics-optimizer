import { Shipment, GlobalConfig } from '../../../types';

export interface ShipmentHeaderProps {
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

export interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  iconColor: string;
}

export interface ShipmentActionCardProps {
  currentShipment: Shipment;
  subscriptionTier: string;
  onEditClick: () => void;
  onSaveClick: () => void;
}

export interface SidebarToggleProps {
  onToggleSidebar: () => void;
}

export interface MetricsGridProps {
  currentShipment: Shipment;
}