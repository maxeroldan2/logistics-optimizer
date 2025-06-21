import React, { useState, useEffect } from 'react';
import { X, Search, Package, Heart } from 'lucide-react';
import { Product } from '../../../types';
import { useSavedProducts } from '../../../hooks/useSavedProducts';
import { 
  allProductTemplates, 
  getProductTemplateById
} from '../../../data/productTemplates';

interface ProductPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (product: Omit<Product, 'id'>) => void;
}

export const ProductPresetManager: React.FC<ProductPresetManagerProps> = ({
  isOpen,
  onClose,
  onApplyPreset
}) => {
  const { savedProducts, savedProductToProduct } = useSavedProducts();
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [presetIncludePackaging, setPresetIncludePackaging] = useState(false);

  // Reset category when presets modal opens
  useEffect(() => {
    if (isOpen) {
      // If user has saved products, default to showing them, otherwise show popular
      setSelectedCategory(savedProducts.length > 0 ? 'saved' : 'popular');
    }
  }, [isOpen, savedProducts.length]);

  // Popular products from the CSV list
  const popularProducts = [
    { id: 'smartphones-gama-alta', name: 'Smartphones de gama alta', description: 'Modelos populares como iPhone y Samsung.', emoji: '📱' },
    { id: 'laptops-notebooks', name: 'Laptops y Notebooks', description: 'Equipos portátiles para trabajo y ocio.', emoji: '💻' },
    { id: 'auriculares-bluetooth', name: 'Auriculares Bluetooth', description: 'AirPods y otras marcas populares.', emoji: '🎧' },
    { id: 'consolas-videojuegos', name: 'Consolas de Videojuegos', description: 'PS5, Nintendo Switch, Xbox Series X/S.', emoji: '🎮' },
    { id: 'smartwatches', name: 'Smartwatches', description: 'Apple Watch, Fitbit y otros.', emoji: '⌚' },
    { id: 'zapatillas-deportivas', name: 'Zapatillas Deportivas', description: 'Modelos de Nike, Adidas, etc.', emoji: '👟' },
    { id: 'camisetas-basicas', name: 'Camisetas Básicas', description: 'Prendas esenciales de algodón.', emoji: '👕' },
    { id: 'mochilas-urbanas', name: 'Mochilas Urbanas', description: 'Accesorios prácticos para el día a día.', emoji: '🎒' },
    { id: 'serums-faciales', name: 'Sérums Faciales', description: 'Vitamina C, retinol, ácido hialurónico.', emoji: '🧴' },
    { id: 'perfumes-diseñador', name: 'Perfumes de Diseñador', description: 'Fragancias de marcas reconocidas.', emoji: '🌸' },
    { id: 'freidoras-aire', name: 'Freidoras de Aire', description: 'Electrodoméstico de alta demanda.', emoji: '🍳' },
    { id: 'cafeteras-capsulas', name: 'Cafeteras de Cápsulas', description: 'Nespresso, Dolce Gusto y compatibles.', emoji: '☕' }
  ];

  const getEmojiForTemplate = (template: typeof allProductTemplates[0]) => {
    // Map template categories and types to emojis
    switch (template.category) {
      case 'technology':
        if (template.name.toLowerCase().includes('smartphone') || template.name.toLowerCase().includes('phone')) return '📱';
        if (template.name.toLowerCase().includes('laptop') || template.name.toLowerCase().includes('notebook')) return '💻';
        if (template.name.toLowerCase().includes('auricular') || template.name.toLowerCase().includes('headphone')) return '🎧';
        if (template.name.toLowerCase().includes('watch')) return '⌚';
        if (template.name.toLowerCase().includes('camera')) return '📷';
        if (template.name.toLowerCase().includes('tablet')) return '📱';
        if (template.name.toLowerCase().includes('console') || template.name.toLowerCase().includes('playstation') || template.name.toLowerCase().includes('xbox') || template.name.toLowerCase().includes('nintendo')) return '🎮';
        return '⚡';
      case 'clothing':
        if (template.name.toLowerCase().includes('zapatilla') || template.name.toLowerCase().includes('shoe')) return '👟';
        if (template.name.toLowerCase().includes('camiseta') || template.name.toLowerCase().includes('shirt')) return '👕';
        if (template.name.toLowerCase().includes('mochila') || template.name.toLowerCase().includes('backpack')) return '🎒';
        if (template.name.toLowerCase().includes('gafas') || template.name.toLowerCase().includes('glasses')) return '🕶️';
        return '👔';
      case 'beauty':
        if (template.name.toLowerCase().includes('perfume')) return '🌸';
        if (template.name.toLowerCase().includes('serum') || template.name.toLowerCase().includes('sérum')) return '🧴';
        if (template.name.toLowerCase().includes('labial') || template.name.toLowerCase().includes('lipstick')) return '💄';
        return '💅';
      case 'home':
        if (template.name.toLowerCase().includes('freidora') || template.name.toLowerCase().includes('fryer')) return '🍳';
        if (template.name.toLowerCase().includes('cafetera') || template.name.toLowerCase().includes('coffee')) return '☕';
        if (template.name.toLowerCase().includes('silla') || template.name.toLowerCase().includes('chair')) return '🪑';
        return '🏠';
      case 'fitness':
        if (template.name.toLowerCase().includes('vitamin')) return '💊';
        if (template.name.toLowerCase().includes('yoga')) return '🧘';
        return '❤️';
      case 'baby':
        if (template.name.toLowerCase().includes('juguete') || template.name.toLowerCase().includes('toy')) return '🧸';
        if (template.name.toLowerCase().includes('pañal') || template.name.toLowerCase().includes('diaper')) return '👶';
        return '🍼';
      case 'pets':
        if (template.name.toLowerCase().includes('perro') || template.name.toLowerCase().includes('dog')) return '🐕';
        if (template.name.toLowerCase().includes('gato') || template.name.toLowerCase().includes('cat')) return '🐱';
        return '🐾';
      default:
        return '📦';
    }
  };

  const getFilteredProductsForCategory = () => {
    // If searching, show filtered results from all categories
    if (presetSearchTerm.trim()) {
      const searchLower = presetSearchTerm.toLowerCase();
      
      // Filter popular products
      const filteredPopular = popularProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );

      // Filter template products
      const filteredTemplates = allProductTemplates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.category.toLowerCase().includes(searchLower)
      ).map(template => ({
        id: template.id,
        name: template.name,
        description: `${template.height}×${template.width}×${template.length}cm, ${template.weight}kg`,
        emoji: getEmojiForTemplate(template),
        isSaved: false,
        hasPackaging: !!(template.packagedHeight && template.packagedWidth && template.packagedLength && template.packagedWeight)
      }));

      // Filter saved products
      const filteredSaved = savedProducts.filter(saved =>
        saved.name.toLowerCase().includes(searchLower) ||
        (saved.description && saved.description.toLowerCase().includes(searchLower))
      ).map(saved => ({
        id: saved.id,
        name: saved.name,
        description: saved.description || `${saved.height}×${saved.width}×${saved.length}cm`,
        emoji: saved.icon || '📦',
        isSaved: true
      }));

      return [...filteredPopular, ...filteredTemplates, ...filteredSaved];
    }

    // Show products based on selected category
    switch (selectedCategory) {
      case 'popular':
        return popularProducts;
      
      case 'saved':
        return savedProducts.map(saved => ({
          id: saved.id,
          name: saved.name,
          description: saved.description || `${saved.height}×${saved.width}×${saved.length}cm`,
          emoji: saved.icon || '📦',
          isSaved: true
        }));
      
      default:
        return allProductTemplates
          .filter(template => template.category === selectedCategory)
          .map(template => ({
            id: template.id,
            name: template.name,
            description: `${template.height}×${template.width}×${template.length}cm, ${template.weight}kg`,
            emoji: getEmojiForTemplate(template),
            isSaved: false,
            hasPackaging: !!(template.packagedHeight && template.packagedWidth && template.packagedLength && template.packagedWeight)
          }));
    }
  };

  const applyPreset = (templateId: string) => {
    const template = getProductTemplateById(templateId);
    if (!template) return;
    
    // Use packaging dimensions if available and checkbox is checked, otherwise use product dimensions
    const usePackaging = presetIncludePackaging && template.packagedHeight && template.packagedWidth && template.packagedLength && template.packagedWeight;
    
    const productData: Omit<Product, 'id'> = {
      name: template.name,
      height: usePackaging ? template.packagedHeight! : template.height,
      width: usePackaging ? template.packagedWidth! : template.width,
      length: usePackaging ? template.packagedLength! : template.length,
      weight: usePackaging ? template.packagedWeight! : template.weight,
      purchasePrice: template.estimatedPurchasePrice,
      resalePrice: template.estimatedResalePrice,
      daysToSell: template.estimatedDaysToSell,
      icon: template.icon,
      isBoxed: usePackaging,
      quantity: 1,
      containerId: undefined,
      tag: ''
    };
    
    onApplyPreset(productData);
    onClose();
  };

  const applySavedProduct = (savedProduct: typeof savedProducts[0]) => {
    const productData = savedProductToProduct(savedProduct);
    onApplyPreset(productData);
    onClose();
  };

  const applyPopularProduct = (productId: string) => {
    // Find matching template for popular products
    const popularProduct = popularProducts.find(p => p.id === productId);
    if (!popularProduct) return;

    // Try to find a matching template from our database
    let template: typeof allProductTemplates[0] | null = null;
    
    switch (productId) {
      case 'smartphones-gama-alta':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('smartphone'));
        break;
      case 'laptops-notebooks':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('laptop'));
        break;
      case 'auriculares-bluetooth':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('auricular') || t.name.toLowerCase().includes('airpods'));
        break;
      case 'consolas-videojuegos':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('playstation'));
        break;
      case 'smartwatches':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('smartwatch'));
        break;
      case 'zapatillas-deportivas':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('zapatilla') && t.name.toLowerCase().includes('deportiva'));
        break;
      case 'camisetas-basicas':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('camiseta'));
        break;
      case 'mochilas-urbanas':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('mochila'));
        break;
      case 'serums-faciales':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('sérum'));
        break;
      case 'perfumes-diseñador':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('perfume'));
        break;
      case 'freidoras-aire':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('freidora'));
        break;
      case 'cafeteras-capsulas':
        template = allProductTemplates.find(t => t.name.toLowerCase().includes('cafetera'));
        break;
      default:
        // Try to find any template that matches
        template = allProductTemplates.find(t => 
          t.name.toLowerCase().includes(popularProduct.name.toLowerCase().split(' ')[0])
        );
    }

    if (template) {
      applyPreset(template.id);
    } else {
      // Create a basic product with estimated values
      const productData: Omit<Product, 'id'> = {
        name: popularProduct.name,
        height: 10,
        width: 15,
        length: 20,
        weight: 0.5,
        purchasePrice: 50,
        resalePrice: 100,
        daysToSell: 10,
        icon: 'Package',
        quantity: 1,
        isBoxed: false,
        containerId: undefined,
        tag: ''
      };
      
      onApplyPreset(productData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Productos</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en todos los presets..."
              value={presetSearchTerm}
              onChange={(e) => setPresetSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          {/* Packaging Option */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Incluir Embalaje Original</h4>
              <p className="text-sm text-gray-600">Aplicar preset con dimensiones de caja incluidas (cuando esté disponible).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={presetIncludePackaging}
                onChange={(e) => setPresetIncludePackaging(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-2">
              {/* My Presets Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">MIS PRESETS</h3>
                <button
                  onClick={() => setSelectedCategory('saved')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                    selectedCategory === 'saved' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">⭐</span>
                  Mi Biblioteca
                  {savedProducts.length > 0 && (
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {savedProducts.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Categories Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">CATEGORÍAS</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('popular')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'popular' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">🔥</span>
                    Populares
                  </button>
                  <button
                    onClick={() => setSelectedCategory('technology')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'technology' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">📱</span>
                    Electrónica
                  </button>
                  <button
                    onClick={() => setSelectedCategory('clothing')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'clothing' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">👕</span>
                    Moda
                  </button>
                  <button
                    onClick={() => setSelectedCategory('beauty')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'beauty' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">💄</span>
                    Belleza
                  </button>
                  <button
                    onClick={() => setSelectedCategory('home')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">🏠</span>
                    Hogar y Cocina
                  </button>
                  <button
                    onClick={() => setSelectedCategory('fitness')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'fitness' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">❤️</span>
                    Salud
                  </button>
                  <button
                    onClick={() => setSelectedCategory('baby')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'baby' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">🧸</span>
                    Bebés y Niños
                  </button>
                  <button
                    onClick={() => setSelectedCategory('pets')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      selectedCategory === 'pets' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">🐾</span>
                    Mascotas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-6">
              {getFilteredProductsForCategory().map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (preset.isSaved) {
                      applySavedProduct(preset);
                    } else if (selectedCategory === 'popular' || popularProducts.some(p => p.id === preset.id)) {
                      applyPopularProduct(preset.id);
                    } else {
                      applyPreset(preset.id);
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group relative"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <span className="text-2xl">{preset.emoji}</span>
                      </div>
                      {preset.hasPackaging && (
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                          <Package className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{preset.name}</h3>
                    <p className="text-gray-600 text-sm flex-1">{preset.description}</p>
                    {preset.hasPackaging && (
                      <p className="text-green-600 text-xs mt-2 font-medium">📦 Incluye datos de embalaje</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {getFilteredProductsForCategory().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {selectedCategory === 'saved' ? (
                    <Heart className="h-12 w-12 mx-auto" />
                  ) : (
                    <Package className="h-12 w-12 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedCategory === 'saved' ? 'No tienes presets guardados' : 'No se encontraron productos'}
                </h3>
                <p className="text-gray-500">
                  {selectedCategory === 'saved' 
                    ? 'Guarda productos como presets para acceder rápidamente a ellos aquí'
                    : presetSearchTerm 
                      ? 'Intenta ajustar tu búsqueda' 
                      : 'No hay productos en esta categoría'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};