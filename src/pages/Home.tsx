import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import GlobalSettings from '../components/config/GlobalSettings';
import { DragDropProvider, DragAndDropSection } from '../components/dragdrop';
import { ProductsSection, ContainersSection, MarketAnalysisSection } from '../components/sections';
import Sidebar from '../components/layout/Sidebar';
import ShipmentHeader from '../components/shipment/ShipmentHeader';
import { useShipmentManagement, useFolderManagement } from '../hooks';
import { Product, Container } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    currentShipment, 
    savedShipments,
    createNewShipment, 
    saveCurrentShipment,
    loadShipment,
    updateShipmentName,
    updateShipment,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    config,
    updateConfig,
    subscriptionTier,
    dumpingPenalizerEnabled,
    aiDimensionsEnabled,
    marketAnalysisEnabled
  } = useAppContext();
  
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Use custom hooks for state management
  const {
    editingProduct,
    editingContainer,
    selectedProduct,
    handleEditProduct,
    handleEditContainer,
    handleDuplicateProduct,
    cancelEditing
  } = useShipmentManagement();

  const {
    folders,
    shipmentFolders,
    handleRenameShipment,
    handleMoveToFolder,
    handleArchiveShipment,
    handleDeleteShipment,
    createNewFolder,
    handleRenameFolder,
    handleDeleteFolder
  } = useFolderManagement();
  
  // All hooks must be called before any early returns
  React.useEffect(() => {
    if (!currentShipment) {
      createNewShipment();
    }
  }, [currentShipment, createNewShipment]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSaveShipment = async () => {
    await saveCurrentShipment();
  };

  const handleCurrencyChange = (currency: string) => {
    updateConfig({ currency: currency as any });
  };

  const handleMeasurementChange = (measurement: string) => {
    updateConfig({ measurement: measurement as any });
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleProductAssignment = React.useCallback((productId: string, containerId?: string) => {
    updateProduct(productId, { containerId });
  }, [updateProduct]);

  const handleDuplicateProductWrapper = React.useCallback((product: Product) => {
    const productWithoutId = handleDuplicateProduct(product);
    addProduct(productWithoutId);
  }, [handleDuplicateProduct, addProduct]);
  
  const productBeingEdited = React.useMemo(() => 
    editingProduct && currentShipment
      ? currentShipment.products.find(p => p.id === editingProduct)
      : undefined,
    [editingProduct, currentShipment]
  );

  const containerBeingEdited = React.useMemo(() =>
    editingContainer && currentShipment
      ? currentShipment.containers.find(c => c.id === editingContainer)
      : undefined,
    [editingContainer, currentShipment]
  );

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarVisible && (
        <Sidebar
          user={user}
          subscriptionTier={subscriptionTier}
          savedShipments={savedShipments}
          currentShipment={currentShipment}
          folders={folders}
          shipmentFolders={shipmentFolders}
          onCreateNewShipment={createNewShipment}
          onLoadShipment={loadShipment}
          onCreateFolder={createNewFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameShipment={handleRenameShipment}
          onMoveToFolder={handleMoveToFolder}
          onArchiveShipment={handleArchiveShipment}
          onDeleteShipment={handleDeleteShipment}
          onSignOut={handleSignOut}
          onSettingsClick={() => setShowSettings(true)}
          onToggleSidebar={handleToggleSidebar}
        />
      )}

      {/* Main Content */}
      <DragDropProvider
        containers={currentShipment.containers}
        products={currentShipment.products}
        onProductAssignment={handleProductAssignment}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area with Header Inside */}
          <div className="flex-1 overflow-auto">
            {/* Header - will scroll with content */}
            <ShipmentHeader
              currentShipment={currentShipment}
              config={config}
              dumpingPenalizerEnabled={dumpingPenalizerEnabled}
              subscriptionTier={subscriptionTier}
              sidebarVisible={sidebarVisible}
              folders={folders}
              currentFolderId={shipmentFolders[currentShipment?.id || '']}
              onUpdateShipment={updateShipment}
              onCurrencyChange={handleCurrencyChange}
              onMeasurementChange={handleMeasurementChange}
              onSettingsClick={() => setShowSettings(true)}
              onSaveShipment={handleSaveShipment}
              onToggleSidebar={handleToggleSidebar}
            />
            
            {/* Main Content */}
            <div className="p-6 space-y-8">
              {/* Containers Section */}
              <ContainersSection
                containers={currentShipment.containers}
                products={currentShipment.products}
                config={config}
                editingContainer={editingContainer}
                containerBeingEdited={containerBeingEdited}
                onAddContainer={addContainer}
                onUpdateContainer={updateContainer}
                onRemoveContainer={removeContainer}
                onEditContainer={handleEditContainer}
                onCancelEdit={cancelEditing}
              />

              {/* Products Section */}
              <ProductsSection
                products={currentShipment.products}
                config={config}
                aiDimensionsEnabled={aiDimensionsEnabled}
                editingProduct={editingProduct}
                productBeingEdited={productBeingEdited}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onRemoveProduct={removeProduct}
                onEditProduct={handleEditProduct}
                onDuplicateProduct={handleDuplicateProductWrapper}
                onCancelEdit={cancelEditing}
              />


              {/* Market Analysis Section */}
              {marketAnalysisEnabled && currentShipment.products.length > 0 && (
                <MarketAnalysisSection />
              )}
            </div>
          </div>
        </div>
      </DragDropProvider>

      <GlobalSettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Home;