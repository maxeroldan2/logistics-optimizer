// Template data for containers and products

import { ContainerTemplate } from '../types';

// 🏗️ Contenedores de Logística y Comercio Internacional
export const logisticsContainers: ContainerTemplate[] = [
  // Maritime containers
  {
    id: 'container-20ft-dry',
    name: 'Contenedor Dry Van 20 pies',
    category: 'logistics',
    height: 239, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 28080, // kg
    defaultShippingCost: 1500,
    defaultShippingDuration: 45,
    icon: 'Container'
  },
  {
    id: 'container-40ft-dry',
    name: 'Contenedor Dry Van 40 pies',
    category: 'logistics',
    height: 239, // cm
    width: 235, // cm
    length: 1203, // cm
    maxWeight: 28800, // kg
    defaultShippingCost: 2500,
    defaultShippingDuration: 45,
    icon: 'Container'
  },
  {
    id: 'container-40ft-hc',
    name: 'Contenedor High Cube 40 pies',
    category: 'logistics',
    height: 269, // cm
    width: 235, // cm
    length: 1203, // cm
    maxWeight: 28560, // kg
    defaultShippingCost: 3000,
    defaultShippingDuration: 45,
    icon: 'Container'
  },
  {
    id: 'container-open-top',
    name: 'Contenedor Open Top',
    category: 'logistics',
    height: 239, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 26500, // kg
    defaultShippingCost: 1800,
    defaultShippingDuration: 45,
    icon: 'Box'
  },
  {
    id: 'container-flat-rack',
    name: 'Contenedor Flat Rack',
    category: 'logistics',
    height: 196, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 45000, // kg
    defaultShippingCost: 2200,
    defaultShippingDuration: 50,
    icon: 'Truck'
  },
  {
    id: 'container-reefer',
    name: 'Contenedor Reefer (Refrigerado)',
    category: 'logistics',
    height: 229, // cm
    width: 225, // cm
    length: 557, // cm
    maxWeight: 27700, // kg
    defaultShippingCost: 4500,
    defaultShippingDuration: 45,
    icon: 'Zap'
  },
  {
    id: 'container-isothermic',
    name: 'Contenedor Isotérmico',
    category: 'logistics',
    height: 235, // cm
    width: 230, // cm
    length: 580, // cm
    maxWeight: 26000, // kg
    defaultShippingCost: 3200,
    defaultShippingDuration: 45,
    icon: 'Target'
  },
  {
    id: 'container-tank',
    name: 'Contenedor Tanque (Tank Container)',
    category: 'logistics',
    height: 259, // cm
    width: 244, // cm
    length: 605, // cm
    maxWeight: 36000, // kg
    defaultShippingCost: 5000,
    defaultShippingDuration: 50,
    icon: 'Coffee'
  },
  {
    id: 'container-bulk',
    name: 'Contenedor de Carga a Granel',
    category: 'logistics',
    height: 239, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 30000, // kg
    defaultShippingCost: 2800,
    defaultShippingDuration: 45,
    icon: 'Box'
  },
  {
    id: 'container-half-height',
    name: 'Contenedor Half Height',
    category: 'logistics',
    height: 132, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 45000, // kg
    defaultShippingCost: 2000,
    defaultShippingDuration: 45,
    icon: 'Container'
  },
  {
    id: 'container-pallet-wide',
    name: 'Contenedor Pallet Wide',
    category: 'logistics',
    height: 239, // cm
    width: 244, // cm
    length: 590, // cm
    maxWeight: 28000, // kg
    defaultShippingCost: 1700,
    defaultShippingDuration: 45,
    icon: 'Package'
  },
  {
    id: 'container-wire',
    name: 'Contenedor de Malla (Wire Container)',
    category: 'logistics',
    height: 180, // cm
    width: 120, // cm
    length: 100, // cm
    maxWeight: 1500, // kg
    defaultShippingCost: 200,
    defaultShippingDuration: 15,
    icon: 'Target'
  },
  {
    id: 'triple-wall-box',
    name: 'Caja de Cartón Reforzada (Triple Wall)',
    category: 'logistics',
    height: 60, // cm
    width: 40, // cm
    length: 40, // cm
    maxWeight: 50, // kg
    defaultShippingCost: 80,
    defaultShippingDuration: 7,
    icon: 'Box'
  },
  {
    id: 'container-foldable',
    name: 'Contenedor Plegable',
    category: 'logistics',
    height: 239, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 25000, // kg
    defaultShippingCost: 1600,
    defaultShippingDuration: 45,
    icon: 'Package'
  },
  {
    id: 'container-roro',
    name: 'Contenedor Roll-on/Roll-off (RoRo)',
    category: 'logistics',
    height: 400, // cm
    width: 250, // cm
    length: 1200, // cm
    maxWeight: 40000, // kg
    defaultShippingCost: 6000,
    defaultShippingDuration: 60,
    icon: 'Car'
  },
  {
    id: 'uld-container',
    name: 'Contenedor de Carga Aérea (ULD)',
    category: 'logistics',
    height: 162, // cm
    width: 244, // cm
    length: 318, // cm
    maxWeight: 6800, // kg
    defaultShippingCost: 8000,
    defaultShippingDuration: 3,
    icon: 'Plane'
  }
];

// 🧳 Contenedores Personales y para Viaje
export const personalContainers: ContainerTemplate[] = [
  {
    id: 'hard-shell-suitcase',
    name: 'Valija Rígida con Ruedas',
    category: 'personal',
    height: 75, // cm
    width: 50, // cm
    length: 30, // cm
    maxWeight: 23, // kg
    defaultShippingCost: 35,
    defaultShippingDuration: 1,
    icon: 'Luggage'
  },
  {
    id: 'soft-shell-suitcase',
    name: 'Valija Blanda Expandible',
    category: 'personal',
    height: 70, // cm
    width: 45, // cm
    length: 28, // cm
    maxWeight: 20, // kg
    defaultShippingCost: 30,
    defaultShippingDuration: 1,
    icon: 'Luggage'
  },
  {
    id: 'carry-on-luggage',
    name: 'Carry-on (Equipaje de Cabina)',
    category: 'personal',
    height: 55, // cm
    width: 40, // cm
    length: 23, // cm
    maxWeight: 10, // kg
    defaultShippingCost: 0,
    defaultShippingDuration: 1,
    icon: 'Briefcase'
  },
  {
    id: 'organizer-suitcase',
    name: 'Valija con Compartimentos Organizadores',
    category: 'personal',
    height: 68, // cm
    width: 48, // cm
    length: 26, // cm
    maxWeight: 22, // kg
    defaultShippingCost: 32,
    defaultShippingDuration: 1,
    icon: 'Luggage'
  },
  {
    id: 'duffel-bag',
    name: 'Bolso de Viaje tipo Duffel',
    category: 'personal',
    height: 30, // cm
    width: 60, // cm
    length: 30, // cm
    maxWeight: 15, // kg
    defaultShippingCost: 25,
    defaultShippingDuration: 1,
    icon: 'Backpack'
  },
  {
    id: 'canvas-crossbody',
    name: 'Bolso de Lona con Correa Cruzada',
    category: 'personal',
    height: 25, // cm
    width: 35, // cm
    length: 15, // cm
    maxWeight: 5, // kg
    defaultShippingCost: 15,
    defaultShippingDuration: 1,
    icon: 'Shopping Bag'
  },
  {
    id: 'weekender-bag',
    name: 'Bolso de Fin de Semana',
    category: 'personal',
    height: 30, // cm
    width: 45, // cm
    length: 25, // cm
    maxWeight: 12, // kg
    defaultShippingCost: 20,
    defaultShippingDuration: 1,
    icon: 'Shopping Bag'
  },
  {
    id: 'foldable-bag',
    name: 'Bolso Plegable o Compactable',
    category: 'personal',
    height: 35, // cm
    width: 40, // cm
    length: 20, // cm
    maxWeight: 8, // kg
    defaultShippingCost: 18,
    defaultShippingDuration: 1,
    icon: 'Package'
  },
  {
    id: 'tactical-backpack',
    name: 'Mochila Táctica',
    category: 'personal',
    height: 55, // cm
    width: 35, // cm
    length: 25, // cm
    maxWeight: 18, // kg
    defaultShippingCost: 28,
    defaultShippingDuration: 1,
    icon: 'Backpack'
  },
  {
    id: 'laptop-travel-backpack',
    name: 'Mochila de Viaje con Compartimento Laptop',
    category: 'personal',
    height: 50, // cm
    width: 32, // cm
    length: 22, // cm
    maxWeight: 15, // kg
    defaultShippingCost: 25,
    defaultShippingDuration: 1,
    icon: 'Backpack'
  },
  {
    id: 'wheeled-backpack',
    name: 'Mochila con Ruedas',
    category: 'personal',
    height: 45, // cm
    width: 35, // cm
    length: 25, // cm
    maxWeight: 12, // kg
    defaultShippingCost: 22,
    defaultShippingDuration: 1,
    icon: 'Backpack'
  },
  {
    id: 'wheeled-toolbox',
    name: 'Caja de Herramientas con Ruedas',
    category: 'personal',
    height: 40, // cm
    width: 50, // cm
    length: 30, // cm
    maxWeight: 25, // kg
    defaultShippingCost: 35,
    defaultShippingDuration: 1,
    icon: 'Briefcase'
  },
  {
    id: 'pelican-case',
    name: 'Estuche Rígido tipo Pelican',
    category: 'personal',
    height: 20, // cm
    width: 40, // cm
    length: 30, // cm
    maxWeight: 15, // kg
    defaultShippingCost: 40,
    defaultShippingDuration: 1,
    icon: 'Box'
  },
  {
    id: 'vintage-trunk',
    name: 'Baúl de Viaje Estilo Militar/Vintage',
    category: 'personal',
    height: 40, // cm
    width: 80, // cm
    length: 50, // cm
    maxWeight: 30, // kg
    defaultShippingCost: 50,
    defaultShippingDuration: 2,
    icon: 'Box'
  },
  {
    id: 'large-plastic-box',
    name: 'Caja de Plástico con Tapa (Tupper Grande)',
    category: 'personal',
    height: 30, // cm
    width: 60, // cm
    length: 40, // cm
    maxWeight: 20, // kg
    defaultShippingCost: 25,
    defaultShippingDuration: 1,
    icon: 'Box'
  }
];

// International shipping boxes (keeping existing ones)
export const internationalBoxes: ContainerTemplate[] = [
  {
    id: 'box-corrugated-a6',
    name: 'Corrugated Box A6',
    category: 'international',
    height: 30, // cm
    width: 40, // cm
    length: 60, // cm
    maxWeight: 25, // kg
    defaultShippingCost: 50,
    defaultShippingDuration: 10,
    icon: 'Box'
  },
  {
    id: 'box-usps',
    name: 'USPS Large Flat Rate Box',
    category: 'international',
    height: 30.48, // cm
    width: 30.48, // cm
    length: 12.7, // cm
    maxWeight: 9.07, // kg (20 lbs)
    defaultShippingCost: 21.50,
    defaultShippingDuration: 7,
    icon: 'Package'
  },
  {
    id: 'box-amazon-fba',
    name: 'Amazon FBA Standard',
    category: 'international',
    height: 45, // cm
    width: 34, // cm
    length: 26, // cm
    maxWeight: 22.68, // kg (50 lbs)
    defaultShippingCost: 15,
    defaultShippingDuration: 5,
    icon: 'Shopping Cart'
  },
  {
    id: 'box-dhl',
    name: 'DHL Express Box',
    category: 'international',
    height: 33.7, // cm
    width: 32.2, // cm
    length: 5.2, // cm
    maxWeight: 2, // kg
    defaultShippingCost: 45,
    defaultShippingDuration: 3,
    icon: 'Plane'
  }
];

// Air shipping (keeping existing ones)
export const airShipping: ContainerTemplate[] = [
  {
    id: 'air-dhl-express',
    name: 'DHL Express',
    category: 'air',
    height: 40, // cm
    width: 30, // cm
    length: 20, // cm
    maxWeight: 30, // kg
    defaultShippingCost: 120,
    defaultShippingDuration: 2,
    icon: 'Plane'
  },
  {
    id: 'air-fedex',
    name: 'FedEx International',
    category: 'air',
    height: 45, // cm
    width: 35, // cm
    length: 25, // cm
    maxWeight: 68, // kg
    defaultShippingCost: 150,
    defaultShippingDuration: 3,
    icon: 'Plane'
  },
  {
    id: 'air-iata',
    name: 'IATA Standard',
    category: 'air',
    height: 50, // cm
    width: 40, // cm
    length: 30, // cm
    maxWeight: 45, // kg
    defaultShippingCost: 200,
    defaultShippingDuration: 4,
    icon: 'Plane'
  }
];

// Export all templates
export const allContainerTemplates: ContainerTemplate[] = [
  ...logisticsContainers,
  ...personalContainers,
  ...internationalBoxes,
  ...airShipping
];

// Helper to find a template by ID
export const getTemplateById = (id: string): ContainerTemplate | undefined => {
  return allContainerTemplates.find(template => template.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): ContainerTemplate[] => {
  return allContainerTemplates.filter(template => template.category === category);
};

// Get all categories
export const getContainerCategories = (): string[] => {
  return [...new Set(allContainerTemplates.map(template => template.category))];
};

// Category display names with emojis
export const categoryDisplayNames: Record<string, string> = {
  logistics: '🏗️ Contenedores de Logística y Comercio Internacional',
  personal: '🧳 Contenedores Personales y para Viaje',
  international: '📦 Envíos Internacionales',
  air: '✈️ Transporte Aéreo'
};

// Transport type classification
export const getContainersByTransportType = (transportType: 'maritime' | 'air' | 'land') => {
  const maritimeIds = [
    'container-20ft-dry', 'container-40ft-dry', 'container-40ft-hc', 
    'container-open-top', 'container-flat-rack', 'container-reefer',
    'container-isothermic', 'container-tank', 'container-bulk',
    'container-half-height', 'container-pallet-wide', 'container-foldable',
    'container-roro'
  ];
  
  const airIds = [
    'uld-container', 'air-dhl-express', 'air-fedex', 'air-iata',
    'box-dhl', 'pelican-case'
  ];
  
  const landIds = [
    'triple-wall-box', 'container-wire', 'wheeled-toolbox',
    'large-plastic-box', 'box-corrugated-a6', 'box-amazon-fba'
  ];
  
  let targetIds: string[] = [];
  
  switch (transportType) {
    case 'maritime':
      targetIds = maritimeIds;
      break;
    case 'air':
      targetIds = airIds;
      break;
    case 'land':
      targetIds = landIds;
      break;
  }
  
  return allContainerTemplates.filter(template => targetIds.includes(template.id));
};

// Thermal protection classification
export const getContainersByThermalProtection = (hasProtection: boolean) => {
  const thermalProtectionIds = ['container-reefer', 'container-isothermic'];
  
  if (hasProtection) {
    return allContainerTemplates.filter(template => thermalProtectionIds.includes(template.id));
  } else {
    return allContainerTemplates.filter(template => !thermalProtectionIds.includes(template.id));
  }
};

// Capacity classification
export const getContainersByCapacity = (capacityRange: 'small' | 'medium' | 'large' | 'extra-large') => {
  return allContainerTemplates.filter(template => {
    const volume = template.height * template.width * template.length;
    
    switch (capacityRange) {
      case 'small':
        return volume < 50000; // Less than 0.05 m³
      case 'medium':
        return volume >= 50000 && volume < 500000; // 0.05 - 0.5 m³
      case 'large':
        return volume >= 500000 && volume < 5000000; // 0.5 - 5 m³
      case 'extra-large':
        return volume >= 5000000; // More than 5 m³
      default:
        return true;
    }
  });
};

// Pallet compatibility
export const getPalletCompatibleContainers = () => {
  const palletCompatibleIds = [
    'container-20ft-dry', 'container-40ft-dry', 'container-40ft-hc',
    'container-pallet-wide', 'container-reefer', 'container-isothermic'
  ];
  
  return allContainerTemplates.filter(template => palletCompatibleIds.includes(template.id));
};

// IATA/IMO compliance
export const getComplianceContainers = (standard: 'IATA' | 'IMO') => {
  const iataCompliantIds = [
    'uld-container', 'air-dhl-express', 'air-fedex', 'air-iata',
    'box-dhl', 'pelican-case'
  ];
  
  const imoCompliantIds = [
    'container-20ft-dry', 'container-40ft-dry', 'container-40ft-hc',
    'container-open-top', 'container-flat-rack', 'container-reefer',
    'container-isothermic', 'container-tank', 'container-bulk',
    'container-half-height', 'container-pallet-wide', 'container-foldable',
    'container-roro'
  ];
  
  const targetIds = standard === 'IATA' ? iataCompliantIds : imoCompliantIds;
  
  return allContainerTemplates.filter(template => targetIds.includes(template.id));
};