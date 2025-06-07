import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlobalConfig, Product, Container, Shipment } from '../types';
import { calculateShipmentScore, calculateProductScore } from '../utils/calculations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

interface AppContextType {
  config: GlobalConfig;
  updateConfig: (config: Partial<GlobalConfig>) => void;
  currentShipment: Shipment | null;
  savedShipments: Shipment[];
  createNewShipment: () => void;
  saveCurrentShipment: () => Promise<void>;
  loadShipment: (shipment: Shipment) => void;
  updateShipmentName: (name: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addContainer: (container: Omit<Container, 'id' | 'products'>) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  removeContainer: (id: string) => void;
  isPremiumUser: boolean;
  togglePremiumFeatures: () => void;
  // Premium features now available to all users
  dumpingPenalizerEnabled: boolean;
  toggleDumpingPenalizer: () => void;
  aiDimensionsEnabled: boolean;
  toggleAiDimensions: () => void;
  marketAnalysisEnabled: boolean;
  toggleMarketAnalysis: () => void;
}

const defaultConfig: GlobalConfig = {
  measurement: 'metric',
  currency: 'USD',
  language: 'en',
  showTooltips: true
};

const defaultShipment: Shipment = {
  id: uuidv4(),
  name: 'New Shipment',
  products: [],
  containers: [],
  createdAt: new Date(),
  isPremium: true // All shipments are now premium
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [savedShipments, setSavedShipments] = useState<Shipment[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(true); // Always premium now
  
  // Premium features state - now available to all users
  const [dumpingPenalizerEnabled, setDumpingPenalizerEnabled] = useState<boolean>(false);
  const [aiDimensionsEnabled, setAiDimensionsEnabled] = useState<boolean>(false);
  const [marketAnalysisEnabled, setMarketAnalysisEnabled] = useState<boolean>(false);

  // Load user settings when user changes
  useEffect(() => {
    if (!user) {
      setConfig(defaultConfig);
      return;
    }

    const loadUserSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading user settings:', error);
          return;
        }

        if (data) {
          setConfig({
            measurement: data.measurement,
            currency: data.currency,
            language: data.language,
            showTooltips: data.show_tooltips
          });
        } else {
          // Create default settings for new user
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              measurement: defaultConfig.measurement,
              currency: defaultConfig.currency,
              language: defaultConfig.language,
              show_tooltips: defaultConfig.showTooltips
            });

          if (insertError) {
            console.error('Error creating user settings:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in loadUserSettings:', error);
      }
    };

    loadUserSettings();
    loadSavedShipments();
  }, [user]);

  const loadSavedShipments = () => {
    // Mock saved shipments for demo - in real app this would load from database
    const mockShipments: Shipment[] = [
      {
        id: '1',
        name: 'Miami to Buenos Aires',
        products: [],
        containers: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isPremium: true
      },
      {
        id: '2',
        name: 'China to Mexico',
        products: [],
        containers: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isPremium: true
      },
      {
        id: '3',
        name: 'Europe Electronics',
        products: [],
        containers: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isPremium: true
      }
    ];
    setSavedShipments(mockShipments);
  };

  const updateConfig = async (newConfig: Partial<GlobalConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    if (user) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          measurement: updatedConfig.measurement,
          currency: updatedConfig.currency,
          language: updatedConfig.language,
          show_tooltips: updatedConfig.showTooltips
        });

      if (error) {
        console.error('Error updating user settings:', error);
      }
    }
  };

  const createNewShipment = () => {
    setCurrentShipment({
      ...defaultShipment,
      id: uuidv4(),
      createdAt: new Date()
    });
  };

  const saveCurrentShipment = async () => {
    if (!currentShipment) return;
    
    // In a real app, this would save to database
    const existingIndex = savedShipments.findIndex(s => s.id === currentShipment.id);
    if (existingIndex >= 0) {
      // Update existing shipment
      const updatedShipments = [...savedShipments];
      updatedShipments[existingIndex] = currentShipment;
      setSavedShipments(updatedShipments);
    } else {
      // Add new shipment
      setSavedShipments(prev => [currentShipment, ...prev]);
    }
  };

  const loadShipment = (shipment: Shipment) => {
    setCurrentShipment(shipment);
  };

  const updateShipmentName = (name: string) => {
    if (!currentShipment) return;
    setCurrentShipment(prev => prev ? { ...prev, name } : null);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!currentShipment) return;
    
    const newProduct: Product = {
      ...product,
      id: uuidv4()
    };
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      return {
        ...prev,
        products: [...prev.products, newProduct]
      };
    });
  };

  const updateProduct = (id: string, productUpdates: Partial<Product>) => {
    if (!currentShipment) return;
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      
      const updatedProducts = prev.products.map(product => 
        product.id === id ? { ...product, ...productUpdates } : product
      );
      
      if ('containerId' in productUpdates) {
        const updatedContainers = prev.containers.map(container => ({
          ...container,
          products: container.id === productUpdates.containerId
            ? [...container.products, id]
            : container.products.filter(pid => pid !== id)
        }));
        
        return {
          ...prev,
          products: updatedProducts,
          containers: updatedContainers
        };
      }
      
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const removeProduct = (id: string) => {
    if (!currentShipment) return;
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      
      const updatedContainers = prev.containers.map(container => ({
        ...container,
        products: container.products.filter(pid => pid !== id)
      }));
      
      return {
        ...prev,
        products: prev.products.filter(product => product.id !== id),
        containers: updatedContainers
      };
    });
  };

  const addContainer = (container: Omit<Container, 'id' | 'products'>) => {
    if (!currentShipment) return;
    
    const newContainer: Container = {
      ...container,
      id: uuidv4(),
      products: []
    };
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      return {
        ...prev,
        containers: [...prev.containers, newContainer]
      };
    });
  };

  const updateContainer = (id: string, containerUpdates: Partial<Container>) => {
    if (!currentShipment) return;
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        containers: prev.containers.map(container =>
          container.id === id ? { ...container, ...containerUpdates } : container
        )
      };
    });
  };

  const removeContainer = (id: string) => {
    if (!currentShipment) return;
    
    setCurrentShipment(prev => {
      if (!prev) return null;
      
      const updatedProducts = prev.products.map(product =>
        product.containerId === id ? { ...product, containerId: undefined } : product
      );
      
      return {
        ...prev,
        containers: prev.containers.filter(container => container.id !== id),
        products: updatedProducts
      };
    });
  };

  const togglePremiumFeatures = () => {
    setIsPremiumUser(prev => !prev);
  };

  const toggleDumpingPenalizer = () => {
    setDumpingPenalizerEnabled(prev => !prev);
  };

  const toggleAiDimensions = () => {
    setAiDimensionsEnabled(prev => !prev);
  };

  const toggleMarketAnalysis = () => {
    setMarketAnalysisEnabled(prev => !prev);
  };

  const contextValue: AppContextType = {
    config,
    updateConfig,
    currentShipment,
    savedShipments,
    createNewShipment,
    saveCurrentShipment,
    loadShipment,
    updateShipmentName,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    isPremiumUser,
    togglePremiumFeatures,
    // Premium features now available to all
    dumpingPenalizerEnabled,
    toggleDumpingPenalizer,
    aiDimensionsEnabled,
    toggleAiDimensions,
    marketAnalysisEnabled,
    toggleMarketAnalysis
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};