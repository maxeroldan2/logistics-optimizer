import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useAppContext } from '../context/AppContext';

const SimpleHome: React.FC = () => {
  const { user } = useAuth();
  const { subscriptionTier, featureLimits } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🚢 Logistics Investment Optimizer
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            Your app is running successfully with the new freemium features.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">User Info</h3>
              <p className="text-sm text-gray-600">Email: {user?.email}</p>
              <p className="text-sm text-gray-600">User ID: {user?.id}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Subscription</h3>
              <p className="text-sm text-gray-600">Tier: {subscriptionTier}</p>
              <p className="text-sm text-gray-600">
                Max Shipments: {featureLimits.maxShipments === -1 ? 'Unlimited' : featureLimits.maxShipments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Limits</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>✅ Can Save Shipments: {featureLimits.canSaveShipments ? 'Yes' : 'No'}</p>
              <p>✅ Can Export Data: {featureLimits.canExportData ? 'Yes' : 'No'}</p>
              <p>✅ Has Market Analysis: {featureLimits.hasMarketAnalysis ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p>✅ Has Dumping Penalizer: {featureLimits.hasDumpingPenalizer ? 'Yes' : 'No'}</p>
              <p>✅ Has AI Dimensions: {featureLimits.hasAiDimensions ? 'Yes' : 'No'}</p>
              <p>✅ Has API Integrations: {featureLimits.hasApiIntegrations ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            🎉 All freemium features are working! The basic app structure is solid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;