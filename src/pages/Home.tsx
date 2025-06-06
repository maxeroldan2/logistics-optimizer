import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/forms/ProductForm';
import ProductList from '../components/products/ProductList';
import ContainerForm from '../components/forms/ContainerForm';
import ScoreCard from '../components/common/ScoreCard';
import { calculateShipmentScore, calculateProductScore } from '../utils/calculations';
import GlobalSettings from '../components/config/GlobalSettings';
import { Settings, Plus, Package, Container } from 'lucide-react';
import PremiumBanner from '../components/premium/PremiumBanner';
import PremiumFeatures from '../components/premium/PremiumFeatures';
import ContainerDropZone from '../components/containers/ContainerDropZone';
import DraggableProduct from '../components/products/DraggableProduct';

const Home: React.FC = () => {
  const { 
    currentShipment, 
    createNewShipment, 
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    isPremiumUser
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
  
  const selectedProductData = selectedProduct 
    ? currentShipment.products.find(p => p.id === selectedProduct)
    : null;

  const selectedProductScore = selectedProductData 
    ? calculateProductScore(selectedProductData)
    : null;

  const hasContainers = currentShipment.containers.length > 0;
  const hasProducts = currentShipment.products.length > 0;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <DndContext onDragEnd={handleDragEnd}>
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            <div className="lg:w-2/3 space-y-6">
              <PremiumBanner />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentShipment.name}
                  </h2>
                  
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Starting State - No containers or products */}
                {!hasContainers && !hasProducts && (
                  <div className="space-y-8">
                    <div className="text-center py-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        Welcome to Logistics Investment Optimizer
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Start by adding containers and products to optimize your shipment profitability. 
                        Our intelligent system will help you maximize space utilization and profit margins.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Add Container Card */}
                      <div className="group">
                        <div 
                          onClick={() => setShowNewContainerForm(true)}
                          className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-400 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 cursor-pointer"
                        >
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Container className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Add Container
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Choose from maritime, air, or personal containers. 
                              Use our templates or create custom specifications.
                            </p>
                            <div className="inline-flex items-center text-blue-600 font-medium">
                              <Plus className="h-4 w-4 mr-1" />
                              Get Started
                            </div>
                          </div>
                          
                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 opacity-20">
                            <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                          </div>
                          <div className="absolute bottom-4 left-4 opacity-20">
                            <div className="w-6 h-6 bg-indigo-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Add Product Card */}
                      <div className="group">
                        <div 
                          onClick={() => setShowNewProductForm(true)}
                          className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-dashed border-green-300 rounded-xl p-8 hover:border-green-400 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 cursor-pointer"
                        >
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Package className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Add Product
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Add products with dimensions, pricing, and turnover data. 
                              Choose from templates or enter custom details.
                            </p>
                            <div className="inline-flex items-center text-green-600 font-medium">
                              <Plus className="h-4 w-4 mr-1" />
                              Get Started
                            </div>
                          </div>
                          
                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 opacity-20">
                            <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="absolute bottom-4 left-4 opacity-20">
                            <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        💡 Quick Tips to Get Started
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-blue-600 font-bold text-xs">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Start with Containers</p>
                            <p className="text-gray-600">Choose the right container size for your shipping method</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-green-600 font-bold text-xs">2</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Add Products</p>
                            <p className="text-gray-600">Include accurate dimensions and pricing for best results</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-purple-600 font-bold text-xs">3</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Optimize</p>
                            <p className="text-gray-600">Drag products to containers and see optimization scores</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing content when there are containers or products */}
                {(hasContainers || hasProducts) && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Containers
                        </h3>
                        <button
                          onClick={() => setShowNewContainerForm(true)}
                          className="flex items-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Container
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentShipment.containers.map(container => (
                          <ContainerDropZone
                            key={container.id}
                            container={container}
                            products={currentShipment.products}
                            onEdit={handleEditContainer}
                            onDelete={removeContainer}
                          />
                        ))}
                      </div>
                      
                      {(showNewContainerForm || containerBeingEdited) && (
                        <div className="mt-4">
                          <ContainerForm
                            container={containerBeingEdited}
                            onAddContainer={container => {
                              addContainer(container);
                              setShowNewContainerForm(false);
                            }}
                            onUpdateContainer={updates => {
                              if (containerBeingEdited) {
                                updateContainer(containerBeingEdited.id, updates);
                                setEditingContainer(null);
                              }
                            }}
                            onCancel={() => {
                              setShowNewContainerForm(false);
                              setEditingContainer(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Products
                        </h3>
                        <button
                          onClick={() => setShowNewProductForm(true)}
                          className="flex items-center text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Product
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {currentShipment.products.map(product => (
                          <DraggableProduct 
                            key={product.id} 
                            product={product} 
                            onEdit={handleEditProduct}
                            onDuplicate={handleDuplicateProduct}
                            onDelete={removeProduct}
                          />
                        ))}
                      </div>
                      
                      {(showNewProductForm || editingProduct) && (
                        <div className="mt-4">
                          {editingProduct ? (
                            <ProductForm 
                              product={productBeingEdited}
                              onUpdateProduct={(id, updates) => {
                                updateProduct(id, updates);
                                setEditingProduct(null);
                              }}
                              onClose={() => setEditingProduct(null)}
                            />
                          ) : (
                            <ProductForm 
                              onAddProduct={product => {
                                addProduct(product);
                                setShowNewProductForm(false);
                              }}
                              onClose={() => setShowNewProductForm(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <PremiumFeatures />
            </div>
            
            <div className="lg:w-1/3 space-y-6 mt-6 lg:mt-0">
              {(hasContainers || hasProducts) && (
                <>
                  <ScoreCard 
                    score={shipmentScore}
                    title="Shipment Score"
                    description="The main optimization score based on profit per volume."
                    isPrimary={true}
                  />

                  {selectedProductScore && selectedProductData && (
                    <ScoreCard 
                      score={{
                        rawScore: selectedProductScore.rawScore,
                        efficiencyScore: selectedProductScore.efficiencyScore,
                        totalCost: selectedProductData.purchasePrice * selectedProductData.quantity,
                        totalResale: selectedProductData.resalePrice * selectedProductData.quantity,
                        profitMargin: (selectedProductData.resalePrice - selectedProductData.purchasePrice) / 
                                    selectedProductData.purchasePrice,
                        volumeUtilization: selectedProductScore.volume / 
                          (Math.max(...currentShipment.products.map(p => calculateProductScore(p).volume))),
                        weightUtilization: selectedProductData.weight / 
                          Math.max(...currentShipment.products.map(p => p.weight))
                      }}
                      title="Product Score"
                      description="Individual product optimization score based on profit per volume and turnover time."
                      isPrimary={false}
                    />
                  )}
                </>
              )}
              
              {hasProducts ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Optimization Tips
                  </h3>
                  
                  <ul className="space-y-2 text-sm">
                    {shipmentScore.volumeUtilization < 0.7 && (
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <span className="text-yellow-600 text-xs">!</span>
                        </span>
                        <span className="text-gray-600">
                          Container is {Math.round(shipmentScore.volumeUtilization * 100)}% full. 
                          Consider adding more products or using a smaller container.
                        </span>
                      </li>
                    )}
                    
                    {shipmentScore.profitMargin < 0.3 && (
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <span className="text-red-600 text-xs">!</span>
                        </span>
                        <span className="text-gray-600">
                          Profit margin is low. Consider higher-value products or negotiating 
                          better purchase prices.
                        </span>
                      </li>
                    )}
                    
                    {currentShipment.products.some(p => p.daysToSell > 14) && (
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                          <span className="text-orange-600 text-xs">!</span>
                        </span>
                        <span className="text-gray-600">
                          Some products have a slow turnover rate. This may tie up capital for longer.
                        </span>
                      </li>
                    )}
                    
                    {isPremiumUser && (
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <span className="text-blue-600 text-xs">i</span>
                        </span>
                        <span className="text-gray-600">
                          Try the Dumping Penalizer to see how market saturation affects your profits.
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Optimize
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Add containers and products to see optimization tips, calculations, and profit analysis.
                  </p>
                </div>
              )}
              
              {isPremiumUser && (
                <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-yellow-500">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="text-yellow-500 mr-2">★</span>
                    Premium Tools
                  </h3>
                  
                  <div className="space-y-3">
                    <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 text-left transition-colors">
                      Enable Dumping Penalizer
                    </button>
                    
                    <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 text-left transition-colors">
                      Save This Shipment
                    </button>
                    
                    <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 text-left transition-colors">
                      Market Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </DndContext>
      
      <Footer />
      
      <GlobalSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Home;

export default Home