import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';

const MinimalHome: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentShipment, 
    createNewShipment, 
    addProduct,
    addContainer,
    subscriptionTier,
    featureLimits,
    config
  } = useAppContext();


  React.useEffect(() => {
    if (!currentShipment) {
      createNewShipment();
    }
  }, [currentShipment, createNewShipment]);

  if (!currentShipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Initializing the application</p>
        </div>
      </div>
    );
  }

  const handleAddProduct = () => {
    if (!featureLimits.canSaveShipments && currentShipment.products.length >= featureLimits.maxProductsPerShipment) {
      alert(`Free users can only add ${featureLimits.maxProductsPerShipment} products. Upgrade to Premium for unlimited products!`);
      return;
    }

    addProduct({
      name: `Product ${currentShipment.products.length + 1}`,
      height: 10,
      width: 10,
      length: 10,
      weight: 1,
      purchasePrice: 50,
      resalePrice: 100,
      daysToSell: 30,
      quantity: 1,
      isBoxed: false
    });
  };

  const handleAddContainer = () => {
    if (!featureLimits.canSaveShipments && currentShipment.containers.length >= featureLimits.maxContainersPerShipment) {
      alert(`Free users can only add ${featureLimits.maxContainersPerShipment} containers. Upgrade to Premium for unlimited containers!`);
      return;
    }

    addContainer({
      name: `Container ${currentShipment.containers.length + 1}`,
      height: 100,
      width: 100,
      length: 100,
      maxWeight: 1000,
      shippingCost: 500,
      shippingDuration: 14
    });
  };

  const totalValue = currentShipment.products.reduce((sum, p) => sum + (p.resalePrice * p.quantity), 0);
  const totalCost = currentShipment.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
  const profit = totalValue - totalCost;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📦 Logistics Investment Optimizer</h1>
              <p className="text-sm text-gray-600 mt-1">
                Subscription: <span className="font-medium text-blue-600">{subscriptionTier}</span>
                {subscriptionTier === 'free' && (
                  <span className="ml-2 text-orange-600">• Upgrade to unlock all features!</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Free Tier Banner */}
        {subscriptionTier === 'free' && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-xl font-bold mb-2">🚀 Upgrade to Premium</h2>
            <p className="mb-4">You're currently on the free plan. Upgrade to unlock unlimited shipments, advanced analytics, and more!</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue, config.currency)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCost, config.currency)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Profit</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(profit, config.currency)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Products</h3>
            <p className="text-2xl font-bold text-gray-900">{currentShipment.products.length}</p>
            <p className="text-xs text-gray-500">
              Max: {featureLimits.maxProductsPerShipment === -1 ? 'Unlimited' : featureLimits.maxProductsPerShipment}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <button
                  onClick={handleAddProduct}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  + Add Product
                </button>
              </div>
            </div>
            <div className="p-6">
              {currentShipment.products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products added yet</p>
              ) : (
                <div className="space-y-4">
                  {currentShipment.products.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded p-4">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Quantity: {product.quantity}</div>
                        <div>Buy: {formatCurrency(product.purchasePrice, config.currency)}</div>
                        <div>Sell: {formatCurrency(product.resalePrice, config.currency)}</div>
                        <div>Days to sell: {product.daysToSell}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Containers Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Containers</h2>
                <button
                  onClick={handleAddContainer}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  + Add Container
                </button>
              </div>
            </div>
            <div className="p-6">
              {currentShipment.containers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No containers added yet</p>
              ) : (
                <div className="space-y-4">
                  {currentShipment.containers.map((container) => (
                    <div key={container.id} className="border border-gray-200 rounded p-4">
                      <h3 className="font-medium text-gray-900">{container.name}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Dimensions: {container.length}×{container.width}×{container.height} cm</div>
                        <div>Max Weight: {container.maxWeight} kg</div>
                        <div>Shipping: {formatCurrency(container.shippingCost, config.currency)}</div>
                        <div>Duration: {container.shippingDuration} days</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Limits Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className={`flex items-center ${featureLimits.canSaveShipments ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.canSaveShipments ? '✅' : '❌'}</span>
              Save Shipments
            </div>
            <div className={`flex items-center ${featureLimits.hasDumpingPenalizer ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.hasDumpingPenalizer ? '✅' : '❌'}</span>
              Dumping Penalizer
            </div>
            <div className={`flex items-center ${featureLimits.hasMarketAnalysis ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.hasMarketAnalysis ? '✅' : '❌'}</span>
              Market Analysis
            </div>
            <div className={`flex items-center ${featureLimits.hasAiDimensions ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.hasAiDimensions ? '✅' : '❌'}</span>
              AI Dimensions
            </div>
            <div className={`flex items-center ${featureLimits.canExportData ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.canExportData ? '✅' : '❌'}</span>
              Export Data
            </div>
            <div className={`flex items-center ${featureLimits.hasApiIntegrations ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{featureLimits.hasApiIntegrations ? '✅' : '❌'}</span>
              API Integrations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalHome;