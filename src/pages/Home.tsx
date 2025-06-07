import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/forms/ProductForm';
import ContainerForm from '../components/forms/ContainerForm';
import { calculateShipmentScore, calculateProductScore, formatCurrency, formatPercentage } from '../utils/calculations';
import GlobalSettings from '../components/config/GlobalSettings';
import { Settings, Plus, Package, Container, Edit2, Trash2, Filter, TrendingUp, DollarSign, Clock, BarChart3, Save, Zap, Brain, Target, Star } from 'lucide-react';
import ContainerDropZone from '../components/containers/ContainerDropZone';
import DraggableProduct from '../components/products/DraggableProduct';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentShipment, 
    savedShipments,
    createNewShipment, 
    saveCurrentShipment,
    loadShipment,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    config,
    // Premium features now available to all
    dumpingPenalizerEnabled,
    toggleDumpingPenalizer,
    aiDimensionsEnabled,
    toggleAiDimensions,
    marketAnalysisEnabled,
    toggleMarketAnalysis
  } = useAppContext();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showNewContainerForm, setShowNewContainerForm] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingContainer, setEditingContainer] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (!currentShipment) {
      createNewShipment();
    }
  }, [currentShipment, createNewShipment]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveShipment = async () => {
    await saveCurrentShipment();
    // Show success message or toast
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };
  
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
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const productId = active.id as string;
      const containerId = over.id as string;
      
      updateProduct(productId, { containerId });
    }
  };
  
  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
    setSelectedProduct(productId);
  };

  const handleDuplicateProduct = (product: Product) => {
    const { id, ...productWithoutId } = product;
    addProduct(productWithoutId);
  };

  const handleEditContainer = (container: Container) => {
    setEditingContainer(container.id);
  };
  
  const productBeingEdited = editingProduct 
    ? currentShipment.products.find(p => p.id === editingProduct)
    : undefined;

  const containerBeingEdited = editingContainer
    ? currentShipment.containers.find(c => c.id === editingContainer)
    : undefined;
  
  const shipmentScore = calculateShipmentScore(currentShipment.products, currentShipment.containers);
  
  const hasContainers = currentShipment.containers.length > 0;
  const hasProducts = currentShipment.products.length > 0;

  // Calculate metrics for dashboard
  const totalProfit = currentShipment.products.reduce((sum, product) => 
    sum + ((product.resalePrice - product.purchasePrice) * product.quantity), 0
  );
  
  const averageTurnover = currentShipment.products.length > 0 
    ? currentShipment.products.reduce((sum, product) => sum + product.daysToSell, 0) / currentShipment.products.length
    : 0;

  // Apply dumping penalizer if enabled
  const adjustedScore = dumpingPenalizerEnabled 
    ? shipmentScore.rawScore * 0.85 // 15% penalty for market saturation
    : shipmentScore.rawScore;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo and User */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">Logistics Optimizer</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">John Smith</p>
                <p className="text-xs text-green-600 font-medium">Premium Plan</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* New Shipment Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewShipment}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </button>
        </div>

        {/* Saved Shipments */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">SAVED SHIPMENTS</h3>
          <div className="space-y-2">
            {savedShipments.map((shipment, index) => (
              <div 
                key={shipment.id}
                onClick={() => loadShipment(shipment)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  currentShipment?.id === shipment.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{shipment.name}</p>
                    <p className={`text-xs ${
                      index === 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {index === 0 ? 'Active' : 'Draft'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(shipment.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Tools */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            Premium Tools
          </h3>
          <div className="space-y-2">
            <button
              onClick={toggleDumpingPenalizer}
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                dumpingPenalizerEnabled 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Dumping Penalizer
              </div>
            </button>
            
            <button
              onClick={toggleAiDimensions}
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                aiDimensionsEnabled 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Dimensions
              </div>
            </button>
            
            <button
              onClick={toggleMarketAnalysis}
              className={`w-full text-left py-2 px-3 rounded text-sm transition-colors ${
                marketAnalysisEnabled 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Analysis
              </div>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full text-left text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">{currentShipment.name}</h1>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                {dumpingPenalizerEnabled && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Target className="h-3 w-3 mr-1" />
                    Dumping Penalty
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <select 
                  value={config.currency}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <select 
                  value={config.measurement}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleSaveShipment}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Score</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-gray-900">{adjustedScore.toFixed(1)}</span>
                  <span className="ml-2 text-sm text-green-600">↑ 12% higher than average</span>
                  {dumpingPenalizerEnabled && (
                    <div className="text-xs text-orange-600 mt-1">
                      Market saturation penalty applied
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Profit Margin</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-gray-900">{formatPercentage(shipmentScore.profitMargin)}</span>
                  <span className="ml-2 text-sm text-green-600">↑ {formatCurrency(totalProfit, config.currency)} estimated profit</span>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-600">Efficiency Score</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-gray-900">{shipmentScore.efficiencyScore.toFixed(1)}</span>
                  <span className="ml-2 text-sm text-blue-600">Based on {averageTurnover.toFixed(0)} days turnover</span>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm text-gray-600">Space Utilized</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-gray-900">{formatPercentage(shipmentScore.volumeUtilization)}</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${shipmentScore.volumeUtilization * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Containers Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Containers</h2>
                    <button
                      onClick={() => setShowNewContainerForm(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Container
                    </button>
                  </div>

                  {showNewContainerForm && (
                    <div className="mb-6">
                      <ContainerForm
                        isOpen={true}
                        onAddContainer={container => {
                          addContainer(container);
                          setShowNewContainerForm(false);
                        }}
                        onCancel={() => setShowNewContainerForm(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {currentShipment.containers.map(container => (
                      <div key={container.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{container.name}</h3>
                            <p className="text-sm text-blue-600">Primary</p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditContainer(container)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeContainer(container.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dimensions:</span>
                            <p className="font-medium">{container.length} × {container.width} × {container.height} cm</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Max Weight:</span>
                            <p className="font-medium">{container.maxWeight} kg</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Shipping Cost:</span>
                            <p className="font-medium">{formatCurrency(container.shippingCost, config.currency)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Estimated Time:</span>
                            <p className="font-medium">{container.shippingDuration || 0} days</p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Volume: 75% used</span>
                            <span className="text-gray-600">Weight: 68% used</span>
                          </div>
                        </div>

                        {/* Container Assignment Area */}
                        <ContainerDropZone
                          container={container}
                          products={currentShipment.products}
                          onEdit={handleEditContainer}
                          onDelete={removeContainer}
                        />
                      </div>
                    ))}
                  </div>

                  {containerBeingEdited && (
                    <div className="mt-4">
                      <ContainerForm
                        container={containerBeingEdited}
                        isOpen={true}
                        onUpdateContainer={updates => {
                          updateContainer(containerBeingEdited.id, updates);
                          setEditingContainer(null);
                        }}
                        onCancel={() => setEditingContainer(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Products Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center text-gray-600 hover:text-gray-900 text-sm">
                        <Filter className="h-4 w-4 mr-1" />
                        Filter
                      </button>
                      <button
                        onClick={() => setShowNewProductForm(true)}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Product
                      </button>
                    </div>
                  </div>

                  {showNewProductForm && (
                    <div className="mb-6">
                      <ProductForm
                        isOpen={true}
                        onAddProduct={product => {
                          addProduct(product);
                          setShowNewProductForm(false);
                        }}
                        onClose={() => setShowNewProductForm(false)}
                      />
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2">PRODUCT</div>
                        <div>DIMENSIONS</div>
                        <div>QTY</div>
                        <div>BUY PRICE</div>
                        <div>SELL PRICE</div>
                        <div>SCO</div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {currentShipment.products.map(product => {
                        const score = calculateProductScore(product);
                        return (
                          <div key={product.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs text-gray-500">
                                    {product.height} × {product.width} × {product.length} cm
                                  </p>
                                  {aiDimensionsEnabled && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      <Brain className="h-3 w-3 mr-1" />
                                      AI
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-900">
                                {product.height} × {product.width} × {product.length} cm
                              </div>
                              <div className="text-sm text-gray-900">{product.quantity}</div>
                              <div className="text-sm text-gray-900">
                                {formatCurrency(product.purchasePrice, config.currency)}
                              </div>
                              <div className="text-sm text-gray-900">
                                {formatCurrency(product.resalePrice, config.currency)}
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {score.rawScore.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {editingProduct && (
                    <div className="mt-4">
                      <ProductForm 
                        product={productBeingEdited}
                        isOpen={true}
                        onUpdateProduct={(id, updates) => {
                          updateProduct(id, updates);
                          setEditingProduct(null);
                        }}
                        onClose={() => setEditingProduct(null)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Container Assignment Section */}
              {hasContainers && hasProducts && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Container Assignment (Drag & Drop)</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {currentShipment.containers.map(container => (
                      <div key={container.id} className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{container.name}</h3>
                        <div className="space-y-2 min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-3">
                          {currentShipment.products
                            .filter(p => p.containerId === container.id)
                            .map(product => (
                              <div key={product.id} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {product.name} ({product.quantity})
                              </div>
                            ))}
                          {currentShipment.products.filter(p => p.containerId === container.id).length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-8">
                              Drag products here
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Analysis Section */}
              {marketAnalysisEnabled && hasProducts && (
                <div className="mt-8">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                      Market Analysis
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">High</div>
                        <div className="text-sm text-gray-600">Demand Level</div>
                        <div className="text-xs text-gray-500 mt-1">Based on 40+ market presets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">Medium</div>
                        <div className="text-sm text-gray-600">Competition</div>
                        <div className="text-xs text-gray-500 mt-1">Moderate market saturation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">Optimal</div>
                        <div className="text-sm text-gray-600">Timing</div>
                        <div className="text-xs text-gray-500 mt-1">Best season for these products</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DndContext>

      <GlobalSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Home;