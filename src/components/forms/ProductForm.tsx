import React, { useState, useEffect } from 'react';
import { X, Package, Sparkles, Search, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useSavedProducts } from '../../hooks/useSavedProducts';
import { 
  allProductTemplates, 
  getProductTemplateById, 
  getProductCategories,
  categoryDisplayNames 
} from '../../data/productTemplates';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  product?: Product;
  onClose?: () => void;
  isOpen?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onAddProduct, 
  onUpdateProduct,
  product: initialProduct,
  onClose,
  isOpen = false
}) => {
  const { config, aiDimensionsEnabled } = useAppContext();
  const { savedProducts, savedProductToProduct, saveProduct } = useSavedProducts();
  
  const [product, setProduct] = useState<Omit<Product, 'id'>>({
    name: initialProduct?.name || '',
    height: initialProduct?.height || 0,
    width: initialProduct?.width || 0,
    length: initialProduct?.length || 0,
    weight: initialProduct?.weight || 0,
    purchasePrice: initialProduct?.purchasePrice || 0,
    resalePrice: initialProduct?.resalePrice || 0,
    daysToSell: initialProduct?.daysToSell || 7,
    quantity: initialProduct?.quantity || 1,
    isBoxed: false,
    containerId: initialProduct?.containerId,
    icon: initialProduct?.icon || 'Package',
    tag: initialProduct?.tag || ''
  });

  const [selectedIcon, setSelectedIcon] = useState(product.icon);
  const [showPresets, setShowPresets] = useState(false);
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [presetIncludePackaging, setPresetIncludePackaging] = useState(false);

  // Reset category when presets modal opens
  useEffect(() => {
    if (showPresets) {
      // If user has saved products, default to showing them, otherwise show popular
      setSelectedCategory(savedProducts.length > 0 ? 'saved' : 'popular');
    }
  }, [showPresets, savedProducts.length]);

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

  // Calculate profit per unit in real-time
  const calculateProfitPerUnit = () => {
    return product.resalePrice - product.purchasePrice;
  };

  // AI Dimension autocompletion
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProduct(prev => ({ ...prev, name }));

    // If AI dimensions is enabled, try to auto-fill dimensions
    if (aiDimensionsEnabled && name.length > 3) {
      const matchingTemplate = allProductTemplates.find(template => 
        template.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(template.name.toLowerCase().split(' ')[0])
      );

      if (matchingTemplate && product.height === 0) {
        setProduct(prev => ({
          ...prev,
          height: matchingTemplate.height,
          width: matchingTemplate.width,
          length: matchingTemplate.length,
          weight: matchingTemplate.weight,
          purchasePrice: matchingTemplate.estimatedPurchasePrice,
          resalePrice: matchingTemplate.estimatedResalePrice,
          daysToSell: matchingTemplate.estimatedDaysToSell,
          icon: matchingTemplate.icon
        }));
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };


  const handleBoxedChange = (isBoxed: boolean) => {
    setProduct(prev => {
      if (isBoxed) {
        // Add packaging dimensions using smart calculation
        return {
          ...prev,
          isBoxed: true,
          height: prev.height + getPackagingDimensions(prev.height, 'height'),
          width: prev.width + getPackagingDimensions(prev.width, 'width'),
          length: prev.length + getPackagingDimensions(prev.length, 'length'),
          weight: prev.weight + getPackagingWeight(prev.weight)
        };
      } else {
        // Remove packaging dimensions (approximate reverse calculation)
        const newHeight = Math.max(1, prev.height - getPackagingDimensions(prev.height * 0.8, 'height'));
        const newWidth = Math.max(1, prev.width - getPackagingDimensions(prev.width * 0.8, 'width'));
        const newLength = Math.max(1, prev.length - getPackagingDimensions(prev.length * 0.8, 'length'));
        const newWeight = Math.max(0.01, prev.weight - getPackagingWeight(prev.weight * 0.9));
        
        return {
          ...prev,
          isBoxed: false,
          height: newHeight,
          width: newWidth,
          length: newLength,
          weight: newWeight
        };
      }
    });
  };

  // Calculate packaging dimensions based on product size
  const getPackagingDimensions = (dimension: number, type: 'height' | 'width' | 'length'): number => {
    // Packaging adds different amounts based on product size
    if (dimension <= 5) return 2; // Small items: +2cm
    if (dimension <= 15) return 3; // Medium items: +3cm
    if (dimension <= 30) return 4; // Large items: +4cm
    return 5; // Extra large items: +5cm
  };

  // Calculate packaging weight based on product weight
  const getPackagingWeight = (weight: number): number => {
    // Packaging weight is proportional to product weight
    if (weight <= 0.1) return 0.05; // Very light items: +50g
    if (weight <= 0.5) return 0.1;  // Light items: +100g
    if (weight <= 2) return 0.2;    // Medium items: +200g
    if (weight <= 5) return 0.3;    // Heavy items: +300g
    return weight * 0.1;            // Very heavy items: +10% of weight
  };


  const applyPreset = (templateId: string) => {
    const template = getProductTemplateById(templateId);
    if (!template) return;
    
    // Use packaging dimensions if available and checkbox is checked, otherwise use product dimensions
    const usePackaging = presetIncludePackaging && template.packagedHeight && template.packagedWidth && template.packagedLength && template.packagedWeight;
    
    setProduct(prev => ({
      ...prev,
      name: template.name,
      height: usePackaging ? template.packagedHeight! : template.height,
      width: usePackaging ? template.packagedWidth! : template.width,
      length: usePackaging ? template.packagedLength! : template.length,
      weight: usePackaging ? template.packagedWeight! : template.weight,
      purchasePrice: template.estimatedPurchasePrice,
      resalePrice: template.estimatedResalePrice,
      daysToSell: template.estimatedDaysToSell,
      icon: template.icon,
      isBoxed: usePackaging
    }));
    
    setSelectedIcon(template.icon);
    setShowPresets(false);
    setPresetSearchTerm('');
  };

  const applySavedProduct = (savedProduct: any) => {
    const productData = savedProductToProduct(savedProduct);
    
    setProduct(prev => ({
      ...prev,
      ...productData
    }));
    
    setSelectedIcon(productData.icon || 'Package');
    setShowPresets(false);
    setPresetSearchTerm('');
  };

  const applyPopularProduct = (productId: string) => {
    // Find matching template for popular products
    const popularProduct = popularProducts.find(p => p.id === productId);
    if (!popularProduct) return;

    // Try to find a matching template from our database
    let template = null;
    
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
      setProduct(prev => ({
        ...prev,
        name: popularProduct.name,
        height: 10,
        width: 15,
        length: 20,
        weight: 0.5,
        purchasePrice: 50,
        resalePrice: 100,
        daysToSell: 10,
        icon: 'Package'
      }));
      
      setSelectedIcon('Package');
    }
    
    setShowPresets(false);
    setPresetSearchTerm('');
  };

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

  const getFilteredPresets = () => {
    let presets = allProductTemplates;

    // Apply search filter
    if (presetSearchTerm.trim()) {
      presets = presets.filter(preset => 
        preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
        preset.category.toLowerCase().includes(presetSearchTerm.toLowerCase())
      );
    }

    return presets;
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

  const getEmojiForTemplate = (template: any) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name.trim()) {
      return;
    }
    
    const productWithIcon = { ...product, icon: selectedIcon };
    
    if (initialProduct && onUpdateProduct) {
      onUpdateProduct(initialProduct.id, productWithIcon);
    } else {
      onAddProduct(productWithIcon);
    }
    onClose?.();
  };

  const handleSaveAsPreset = async () => {
    if (!presetName.trim() || !product.name.trim()) {
      return;
    }

    const productToSave = {
      ...product,
      name: presetName,
      icon: selectedIcon,
      id: crypto.randomUUID() // Temporary ID for the save function
    } as Product;

    const success = await saveProduct(productToSave, presetDescription);
    
    if (success) {
      // Reset the save preset form
      setPresetName('');
      setPresetDescription('');
      setShowSaveAsPreset(false);
      // Could show a success message here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <p className="text-gray-600 mt-1">Fill in the details to calculate its viability.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Product Library Modal */}
        {showPresets && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Productos</h2>
                <button 
                  onClick={() => setShowPresets(false)}
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
                          setShowPresets(false);
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
        )}

        {/* Save as Preset Section */}
        {showSaveAsPreset && (
          <div className="border-b border-gray-200 p-6 bg-pink-50 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Save as Personal Preset
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Save the current product configuration as a personal preset for future use.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Preset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro Max Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Brief description of this product preset..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveAsPreset}
                  disabled={!presetName.trim() || !product.name.trim()}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveAsPreset(false);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleNameChange}
                  placeholder="e.g., iPhone 15 Pro, 256GB"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>

              {/* Icon and Quantity Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
                  <select
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none bg-white"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleChange}
                    min="1"
                    placeholder="1"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
              </div>

              {/* Physical Attributes Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Attributes</h3>
                
                {/* Dimensions Grid - 2x2 layout */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={product.height || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                        product.isBoxed 
                          ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {product.isBoxed && (
                      <div className="text-xs text-blue-600 mt-1">📦 Includes packaging</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                    <input
                      type="number"
                      name="width"
                      value={product.width || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                        product.isBoxed 
                          ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                    <input
                      type="number"
                      name="length"
                      value={product.length || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                        product.isBoxed 
                          ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={product.weight || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                        product.isBoxed 
                          ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {product.isBoxed && (
                      <div className="text-xs text-blue-600 mt-1">📦 Includes packaging weight</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Financials Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financials</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="purchasePrice"
                      value={product.purchasePrice || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g., 900.00"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resale Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="resalePrice"
                      value={product.resalePrice || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g., 1250.00"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                  </div>
                </div>
                
                {/* Profit Display */}
                <div className="mt-4 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-sm font-medium text-gray-700 mb-1">Potential Profit / unit</div>
                  <div className="text-2xl font-bold text-green-600">${calculateProfitPerUnit().toFixed(2)}</div>
                </div>
              </div>

              {/* Market Dynamics Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Dynamics</h3>
                
                {/* Days to Sell Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days to Sell (Turnover)</label>
                  <input
                    type="number"
                    name="daysToSell"
                    value={product.daysToSell}
                    onChange={handleChange}
                    min="1"
                    max="365"
                    placeholder="e.g., 7"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>

              </div>
            </div>
          </div>
        </form>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <Package className="h-4 w-4 mr-2" />
            Load Preset
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowSaveAsPreset(!showSaveAsPreset)}
              className="flex items-center px-4 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save as Preset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!product.name.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;