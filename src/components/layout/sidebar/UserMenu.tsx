import React from 'react';
import {
  Settings,
  Crown,
  HelpCircle,
  FileText,
  LogOut
} from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePlan: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onTOS: () => void;
  onSignOut: () => void;
  subscriptionTier: string;
  onToggleSubscriptionTier: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isOpen,
  onClose,
  onUpgradePlan,
  onSettings,
  onHelp,
  onTOS,
  onSignOut,
  subscriptionTier,
  onToggleSubscriptionTier
}) => {
  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
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
      <div className="absolute right-0 bottom-8 z-50 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1">
        {/* Development Mode Toggle */}
        {import.meta.env.DEV && (
          <>
            <button
              onClick={() => handleAction(onToggleSubscriptionTier)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center bg-yellow-50 border-b border-yellow-200"
            >
              <span className="h-4 w-4 mr-3 text-lg">🔄</span>
              Dev: Switch to {subscriptionTier === 'free' ? 'Premium' : 'Free'}
            </button>
            <div className="border-b border-gray-200 my-1"></div>
          </>
        )}
        
        <button
          onClick={() => handleAction(onUpgradePlan)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Crown className="h-4 w-4 mr-3 text-yellow-500" />
          Mejorar plan
        </button>
        
        <button
          onClick={() => handleAction(onSettings)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Settings className="h-4 w-4 mr-3" />
          Configuración
        </button>
        
        <button
          onClick={() => handleAction(onHelp)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & FAQ
        </button>
        
        <button
          onClick={() => handleAction(onTOS)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <FileText className="h-4 w-4 mr-3" />
          Términos y políticas
        </button>
        
        <hr className="my-1" />
        
        <button
          onClick={() => handleAction(onSignOut)}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
};