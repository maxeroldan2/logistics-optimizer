export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  height: number; // cm
  width: number; // cm
  length: number; // cm
  weight: number; // kg
  estimatedPurchasePrice: number; // USD
  estimatedResalePrice: number; // USD
  estimatedDaysToSell: number;
  isBoxed: boolean;
}

// 🔌 Tecnología y Electrónica
export const technologyProducts: ProductTemplate[] = [
  {
    id: 'airpods-wireless',
    name: 'Auriculares Inalámbricos (AirPods)',
    category: 'technology',
    icon: 'Headphones',
    height: 4.5,
    width: 6.0,
    length: 2.5,
    weight: 0.05,
    estimatedPurchasePrice: 25,
    estimatedResalePrice: 45,
    estimatedDaysToSell: 5,
    isBoxed: true
  },
  {
    id: 'power-bank',
    name: 'Cargador Portátil (Power Bank)',
    category: 'technology',
    icon: 'Zap',
    height: 2.0,
    width: 7.0,
    length: 14.0,
    weight: 0.3,
    estimatedPurchasePrice: 15,
    estimatedResalePrice: 30,
    estimatedDaysToSell: 7,
    isBoxed: true
  },
  {
    id: 'phone-case',
    name: 'Funda para Móvil',
    category: 'technology',
    icon: 'Phone',
    height: 1.0,
    width: 8.0,
    length: 16.0,
    weight: 0.05,
    estimatedPurchasePrice: 3,
    estimatedResalePrice: 12,
    estimatedDaysToSell: 3,
    isBoxed: false
  },
  {
    id: 'smartwatch',
    name: 'Smartwatch',
    category: 'technology',
    icon: 'Watch',
    height: 4.5,
    width: 4.5,
    length: 1.5,
    weight: 0.08,
    estimatedPurchasePrice: 35,
    estimatedResalePrice: 70,
    estimatedDaysToSell: 8,
    isBoxed: true
  },
  {
    id: 'led-lights',
    name: 'Luces LED Decorativas',
    category: 'technology',
    icon: 'Zap',
    height: 3.0,
    width: 15.0,
    length: 20.0,
    weight: 0.2,
    estimatedPurchasePrice: 8,
    estimatedResalePrice: 18,
    estimatedDaysToSell: 10,
    isBoxed: true
  },
  {
    id: 'mini-speaker',
    name: 'Mini Altavoz Bluetooth',
    category: 'technology',
    icon: 'Headphones',
    height: 6.0,
    width: 6.0,
    length: 6.0,
    weight: 0.25,
    estimatedPurchasePrice: 12,
    estimatedResalePrice: 25,
    estimatedDaysToSell: 6,
    isBoxed: true
  }
];

// 🧴 Belleza y Cuidado Personal
export const beautyProducts: ProductTemplate[] = [
  {
    id: 'makeup-foundation',
    name: 'Base de Maquillaje',
    category: 'beauty',
    icon: 'Heart',
    height: 12.0,
    width: 3.5,
    length: 3.5,
    weight: 0.08,
    estimatedPurchasePrice: 8,
    estimatedResalePrice: 20,
    estimatedDaysToSell: 12,
    isBoxed: true
  },
  {
    id: 'hair-straightener',
    name: 'Cepillo Alisador de Pelo',
    category: 'beauty',
    icon: 'Zap',
    height: 5.0,
    width: 8.0,
    length: 25.0,
    weight: 0.4,
    estimatedPurchasePrice: 20,
    estimatedResalePrice: 45,
    estimatedDaysToSell: 15,
    isBoxed: true
  },
  {
    id: 'facial-serum',
    name: 'Sérum Facial Antiedad',
    category: 'beauty',
    icon: 'Heart',
    height: 10.0,
    width: 3.0,
    length: 3.0,
    weight: 0.05,
    estimatedPurchasePrice: 12,
    estimatedResalePrice: 35,
    estimatedDaysToSell: 20,
    isBoxed: true
  },
  {
    id: 'nail-kit',
    name: 'Kit de Uñas',
    category: 'beauty',
    icon: 'Star',
    height: 3.0,
    width: 15.0,
    length: 20.0,
    weight: 0.15,
    estimatedPurchasePrice: 10,
    estimatedResalePrice: 25,
    estimatedDaysToSell: 14,
    isBoxed: true
  }
];

// 👕 Ropa y Accesorios
export const clothingProducts: ProductTemplate[] = [
  {
    id: 'athletic-leggings',
    name: 'Leggings Deportivos',
    category: 'clothing',
    icon: 'Shirt',
    height: 2.0,
    width: 25.0,
    length: 30.0,
    weight: 0.2,
    estimatedPurchasePrice: 8,
    estimatedResalePrice: 22,
    estimatedDaysToSell: 10,
    isBoxed: false
  },
  {
    id: 'sports-cap',
    name: 'Gorra Deportiva',
    category: 'clothing',
    icon: 'Crown',
    height: 12.0,
    width: 20.0,
    length: 25.0,
    weight: 0.15,
    estimatedPurchasePrice: 5,
    estimatedResalePrice: 15,
    estimatedDaysToSell: 8,
    isBoxed: false
  },
  {
    id: 'sunglasses',
    name: 'Gafas de Sol',
    category: 'clothing',
    icon: 'Star',
    height: 5.0,
    width: 15.0,
    length: 18.0,
    weight: 0.08,
    estimatedPurchasePrice: 6,
    estimatedResalePrice: 18,
    estimatedDaysToSell: 12,
    isBoxed: true
  },
  {
    id: 'casual-sneakers',
    name: 'Zapatillas Casuales',
    category: 'clothing',
    icon: 'Target',
    height: 12.0,
    width: 20.0,
    length: 32.0,
    weight: 0.8,
    estimatedPurchasePrice: 25,
    estimatedResalePrice: 55,
    estimatedDaysToSell: 18,
    isBoxed: true
  },
  {
    id: 'backpack',
    name: 'Mochila Funcional',
    category: 'clothing',
    icon: 'Backpack',
    height: 45.0,
    width: 30.0,
    length: 15.0,
    weight: 0.6,
    estimatedPurchasePrice: 18,
    estimatedResalePrice: 40,
    estimatedDaysToSell: 15,
    isBoxed: false
  }
];

// 🛋️ Hogar y Decoración
export const homeProducts: ProductTemplate[] = [
  {
    id: 'led-lamp',
    name: 'Lámpara LED Decorativa',
    category: 'home',
    icon: 'Zap',
    height: 25.0,
    width: 15.0,
    length: 15.0,
    weight: 0.5,
    estimatedPurchasePrice: 15,
    estimatedResalePrice: 35,
    estimatedDaysToSell: 20,
    isBoxed: true
  },
  {
    id: 'organizer-box',
    name: 'Organizador Multiuso',
    category: 'home',
    icon: 'Box',
    height: 15.0,
    width: 25.0,
    length: 35.0,
    weight: 0.8,
    estimatedPurchasePrice: 12,
    estimatedResalePrice: 28,
    estimatedDaysToSell: 25,
    isBoxed: false
  },
  {
    id: 'aroma-diffuser',
    name: 'Difusor de Aromas',
    category: 'home',
    icon: 'Coffee',
    height: 15.0,
    width: 12.0,
    length: 12.0,
    weight: 0.4,
    estimatedPurchasePrice: 20,
    estimatedResalePrice: 45,
    estimatedDaysToSell: 30,
    isBoxed: true
  },
  {
    id: 'kitchen-utensils',
    name: 'Utensilios de Cocina Innovadores',
    category: 'home',
    icon: 'Target',
    height: 8.0,
    width: 20.0,
    length: 25.0,
    weight: 0.3,
    estimatedPurchasePrice: 10,
    estimatedResalePrice: 25,
    estimatedDaysToSell: 22,
    isBoxed: true
  }
];

// 🧸 Bebés y Niños
export const babyProducts: ProductTemplate[] = [
  {
    id: 'educational-toy',
    name: 'Juguete Didáctico',
    category: 'baby',
    icon: 'Gift',
    height: 10.0,
    width: 15.0,
    length: 20.0,
    weight: 0.3,
    estimatedPurchasePrice: 8,
    estimatedResalePrice: 20,
    estimatedDaysToSell: 15,
    isBoxed: true
  },
  {
    id: 'baby-clothes',
    name: 'Bodies para Bebés',
    category: 'baby',
    icon: 'Heart',
    height: 2.0,
    width: 20.0,
    length: 25.0,
    weight: 0.1,
    estimatedPurchasePrice: 5,
    estimatedResalePrice: 15,
    estimatedDaysToSell: 12,
    isBoxed: false
  },
  {
    id: 'feeding-accessories',
    name: 'Accesorios de Alimentación',
    category: 'baby',
    icon: 'Coffee',
    height: 8.0,
    width: 12.0,
    length: 15.0,
    weight: 0.2,
    estimatedPurchasePrice: 12,
    estimatedResalePrice: 28,
    estimatedDaysToSell: 18,
    isBoxed: true
  }
];

// 🏋️ Fitness y Salud
export const fitnessProducts: ProductTemplate[] = [
  {
    id: 'resistance-bands',
    name: 'Bandas de Resistencia',
    category: 'fitness',
    icon: 'Target',
    height: 2.0,
    width: 15.0,
    length: 20.0,
    weight: 0.3,
    estimatedPurchasePrice: 8,
    estimatedResalePrice: 20,
    estimatedDaysToSell: 14,
    isBoxed: true
  },
  {
    id: 'smart-water-bottle',
    name: 'Botella Inteligente',
    category: 'fitness',
    icon: 'Zap',
    height: 25.0,
    width: 8.0,
    length: 8.0,
    weight: 0.4,
    estimatedPurchasePrice: 18,
    estimatedResalePrice: 40,
    estimatedDaysToSell: 20,
    isBoxed: true
  },
  {
    id: 'posture-corrector',
    name: 'Corrector de Postura',
    category: 'fitness',
    icon: 'Target',
    height: 3.0,
    width: 25.0,
    length: 30.0,
    weight: 0.2,
    estimatedPurchasePrice: 12,
    estimatedResalePrice: 30,
    estimatedDaysToSell: 25,
    isBoxed: true
  }
];

// 🐶 Mascotas
export const petProducts: ProductTemplate[] = [
  {
    id: 'interactive-toy',
    name: 'Juguete Interactivo para Mascotas',
    category: 'pets',
    icon: 'Heart',
    height: 8.0,
    width: 12.0,
    length: 15.0,
    weight: 0.25,
    estimatedPurchasePrice: 10,
    estimatedResalePrice: 25,
    estimatedDaysToSell: 16,
    isBoxed: true
  },
  {
    id: 'automatic-feeder',
    name: 'Comedero Automático',
    category: 'pets',
    icon: 'Coffee',
    height: 20.0,
    width: 25.0,
    length: 30.0,
    weight: 1.2,
    estimatedPurchasePrice: 35,
    estimatedResalePrice: 75,
    estimatedDaysToSell: 30,
    isBoxed: true
  },
  {
    id: 'pet-bed',
    name: 'Cama para Mascotas',
    category: 'pets',
    icon: 'Heart',
    height: 15.0,
    width: 50.0,
    length: 60.0,
    weight: 1.0,
    estimatedPurchasePrice: 20,
    estimatedResalePrice: 45,
    estimatedDaysToSell: 25,
    isBoxed: false
  }
];

// Export all templates
export const allProductTemplates: ProductTemplate[] = [
  ...technologyProducts,
  ...beautyProducts,
  ...clothingProducts,
  ...homeProducts,
  ...babyProducts,
  ...fitnessProducts,
  ...petProducts
];

// Helper to find a template by ID
export const getProductTemplateById = (id: string): ProductTemplate | undefined => {
  return allProductTemplates.find(template => template.id === id);
};

// Get templates by category
export const getProductTemplatesByCategory = (category: string): ProductTemplate[] => {
  return allProductTemplates.filter(template => template.category === category);
};

// Get all categories
export const getProductCategories = (): string[] => {
  return [...new Set(allProductTemplates.map(template => template.category))];
};

// Category display names with emojis
export const categoryDisplayNames: Record<string, string> = {
  technology: '🔌 Tecnología y Electrónica',
  beauty: '🧴 Belleza y Cuidado Personal',
  clothing: '👕 Ropa y Accesorios',
  home: '🛋️ Hogar y Decoración',
  baby: '🧸 Bebés y Niños',
  fitness: '🏋️ Fitness y Salud',
  pets: '🐶 Mascotas'
};