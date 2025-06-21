import React from 'react';

interface ProductIconSelectorProps {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}

export const ProductIconSelector: React.FC<ProductIconSelectorProps> = ({
  selectedIcon,
  onIconChange
}) => {
  // Icon options that match the reference design
  const iconOptions = [
    { value: 'Package', label: 'Pack', emoji: '📦' },
    { value: 'Smartphone', label: 'Phone', emoji: '📱' },
    { value: 'Laptop', label: 'Laptop', emoji: '💻' },
    { value: 'Headphones', label: 'Audio', emoji: '🎧' },
    { value: 'Camera', label: 'Camera', emoji: '📷' },
    { value: 'Watch', label: 'Watch', emoji: '⌚' },
    { value: 'Tablet', label: 'Tablet', emoji: '📱' },
    { value: 'Book', label: 'Book', emoji: '📚' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
      <select
        value={selectedIcon}
        onChange={(e) => onIconChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white"
      >
        {iconOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.emoji} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};