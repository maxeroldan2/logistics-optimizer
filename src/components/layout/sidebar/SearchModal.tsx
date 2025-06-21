import React, { useState, useMemo } from 'react';
import { X, Search, Package, MoreVertical } from 'lucide-react';
import { Shipment } from '../../../types';
import { ShipmentMenu } from './ShipmentMenu';

interface SearchModalProps {
  isOpen: boolean;
  savedShipments: Shipment[];
  folders: Array<{ id: string; name: string }>;
  onClose: () => void;
  onLoadShipment: (shipment: Shipment) => void;
  onRenameShipment: (id: string, newName: string) => void;
  onMoveToFolder: (shipmentId: string, folderId: string) => void;
  onArchiveShipment: (id: string) => void;
  onDeleteShipment: (id: string) => void;
}

type FilterType = 'all' | 'active' | 'drafts';
type SortType = 'lastModified' | 'name' | 'score' | 'profitMargin';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  savedShipments,
  folders,
  onClose,
  onLoadShipment,
  onRenameShipment,
  onMoveToFolder,
  onArchiveShipment,
  onDeleteShipment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('lastModified');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  const filteredAndSortedShipments = useMemo(() => {
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
        filtered = filtered.filter((_, index) => index === 0);
      } else if (selectedFilter === 'drafts') {
        filtered = filtered.filter((_, index) => index !== 0);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score': {
          const scoreA = (a.products.length * 10) + (a.containers.length * 15);
          const scoreB = (b.products.length * 10) + (b.containers.length * 15);
          return scoreB - scoreA;
        }
        case 'profitMargin': {
          const profitA = a.products.reduce((sum, p) => sum + (p.value || 0), 0);
          const profitB = b.products.reduce((sum, p) => sum + (p.value || 0), 0);
          return profitB - profitA;
        }
        case 'lastModified':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filtered;
  }, [savedShipments, searchQuery, selectedFilter, sortBy]);

  const handleClose = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setSortBy('lastModified');
    setOpenMenuId(null);
    onClose();
  };

  const handleLoadShipment = (shipment: Shipment) => {
    onLoadShipment(shipment);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Search Shipments</h2>
          <button 
            onClick={handleClose}
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
            {(['all', 'active', 'drafts'] as FilterType[]).map((filter) => (
              <button 
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
            <div className="flex-1"></div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
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
              filteredAndSortedShipments.map((shipment) => {
                const isActive = savedShipments.indexOf(shipment) === 0;
                const score = (shipment.products.length * 10) + (shipment.containers.length * 15);
                const profitMargin = shipment.products.reduce((sum, p) => sum + (p.value || 0), 0) / 100;
                
                return (
                  <div 
                    key={shipment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors relative"
                    onClick={() => handleLoadShipment(shipment)}
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
  );
};