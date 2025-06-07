import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/forms/ProductForm';
import ContainerForm from '../components/forms/ContainerForm';
import { calculateShipmentScore, calculateProductScore, formatCurrency, formatPercentage } from '../utils/calculations';
import GlobalSettings from '../components/config/GlobalSettings';
import { Settings, Plus, Package, Container, Edit2, Trash2, Filter, TrendingUp, DollarSign, Clock, BarChart3, Save, Zap, Brain, Target, Star, MoreVertical, Share, FolderPlus, Archive, Edit, Folder } from 'lucide-react';
import ContainerDropZone from '../components/containers/ContainerDropZone';
import DraggableProduct from '../components/products/DraggableProduct';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

interface ShipmentMenuProps {
  shipmentId: string;
  shipmentName: string;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
  onMoveToFolder: (id: string, folderId: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  folders: Array<{ id: string; name: string }>;
}

const ShipmentMenu: React.FC<ShipmentMenuProps> = ({
  shipmentId,
  shipmentName,
  isOpen,
  onClose,
  onRename,
  onMoveToFolder,
  onArchive,
  onDelete,
  folders
}) => {
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [newName, setNewName] = useState(shipmentName);

  if (!isOpen) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== shipmentName) {
      onRename(shipmentId, newName.trim());
    }
    setShowRenameInput(false);
    onClose();
  };

  const handleMoveToFolder = (folderId: string) => {
    onMoveToFolder(shipmentId, folderId);
    setShowFolderSelect(false);
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
      <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
        {showRenameInput ? (
          <div className="px-3 py-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setShowRenameInput(false);
                  setNewName(shipmentName);
                }
              }}
              onBlur={handleRename}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : showFolderSelect ? (
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Move to folder:</div>
            <div className="space-y-1">
              <button
                onClick={() => handleMoveToFolder('')}
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              >
                📁 No folder
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveToFolder(folder.id)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                >
                  📁 {folder.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFolderSelect(false)}
              className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded mt-2"
            >
              ← Back
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowRenameInput(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Edit className="h-4 w-4 mr-3" />
              Cambiar el nombre
            </button>
            
            <button
              onClick={() => setShowFolderSelect(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Folder className="h-4 w-4 mr-3" />
              Añadir al folder
            </button>
            
            <button
              onClick={() => {
                onArchive(shipmentId);
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Archive className="h-4 w-4 mr-3" />
              Archivar
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este envío?')) {
                  onDelete(shipmentId);
                  onClose();
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Eliminar
            </button>
          </>
        )}
      </div>
    </>
  );
};

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
    updateConfig,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Mock folders data - in real app this would come from context/database
  const [folders, setFolders] = useState([
    { id: '1', name: 'Q1 2024' },
    { id: '2', name: 'Electronics' },
    { id: '3', name: 'Archived' }
  ]);
  
  // Mock shipment folder assignments
  const [shipmentFolders, setShipmentFolders] = useState<Record<string, string>>({
    '1': '1', // Miami to Buenos Aires in Q1 2024
    '2': '2', // China to Mexico in Electronics
  });
  
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

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ currency: e.target.value as any });
  };

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ measurement: e.target.value as any });
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

  const handleRenameShipment = (id: string, newName: string) => {
    // In real app, this would update the shipment in context/database
    console.log(`Renaming shipment ${id} to ${newName}`);
  };

  const handleMoveToFolder = (shipmentId: string, folderId: string) => {
    setShipmentFolders(prev => ({
      ...prev,
      [shipmentId]: folderId
    }));
  };

  const handleArchiveShipment = (id: string) => {
    // Move to archived folder or mark as archived
    const archivedFolder = folders.find(f => f.name === 'Archived');
    if (archivedFolder) {
      handleMoveToFolder(id, archivedFolder.id);
    }
  };

  const handleDeleteShipment = (id: string) => {
    // In real app, this would delete from context/database
    console.log(`Deleting shipment ${id}`);
  };

  const createNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim()
      };
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  // Group shipments by folder
  const groupedShipments = React.useMemo(() => {
    const groups: Record<string, typeof savedShipments> = {
      '': [] // No folder
    };
    
    folders.forEach(folder => {
      groups[folder.id] = [];
    });

    savedShipments.forEach(shipment => {
      const folderId = shipmentFolders[shipment.id] || '';
      if (!groups[folderId]) {
        groups[folderId] = [];
      }
      groups[folderId].push(shipment);
    });

    return groups;
  }, [savedShipments, shipmentFolders, folders]);
  
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
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">SAVED SHIPMENTS</h3>
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="text-gray-400 hover:text-gray-600"
              title="Create new folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          {showNewFolderInput && (
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createNewFolder();
                  if (e.key === 'Escape') {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }
                }}
                onBlur={createNewFolder}
                placeholder="Folder name"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-4">
            {/* No folder group */}
            {groupedShipments[''].length > 0 && (
              <div className="space-y-2">
                {groupedShipments[''].map((shipment, index) => (
                  <div 
                    key={shipment.id}
                    className={`relative p-3 rounded-md cursor-pointer transition-colors ${
                      currentShipment?.id === shipment.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => loadShipment(shipment)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{shipment.name}</p>
                        <p className={`text-xs ${
                          index === 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {index === 0 ? 'Active' : 'Draft'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(shipment.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === shipment.id ? null : shipment.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <ShipmentMenu
                      shipmentId={shipment.id}
                      shipmentName={shipment.name}
                      isOpen={openMenuId === shipment.id}
                      onClose={() => setOpenMenuId(null)}
                      onRename={handleRenameShipment}
                      onMoveToFolder={handleMoveToFolder}
                      onArchive={handleArchiveShipment}
                      onDelete={handleDeleteShipment}
                      folders={folders}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Folder groups */}
            {folders.map(folder => {
              const folderShipments = groupedShipments[folder.id] || [];
              if (folderShipments.length === 0) return null;

              return (
                <div key={folder.id} className="space-y-2">
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Folder className="h-3 w-3 mr-1" />
                    {folder.name}
                  </div>
                  {folderShipments.map((shipment, index) => (
                    <div 
                      key={shipment.id}
                      className={`relative ml-4 p-3 rounded-md cursor-pointer transition-colors ${
                        currentShipment?.id === shipment.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div 
                        className="flex items-center justify-between"
                        onClick={() => loadShipment(shipment)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{shipment.name}</p>
                          <p className="text-xs text-gray-500">Draft</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(shipment.createdAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === shipment.id ? null : shipment.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <ShipmentMenu
                        shipmentId={shipment.id}
                        shipmentName={shipment.name}
                        isOpen={openMenuId === shipment.id}
                        onClose={() => setOpenMenuId(null)}
                        onRename={handleRenameShipment}
                        onMoveToFolder={handleMoveToFolder}
                        onArchive={handleArchiveShipment}
                        onDelete={handleDeleteShipment}
                        folders={folders}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
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
                  onChange={handleCurrencyChange}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <select 
                  value={config.measurement}
                  onChange={handleMeasurementChange}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
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