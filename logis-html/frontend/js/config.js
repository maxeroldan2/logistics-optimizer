// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Local storage keys
    STORAGE_KEYS: {
        TOKEN: 'logis_token',
        USER: 'logis_user',
        CURRENT_SHIPMENT: 'logis_current_shipment'
    },
    
    // Default values
    DEFAULTS: {
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
        DAYS_TO_SELL: 7,
        SUBSCRIPTION_TIER: 'free'
    },
    
    // Product icons mapping
    PRODUCT_ICONS: {
        'Package': '📦',
        'Smartphone': '📱',
        'Laptop': '💻',
        'Headphones': '🎧',
        'Camera': '📷',
        'Watch': '⌚',
        'Tablet': '📱',
        'Book': '📚',
        'Gaming': '🎮',
        'Fashion': '👕',
        'Beauty': '💄',
        'Home': '🏠',
        'Sports': '⚽',
        'Baby': '🍼',
        'Pet': '🐾'
    },
    
    // Product templates for quick setup
    PRODUCT_TEMPLATES: [
        {
            id: 'smartphone-premium',
            name: 'Smartphone de gama alta',
            category: 'technology',
            height: 15.0,
            width: 7.5,
            length: 0.8,
            weight: 0.187,
            estimatedPurchasePrice: 900,
            estimatedResalePrice: 1200,
            estimatedDaysToSell: 7,
            icon: 'Smartphone'
        },
        {
            id: 'laptop-business',
            name: 'Laptop profesional',
            category: 'technology',
            height: 31.3,
            width: 22.1,
            length: 1.55,
            weight: 1.6,
            estimatedPurchasePrice: 1800,
            estimatedResalePrice: 2400,
            estimatedDaysToSell: 14,
            icon: 'Laptop'
        },
        {
            id: 'airpods-pro',
            name: 'Auriculares Bluetooth',
            category: 'technology',
            height: 6.1,
            width: 4.5,
            length: 2.1,
            weight: 0.05,
            estimatedPurchasePrice: 180,
            estimatedResalePrice: 250,
            estimatedDaysToSell: 5,
            icon: 'Headphones'
        },
        {
            id: 'running-shoes',
            name: 'Zapatillas deportivas',
            category: 'fashion',
            height: 12.0,
            width: 35.0,
            length: 25.0,
            weight: 0.8,
            estimatedPurchasePrice: 80,
            estimatedResalePrice: 140,
            estimatedDaysToSell: 12,
            icon: 'Fashion'
        },
        {
            id: 'basic-tshirt',
            name: 'Camiseta básica',
            category: 'fashion',
            height: 2.0,
            width: 40.0,
            length: 30.0,
            weight: 0.2,
            estimatedPurchasePrice: 15,
            estimatedResalePrice: 35,
            estimatedDaysToSell: 8,
            icon: 'Fashion'
        }
    ],
    
    // Container templates
    CONTAINER_TEMPLATES: [
        {
            id: 'standard-box',
            name: 'Standard Box',
            height: 30.0,
            width: 40.0,
            length: 60.0,
            weightLimit: 25.0,
            icon: 'Package'
        },
        {
            id: 'large-container',
            name: 'Large Container',
            height: 50.0,
            width: 60.0,
            length: 80.0,
            weightLimit: 50.0,
            icon: 'Package'
        },
        {
            id: 'small-package',
            name: 'Small Package',
            height: 15.0,
            width: 20.0,
            length: 25.0,
            weightLimit: 5.0,
            icon: 'Package'
        }
    ]
};