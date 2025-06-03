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
  createNewShipment: () => void;
  updateShipmentName: (name: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addContainer: (container: Omit<Container, 'id' | 'products'>) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  removeContainer: (id: string) => void;
  isPremiumUser: boolean;
  togglePremiumFeatures: () => void;
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
  isPremium: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

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
            showTooltips: data.show_tooltips // Changed from showTooltips to show_tooltips
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
              show_tooltips: defaultConfig.showTooltips // Changed from showTooltips to show_tooltips
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
  }, [user]);

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
          show_tooltips: updatedConfig.showTooltips // Changed from showTooltips to show_tooltips
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

  const contextValue: AppContextType = {
    config,
    updateConfig,
    currentShipment,
    createNewShipment,
    updateShipmentName,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    isPremiumUser,
    togglePremiumFeatures
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