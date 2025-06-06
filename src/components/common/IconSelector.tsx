import React, { useState } from 'react';
import { 
  Package, Box, Shirt, Laptop, Phone, Watch, Camera, Headphones,
  Book, Coffee, Car, Bike, Plane, Ship, Truck, Home,
  Heart, Star, Gift, Diamond, Crown, Zap, Target, Award,
  ShoppingBag, ShoppingCart, Briefcase, Backpack, Luggage, Container,
  Search, ChevronDown, ChevronUp
} from 'lucide-react';

export interface IconOption {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: string;
}

const iconCategories = {
  general: [
    { name: 'Package', icon: Package },
    { name: 'Box', icon: Box },
    { name: 'Container', icon: Container },
    { name: 'Shopping Bag', icon: ShoppingBag },
    { name: 'Shopping Cart', icon: ShoppingCart },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Backpack', icon: Backpack },
    { name: 'Luggage', icon: Luggage },
  ],
  electronics: [
    { name: 'Laptop', icon: Laptop },
    { name: 'Phone', icon: Phone },
    { name: 'Watch', icon: Watch },
    { name: 'Camera', icon: Camera },
    { name: 'Headphones', icon: Headphones },
  ],
  clothing: [
    { name: 'Shirt', icon: Shirt },
  ],
  lifestyle: [
    { name: 'Book', icon: Book },
    { name: 'Coffee', icon: Coffee },
    { name: 'Gift', icon: Gift },
    { name: 'Heart', icon: Heart },
  ],
  transport: [
    { name: 'Car', icon: Car },
    { name: 'Bike', icon: Bike },
    { name: 'Plane', icon: Plane },
    { name: 'Ship', icon: Ship },
    { name: 'Truck', icon: Truck },
    { name: 'Home', icon: Home },
  ],
  special: [
    { name: 'Star', icon: Star },
    { name: 'Diamond', icon: Diamond },
    { name: 'Crown', icon: Crown },
    { name: 'Zap', icon: Zap },
    { name: 'Target', icon: Target },
    { name: 'Award', icon: Award },
  ],
};

const allIcons: IconOption[] = Object.entries(iconCategories).flatMap(([category, icons]) =>
  icons.map(icon => ({ ...icon, category }))
);

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  placeholder?: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({ 
  selectedIcon, 
  onIconSelect, 
  placeholder = "Select an icon" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const selectedIconData = allIcons.find(icon => icon.name === selectedIcon);
  const SelectedIconComponent = selectedIconData?.icon || Package;

  const filteredIcons = allIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center">
          <SelectedIconComponent size={20} className="text-gray-600 mr-2" />
          <span className="text-sm text-gray-700">
            {selectedIcon || placeholder}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(iconCategories).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            <div className="grid grid-cols-4 gap-2">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.icon;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-3 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      selectedIcon === icon.name ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                    }`}
                    title={icon.name}
                  >
                    <IconComponent size={20} className="text-gray-600 mx-auto" />
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {icon.name}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No icons found matching your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;

// Helper function to get icon component by name
export const getIconByName = (iconName?: string) => {
  if (!iconName) return Package;
  const iconData = allIcons.find(icon => icon.name === iconName);
  return iconData?.icon || Package;
};