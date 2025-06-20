import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Package, 
  MoreVertical, 
  FolderPlus, 
  Archive, 
  Edit, 
  Folder,
  Trash2,
  Crown,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  X,
  Edit2
} from 'lucide-react';
import { Shipment } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../auth/AuthProvider';

interface SidebarProps {
  user: any;
  subscriptionTier: string;
  savedShipments: Shipment[];
  currentShipment: Shipment | null;
  folders: Array<{ id: string; name: string }>;
  shipmentFolders: Record<string, string>;
  onCreateNewShipment: () => void;
  onLoadShipment: (shipment: Shipment) => void;
  onSettingsClick: () => void;
  onSignOut: () => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleSidebar: () => void;
}

// Shipment Menu Component
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

// Folder Menu Component
interface FolderMenuProps {
  folderId: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const FolderMenu: React.FC<FolderMenuProps> = ({
  folderId,
  folderName,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute right-0 top-6 z-50 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1">
        <button
          onClick={() => onEdit(folderId, folderName)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Edit2 className="h-4 w-4 mr-3" />
          Rename
        </button>
        
        <button
          onClick={() => onDelete(folderId)}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-3" />
          Delete
        </button>
      </div>
    </>
  );
};

// User Menu Component
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

const UserMenu: React.FC<UserMenuProps> = ({
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
              onClick={() => {
                onToggleSubscriptionTier();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center bg-yellow-50 border-b border-yellow-200"
            >
              <span className="h-4 w-4 mr-3 text-lg">🔄</span>
              Dev: Switch to {subscriptionTier === 'free' ? 'Premium' : 'Free'}
            </button>
            <div className="border-b border-gray-200 my-1"></div>
          </>
        )}
        
        <button
          onClick={() => {
            onUpgradePlan();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Crown className="h-4 w-4 mr-3 text-yellow-500" />
          Mejorar plan
        </button>
        
        <button
          onClick={() => {
            onSettings();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Settings className="h-4 w-4 mr-3" />
          Configuración
        </button>
        
        <button
          onClick={() => {
            onHelp();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & FAQ
        </button>
        
        <button
          onClick={() => {
            onTOS();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <FileText className="h-4 w-4 mr-3" />
          Términos y políticas
        </button>
        
        <hr className="my-1" />
        
        <button
          onClick={() => {
            onSignOut();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  user,
  subscriptionTier,
  savedShipments,
  currentShipment,
  folders,
  shipmentFolders,
  onCreateNewShipment,
  onLoadShipment,
  onSettingsClick,
  onSignOut,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleSidebar
}) => {
  const { toggleSubscriptionTier } = useAppContext();
  const { signOut } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'drafts'>('all');
  const [sortBy, setSortBy] = useState<'lastModified' | 'name' | 'score' | 'profitMargin'>('lastModified');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  const createNewFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleStartEditingFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
    setOpenFolderMenuId(null);
  };

  const handleSaveFolderEdit = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onRenameFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleCancelFolderEdit = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta carpeta? Los envíos se moverán a "Sin carpeta".')) {
      onDeleteFolder(folderId);
      setOpenFolderMenuId(null);
    }
  };

  const handleUpgradePlan = () => {
    // TODO: Navigate to upgrade plan page or open upgrade modal
    console.log('Upgrade plan clicked');
  };

  const handleHelp = () => {
    // TODO: Open help & FAQ page
    console.log('Help & FAQ clicked');
  };

  const handleTOS = () => {
    // TODO: Open Terms of Service page
    console.log('Terms & Policies clicked');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSelectedFilter('all');
    setSortBy('lastModified');
  };

  // Filter and sort shipments for search
  const filteredAndSortedShipments = React.useMemo(() => {
    let filtered = [...savedShipments];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(shipment => 
        shipment.name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'active') {
        filtered = filtered.filter((_, index) => index === 0); // First shipment is active
      } else if (selectedFilter === 'drafts') {
        filtered = filtered.filter((_, index) => index !== 0); // All others are drafts
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          // Mock score calculation based on products/containers
          const scoreA = (a.products.length * 10) + (a.containers.length * 15);
          const scoreB = (b.products.length * 10) + (b.containers.length * 15);
          return scoreB - scoreA;
        case 'profitMargin':
          // Mock profit margin calculation
          const profitA = a.products.reduce((sum, p) => sum + (p.value || 0), 0);
          const profitB = b.products.reduce((sum, p) => sum + (p.value || 0), 0);
          return profitB - profitA;
        case 'lastModified':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [savedShipments, searchQuery, selectedFilter, sortBy]);

  // Group shipments by folder
  const groupedShipments = React.useMemo(() => {
    const groups: Record<string, typeof savedShipments> = {
      '': [] // No folder
    };
    
    folders.forEach(folder => {
      groups[folder.id] = [];
    });

    savedShipments.forEach(shipment => {
      // Use the folderId from the shipment object directly, fallback to shipmentFolders for local state
      const folderId = shipment.folderId || shipmentFolders[shipment.id] || '';
      if (!groups[folderId]) {
        groups[folderId] = [];
      }
      groups[folderId].push(shipment);
    });

    return groups;
  }, [savedShipments, shipmentFolders, folders]);

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">Logistics Optimizer</span>
          </div>
          <button 
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Hide sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <button
          onClick={onCreateNewShipment}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Shipment
        </button>
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Shipments
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
              placeholder="Folder name"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={createNewFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Folders Section (shown first) */}
          {folders.map(folder => {
            const folderShipments = groupedShipments[folder.id] || [];
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <div key={folder.id} className="space-y-2">
                {editingFolderId === folder.id ? (
                  // Editing mode
                  <div className="bg-gray-50 p-2 rounded">
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveFolderEdit();
                        if (e.key === 'Escape') handleCancelFolderEdit();
                      }}
                      onBlur={handleSaveFolderEdit}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  // Normal mode
                  <div className="relative">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors group"
                    >
                      <div className="flex items-center">
                        <Folder className="h-3 w-3 mr-1" />
                        {folder.name}
                        <span className="ml-2 text-xs text-gray-400">
                          ({folderShipments.length})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 mr-1 p-1 hover:bg-gray-200 rounded transition-opacity"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>
                        {folderShipments.length > 0 && (
                          isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )
                        )}
                      </div>
                    </button>

                    <FolderMenu
                      folderId={folder.id}
                      folderName={folder.name}
                      isOpen={openFolderMenuId === folder.id}
                      onClose={() => setOpenFolderMenuId(null)}
                      onEdit={handleStartEditingFolder}
                      onDelete={handleDeleteFolder}
                    />
                  </div>
                )}
                
                {/* Folder shipments (hidden by default) */}
                {isExpanded && folderShipments.map((shipment, index) => (
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
                      onClick={() => onLoadShipment(shipment)}
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
                      onRename={onRenameShipment}
                      onMoveToFolder={onMoveToFolder}
                      onArchive={onArchiveShipment}
                      onDelete={onDeleteShipment}
                      folders={folders}
                    />
                  </div>
                ))}
              </div>
            );
          })}

          {/* Unfoldered shipments (shown last) */}
          {groupedShipments[''].length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sin carpeta ({groupedShipments[''].length})
              </div>
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
                    onClick={() => onLoadShipment(shipment)}
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
                    onRename={onRenameShipment}
                    onMoveToFolder={onMoveToFolder}
                    onArchive={onArchiveShipment}
                    onDelete={onDeleteShipment}
                    folders={folders}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
              <p className={`text-xs font-medium ${subscriptionTier === 'premium' ? 'text-green-600' : 'text-orange-600'}`}>
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
              onToggleSubscriptionTier={toggleSubscriptionTier}
            />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseSearchModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Search Shipments</h2>
              <button 
                onClick={handleCloseSearchModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setSelectedFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'active' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setSelectedFilter('drafts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'drafts' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Drafts
                </button>
                <div className="flex-1"></div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lastModified">Sort by: Last Modified</option>
                  <option value="name">Sort by: Name</option>
                  <option value="score">Sort by: Score</option>
                  <option value="profitMargin">Sort by: Profit Margin</option>
                </select>
              </div>
            </div>

            {/* Shipment Results */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {filteredAndSortedShipments.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? 'Try adjusting your search or filters' : 'Create your first shipment to get started'}
                    </p>
                  </div>
                ) : (
                  filteredAndSortedShipments.map((shipment, index) => {
                    const isActive = savedShipments.indexOf(shipment) === 0; // First shipment in original list is active
                    const score = (shipment.products.length * 10) + (shipment.containers.length * 15);
                    const profitMargin = shipment.products.reduce((sum, p) => sum + (p.value || 0), 0) / 100;
                    
                    return (
                      <div 
                        key={shipment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          onLoadShipment(shipment);
                          handleCloseSearchModal();
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">{shipment.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isActive 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isActive ? 'Active' : 'Draft'}
                              </span>
                            </div>
                            <p className="text-gray-500">Last modified: {formatTimeAgo(shipment.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Score</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.min(score, 100)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Profit Margin</p>
                            <p className="text-2xl font-bold text-green-600">{profitMargin.toFixed(1)}%</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === shipment.id ? null : shipment.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-2"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <ShipmentMenu
                          shipmentId={shipment.id}
                          shipmentName={shipment.name}
                          isOpen={openMenuId === shipment.id}
                          onClose={() => setOpenMenuId(null)}
                          onRename={onRenameShipment}
                          onMoveToFolder={onMoveToFolder}
                          onArchive={onArchiveShipment}
                          onDelete={onDeleteShipment}
                          folders={folders}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;