import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/forms/ProductForm';
import ProductList from '../components/products/ProductList';
import ContainerForm from '../components/forms/ContainerForm';
import ScoreCard from '../components/common/ScoreCard';
import { calculateShipmentScore } from '../utils/calculations';
import GlobalSettings from '../components/config/GlobalSettings';
import { Settings, Plus } from 'lucide-react';
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
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingContainer, setEditingContainer] = useState<string | null>(null);
  
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
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <DndContext onDragEnd={handleDragEnd}>
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            <div className="lg:w-2/3 space-y-6">
              <PremiumBanner />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
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
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Containers
                      </h3>
                      <button
                        onClick={() => setShowNewContainerForm(true)}
                        className="flex items-center text-blue-600 hover:text-blue-700"
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
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Products
                    </h3>
                    
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
                        <ProductForm onAddProduct={addProduct} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <PremiumFeatures />
            </div>
            
            <div className="lg:w-1/3 space-y-6 mt-6 lg:mt-0">
              <ScoreCard 
                score={shipmentScore}
                title="Shipment Score"
                description="The main optimization score based on profit per volume."
                isPrimary={true}
              />
              
              {currentShipment.products.length > 0 ? (
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
                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                  <p className="text-gray-500">
                    Add products to see optimization tips and calculations.
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