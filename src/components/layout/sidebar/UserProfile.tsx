import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { UserMenu } from './UserMenu';

interface UserProfileProps {
  user: User | null;
  subscriptionTier: string;
  onSettingsClick: () => void;
  onSignOut: () => void;
  onToggleSubscriptionTier: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  subscriptionTier,
  onSettingsClick,
  onSignOut,
  onToggleSubscriptionTier
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUpgradePlan = () => {
    console.log('Upgrade plan clicked');
  };

  const handleHelp = () => {
    console.log('Help & FAQ clicked');
  };

  const handleTOS = () => {
    console.log('Terms & Policies clicked');
  };

  return (
    <div className="p-4 border-t border-gray-200 mt-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900">
              {user?.email || 'User'}
            </p>
            <p className={`text-xs font-medium ${
              subscriptionTier === 'premium' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {subscriptionTier === 'premium' ? 'Premium Plan' : 'Free Plan'}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          <UserMenu
            isOpen={showUserMenu}
            onClose={() => setShowUserMenu(false)}
            onUpgradePlan={handleUpgradePlan}
            onSettings={onSettingsClick}
            onHelp={handleHelp}
            onTOS={handleTOS}
            onSignOut={onSignOut}
            subscriptionTier={subscriptionTier}
            onToggleSubscriptionTier={onToggleSubscriptionTier}
          />
        </div>
      </div>
    </div>
  );
};