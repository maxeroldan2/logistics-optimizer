import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlobalConfig, Product, Container, Shipment, UserSubscription, FeatureLimits, FREE_LIMITS, PREMIUM_LIMITS, SubscriptionTier } from '../types';
// Removed unused calculation imports
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
  updateShipment: (updates: {
    name?: string;
    description?: string;
    folderId?: string;
    shippingDate?: string;
  }) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addContainer: (container: Omit<Container, 'id' | 'products'>) => void;
  updateContainer: (id: string, container: Partial<Container>) => void;
  removeContainer: (id: string) => void;
  // Subscription management
  subscription: UserSubscription | null;
  subscriptionTier: SubscriptionTier;
  featureLimits: FeatureLimits;
  isFeatureAvailable: (feature: keyof FeatureLimits) => boolean;
  canCreateShipment: () => boolean;
  canAddProduct: () => boolean;
  canAddContainer: () => boolean;
  // Legacy support - computed from subscription
  isPremiumUser: boolean;
  // Premium features with restrictions
  dumpingPenalizerEnabled: boolean;
  toggleDumpingPenalizer: () => void;
  aiDimensionsEnabled: boolean;
  toggleAiDimensions: () => void;
  marketAnalysisEnabled: boolean;
  toggleMarketAnalysis: () => void;
  // Development mode functions
  toggleSubscriptionTier: () => void;
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
  
  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  
  // Feature limits based on subscription - memoized for performance
  const featureLimits = useMemo(() => 
    subscriptionTier === 'premium' ? PREMIUM_LIMITS : FREE_LIMITS,
    [subscriptionTier]
  );
  const isPremiumUser = useMemo(() => 
    subscriptionTier === 'premium',
    [subscriptionTier]
  );
  
  // Premium features state - restricted by subscription
  const [dumpingPenalizerEnabled, setDumpingPenalizerEnabled] = useState<boolean>(false);
  const [aiDimensionsEnabled, setAiDimensionsEnabled] = useState<boolean>(false);
  const [marketAnalysisEnabled, setMarketAnalysisEnabled] = useState<boolean>(false);

  // Define loadSavedShipments first before it's used in any useEffect
  const loadSavedShipments = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📦 Loading saved shipments...');
      
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        console.log('📝 Loading shipments from localStorage (placeholder mode)');
        
        // Load saved shipments from localStorage
        const savedShipmentsKey = `savedShipments_${user.id}`;
        const savedData = localStorage.getItem(savedShipmentsKey);
        
        if (savedData) {
          try {
            const parsedShipments = JSON.parse(savedData);
            // Convert date strings back to Date objects
            const shipmentsWithDates = parsedShipments.map((shipment: Omit<Shipment, 'createdAt'> & { createdAt: string }) => ({
              ...shipment,
              createdAt: new Date(shipment.createdAt)
            }));
            // Sort by created date descending (most recent first)
            const sortedShipments = shipmentsWithDates.sort((a: Shipment, b: Shipment) => b.createdAt.getTime() - a.createdAt.getTime());
            console.log(`📋 Found ${sortedShipments.length} saved shipments in localStorage`);
            setSavedShipments(sortedShipments);
          } catch (error) {
            console.error('Error parsing saved shipments from localStorage:', error);
            setSavedShipments([]);
          }
        } else {
          console.log('📝 No saved shipments found, using empty list');
          setSavedShipments([]);
        }
        return;
      }

      // Load shipments from Supabase
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading shipments:', error);
        return;
      }

      if (data) {
        // Convert Supabase data to Shipment objects
        // Note: isPremium will be updated when subscriptionTier changes
        const shipments: Shipment[] = data.map(row => ({
          id: row.id,
          name: row.name,
          folderId: row.folder_id,
          products: row.products || [],
          containers: row.containers || [],
          createdAt: new Date(row.created_at),
          isPremium: false  // Will be updated in a separate effect
        }));

        setSavedShipments(shipments);
        console.log(`✅ Loaded ${shipments.length} shipments from database`);
      }
    } catch (error) {
      console.error('❌ Failed to load shipments:', error);
    }
  }, [user]);  // Removed subscriptionTier dependency to break infinite loop

  // Load subscription data when user changes
  useEffect(() => {
    if (!user) {
      setConfig(defaultConfig);
      setSubscription(null);
      setSubscriptionTier('free');
      setSubscriptionLoading(false);
      return;
    }

    const loadSubscriptionData = async () => {
      try {
        setSubscriptionLoading(true);
        
        // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
        const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                             import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
        const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
        const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
        
        if (isPlaceholder || isMockAuth || forceLocalStorage) {
          // For development or mock auth, default to premium tier for full functionality testing
          console.log('🚀 Mock auth mode: Using premium tier for testing');
          setSubscription(null);
          setSubscriptionTier('premium');
          setSubscriptionLoading(false);
          return;
        }
        
        // Load subscription data
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subError && subError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error loading subscription:', subError);
        }

        if (subData) {
          setSubscription({
            ...subData,
            currentPeriodStart: new Date(subData.current_period_start),
            currentPeriodEnd: new Date(subData.current_period_end),
            createdAt: new Date(subData.created_at),
            updatedAt: new Date(subData.updated_at),
          });
          setSubscriptionTier(subData.tier || 'free');
        } else {
          setSubscription(null);
          setSubscriptionTier('free');
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setSubscription(null);
        setSubscriptionTier('free');
      } finally {
        setSubscriptionLoading(false);
      }
    };

    const loadUserSettings = async () => {
      try {
        // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
        const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                             import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
        const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
        const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
        
        if (isPlaceholder || isMockAuth || forceLocalStorage) {
          // For development or mock auth, use default config and localStorage
          console.log('📝 Using localStorage for user settings (mock auth mode)');
          const settingsKey = `userSettings_${user.id}`;
          const savedSettings = localStorage.getItem(settingsKey);
          
          if (savedSettings) {
            try {
              const parsedSettings = JSON.parse(savedSettings);
              setConfig(parsedSettings);
            } catch {
              setConfig(defaultConfig);
              localStorage.setItem(settingsKey, JSON.stringify(defaultConfig));
            }
          } else {
            setConfig(defaultConfig);
            localStorage.setItem(settingsKey, JSON.stringify(defaultConfig));
          }
          return;
        }

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
          // Update existing settings with defaults (record already created by trigger)
          const { error: updateError } = await supabase
            .from('user_settings')
            .update({
              measurement: defaultConfig.measurement,
              currency: defaultConfig.currency,
              language: defaultConfig.language,
              show_tooltips: defaultConfig.showTooltips
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating user settings:', updateError);
          }
        }
      } catch (error) {
        console.error('Error in loadUserSettings:', error);
      }
    };

    loadSubscriptionData();
    loadUserSettings();
    loadSavedShipments();
  }, [user]);  // Removed loadSavedShipments dependency to break loop

  // Update isPremium flag when subscription tier changes
  useEffect(() => {
    if (savedShipments.length > 0) {
      const isPremium = subscriptionTier === 'premium';
      const needsUpdate = savedShipments.some(shipment => shipment.isPremium !== isPremium);
      
      if (needsUpdate) {
        const updatedShipments = savedShipments.map(shipment => ({
          ...shipment,
          isPremium
        }));
        setSavedShipments(updatedShipments);
      }
    }
  }, [subscriptionTier, savedShipments]);  // Only update when actually needed

  // Initialize shipment - load most recent or create new for first-time users

  useEffect(() => {
    if (user && !subscriptionLoading && !currentShipment) {
      if (savedShipments.length > 0) {
        // Load the most recent shipment (first in array since they're sorted by created_at desc)
        const mostRecentShipment = savedShipments[0];
        console.log(`📂 Loading most recent shipment: "${mostRecentShipment.name}"`);
        setCurrentShipment(mostRecentShipment);
      } else {
        // Create default shipment only for completely new users
        console.log('🚀 Initializing default shipment for new user');
        setCurrentShipment({
          ...defaultShipment,
          id: uuidv4(),
          createdAt: new Date()
        });
      }
    }
  }, [user, subscriptionLoading, currentShipment, savedShipments]);

  const updateConfig = useCallback(async (newConfig: Partial<GlobalConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    if (user) {
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        // Save to localStorage for mock auth
        const settingsKey = `userSettings_${user.id}`;
        localStorage.setItem(settingsKey, JSON.stringify(updatedConfig));
        console.log('📝 Saved user settings to localStorage');
      } else {
        // Save to Supabase for real auth
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
    }
  }, [config, user]);

  const createNewShipment = useCallback(() => {
    // Check if user can create a new shipment
    if (savedShipments.length >= featureLimits.maxShipments && featureLimits.maxShipments !== -1) {
      console.warn('Cannot create shipment: limit reached for current subscription tier');
      const maxShipments = featureLimits.maxShipments;
      alert(`You've reached the limit of ${maxShipments} shipment${maxShipments === 1 ? '' : 's'} for your ${subscriptionTier} plan. Upgrade to Premium for unlimited shipments!`);
      return;
    }

    setCurrentShipment({
      ...defaultShipment,
      id: uuidv4(),
      createdAt: new Date(),
      isPremium: isPremiumUser
    });
  }, [savedShipments.length, featureLimits.maxShipments, subscriptionTier, isPremiumUser]);

  const saveCurrentShipment = useCallback(async () => {
    if (!currentShipment || !user) return;
    
    try {
      console.log('🚀 Saving shipment...');
      
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        console.log('📝 Saving to localStorage (placeholder mode)');
        
        // Update the saved shipments list
        let updatedShipments;
        const existingIndex = savedShipments.findIndex(s => s.id === currentShipment.id);
        
        if (existingIndex >= 0) {
          updatedShipments = [...savedShipments];
          updatedShipments[existingIndex] = currentShipment;
        } else {
          updatedShipments = [currentShipment, ...savedShipments];
        }
        
        // Save to localStorage
        const savedShipmentsKey = `savedShipments_${user.id}`;
        try {
          localStorage.setItem(savedShipmentsKey, JSON.stringify(updatedShipments));
          console.log(`💾 Saved shipment "${currentShipment.name}" to localStorage`);
        } catch (error) {
          console.error('Error saving shipment to localStorage:', error);
        }
        
        // Update state
        setSavedShipments(updatedShipments);
        return;
      }

      // Prepare shipment data for Supabase
      const shipmentData = {
        id: currentShipment.id,
        user_id: user.id,
        name: currentShipment.name,
        folder_id: currentShipment.folderId || null,
        products: currentShipment.products,
        containers: currentShipment.containers,
        config: config,
        updated_at: new Date().toISOString()
      };

      // Check if shipment already exists
      const { data: existingShipment } = await supabase
        .from('shipments')
        .select('id')
        .eq('id', currentShipment.id)
        .eq('user_id', user.id)
        .single();

      if (existingShipment) {
        // Update existing shipment
        const { error } = await supabase
          .from('shipments')
          .update({
            name: shipmentData.name,
            folder_id: shipmentData.folder_id,
            products: shipmentData.products,
            containers: shipmentData.containers,
            config: shipmentData.config,
            updated_at: shipmentData.updated_at
          })
          .eq('id', currentShipment.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error updating shipment:', error);
          throw error;
        }
        
        console.log('✅ Shipment updated successfully');
      } else {
        // Insert new shipment
        const { error } = await supabase
          .from('shipments')
          .insert(shipmentData);

        if (error) {
          console.error('❌ Error inserting shipment:', error);
          throw error;
        }
        
        console.log('✅ Shipment saved successfully');
      }

      // Update local state to reflect the save
      const existingIndex = savedShipments.findIndex(s => s.id === currentShipment.id);
      if (existingIndex >= 0) {
        const updatedShipments = [...savedShipments];
        updatedShipments[existingIndex] = currentShipment;
        setSavedShipments(updatedShipments);
      } else {
        setSavedShipments(prev => [currentShipment, ...prev]);
      }

    } catch (error) {
      console.error('❌ Failed to save shipment:', error);
      // Could show user notification here
    }
  }, [currentShipment, user, savedShipments, config]);

  const loadShipment = useCallback((shipment: Shipment) => {
    setCurrentShipment(shipment);
  }, []);

  const updateShipmentName = useCallback((name: string) => {
    if (!currentShipment) return;
    setCurrentShipment(prev => prev ? { ...prev, name } : null);
  }, [currentShipment]);

  const updateShipment = useCallback(async (updates: {
    name?: string;
    description?: string;
    folderId?: string;
    shippingDate?: string;
  }) => {
    if (!currentShipment) return;
    
    // Update current shipment with new timestamp to mark as recently modified
    const updatedShipment = { 
      ...currentShipment, 
      ...updates,
      createdAt: new Date() // Update timestamp to move to top of list
    };
    setCurrentShipment(updatedShipment);
    
    // Auto-save to keep sidebar in sync
    try {
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        // Update localStorage immediately for better UX
        const existingIndex = savedShipments.findIndex(s => s.id === updatedShipment.id);
        if (existingIndex >= 0) {
          const updatedSavedShipments = [...savedShipments];
          updatedSavedShipments[existingIndex] = updatedShipment;
          // Re-sort to ensure most recently updated appears first
          const sortedShipments = updatedSavedShipments.sort((a: Shipment, b: Shipment) => b.createdAt.getTime() - a.createdAt.getTime());
          setSavedShipments(sortedShipments);
          
          // Save to localStorage
          const savedShipmentsKey = `savedShipments_${user?.id}`;
          localStorage.setItem(savedShipmentsKey, JSON.stringify(sortedShipments));
          console.log(`💾 Auto-saved shipment "${updatedShipment.name}" to localStorage`);
        }
      } else {
        // For real Supabase, also auto-update the saved shipments list
        const existingIndex = savedShipments.findIndex(s => s.id === updatedShipment.id);
        if (existingIndex >= 0) {
          const updatedSavedShipments = [...savedShipments];
          updatedSavedShipments[existingIndex] = updatedShipment;
          // Re-sort to ensure most recently updated appears first
          const sortedShipments = updatedSavedShipments.sort((a: Shipment, b: Shipment) => b.createdAt.getTime() - a.createdAt.getTime());
          setSavedShipments(sortedShipments);
        }
      }
    } catch (error) {
      console.error('Error auto-saving shipment updates:', error);
    }
  }, [currentShipment, savedShipments, user]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    if (!currentShipment) return;
    
    // Check if user can add more products
    if (currentShipment.products.length >= featureLimits.maxProductsPerShipment && featureLimits.maxProductsPerShipment !== -1) {
      console.warn('Cannot add product: limit reached for current subscription tier');
      return;
    }
    
    const newProduct: Product = {
      ...product,
      id: uuidv4()
    };
    
    const updatedShipment = {
      ...currentShipment,
      products: [...currentShipment.products, newProduct]
    };
    
    setCurrentShipment(updatedShipment);
    
    // Auto-update sidebar by updating savedShipments
    const existingIndex = savedShipments.findIndex(s => s.id === updatedShipment.id);
    if (existingIndex >= 0) {
      const updatedSavedShipments = [...savedShipments];
      updatedSavedShipments[existingIndex] = updatedShipment;
      setSavedShipments(updatedSavedShipments);
    }
  }, [currentShipment, featureLimits.maxProductsPerShipment, savedShipments]);

  const updateProduct = useCallback((id: string, productUpdates: Partial<Product>) => {
    if (!currentShipment) return;
    
    let updatedShipment: Shipment;
    
    const updatedProducts = currentShipment.products.map(product => 
      product.id === id ? { ...product, ...productUpdates } : product
    );
    
    if ('containerId' in productUpdates) {
      const updatedContainers = currentShipment.containers.map(container => ({
        ...container,
        products: container.id === productUpdates.containerId
          ? [...container.products, id]
          : container.products.filter(pid => pid !== id)
      }));
      
      updatedShipment = {
        ...currentShipment,
        products: updatedProducts,
        containers: updatedContainers
      };
    } else {
      updatedShipment = {
        ...currentShipment,
        products: updatedProducts
      };
    }
    
    setCurrentShipment(updatedShipment);
    
    // Auto-update sidebar by updating savedShipments
    const existingIndex = savedShipments.findIndex(s => s.id === updatedShipment.id);
    if (existingIndex >= 0) {
      const updatedSavedShipments = [...savedShipments];
      updatedSavedShipments[existingIndex] = updatedShipment;
      setSavedShipments(updatedSavedShipments);
    }
  }, [currentShipment, savedShipments]);

  const removeProduct = useCallback((id: string) => {
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
  }, [currentShipment]);


  const updateContainer = useCallback((id: string, containerUpdates: Partial<Container>) => {
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
  }, [currentShipment]);

  const removeContainer = useCallback((id: string) => {
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
  }, [currentShipment]);

  const toggleDumpingPenalizer = useCallback(() => {
    if (!featureLimits.hasDumpingPenalizer) {
      console.warn('Dumping penalizer not available for current subscription tier');
      return;
    }
    setDumpingPenalizerEnabled(prev => !prev);
  }, [featureLimits.hasDumpingPenalizer]);

  const toggleAiDimensions = useCallback(() => {
    if (!featureLimits.hasAiDimensions) {
      console.warn('AI dimensions not available for current subscription tier');
      return;
    }
    setAiDimensionsEnabled(prev => !prev);
  }, [featureLimits.hasAiDimensions]);

  const toggleMarketAnalysis = useCallback(() => {
    if (!featureLimits.hasMarketAnalysis) {
      console.warn('Market analysis not available for current subscription tier');
      return;
    }
    setMarketAnalysisEnabled(prev => !prev);
  }, [featureLimits.hasMarketAnalysis]);

  const toggleSubscriptionTier = useCallback(() => {
    // Only allow in development mode
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (!isPlaceholder && import.meta.env.PROD) {
      console.warn('Subscription tier toggle only available in development');
      return;
    }
    
    const newTier = subscriptionTier === 'free' ? 'premium' : 'free';
    setSubscriptionTier(newTier);
    console.log(`🔄 Development mode: Switched to ${newTier} tier`);
  }, [subscriptionTier]);

  // Feature availability checking functions
  const isFeatureAvailable = useCallback((feature: keyof FeatureLimits): boolean => {
    return featureLimits[feature] as boolean;
  }, [featureLimits]);

  const canCreateShipment = useCallback((): boolean => {
    if (featureLimits.maxShipments === -1) return true; // unlimited
    return savedShipments.length < featureLimits.maxShipments;
  }, [featureLimits.maxShipments, savedShipments.length]);

  const canAddProduct = useCallback((): boolean => {
    if (!currentShipment) return true;
    if (featureLimits.maxProductsPerShipment === -1) return true; // unlimited
    return currentShipment.products.length < featureLimits.maxProductsPerShipment;
  }, [currentShipment, featureLimits.maxProductsPerShipment]);

  const canAddContainer = useCallback((): boolean => {
    if (!currentShipment) return true;
    if (featureLimits.maxContainersPerShipment === -1) return true; // unlimited
    return currentShipment.containers.length < featureLimits.maxContainersPerShipment;
  }, [currentShipment, featureLimits.maxContainersPerShipment]);

  const addContainer = useCallback((container: Omit<Container, 'id' | 'products'>) => {
    if (!currentShipment) return;
    
    // Check if user can add more containers
    if (!canAddContainer()) {
      console.warn('Cannot add container: limit reached for current subscription tier');
      return;
    }
    
    const newContainer: Container = {
      ...container,
      id: uuidv4(),
      products: []
    };
    
    const updatedShipment = {
      ...currentShipment,
      containers: [...currentShipment.containers, newContainer]
    };
    
    setCurrentShipment(updatedShipment);
    
    // Auto-update sidebar by updating savedShipments
    const existingIndex = savedShipments.findIndex(s => s.id === updatedShipment.id);
    if (existingIndex >= 0) {
      const updatedSavedShipments = [...savedShipments];
      updatedSavedShipments[existingIndex] = updatedShipment;
      setSavedShipments(updatedSavedShipments);
    }
  }, [currentShipment, canAddContainer, savedShipments]);

  const contextValue: AppContextType = useMemo(() => ({
    config,
    updateConfig,
    currentShipment,
    savedShipments,
    createNewShipment,
    saveCurrentShipment,
    loadShipment,
    updateShipmentName,
    updateShipment,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    // Subscription management
    subscription,
    subscriptionTier,
    featureLimits,
    isFeatureAvailable,
    canCreateShipment,
    canAddProduct,
    canAddContainer,
    // Legacy support
    isPremiumUser,
    // Premium features with restrictions
    dumpingPenalizerEnabled,
    toggleDumpingPenalizer,
    aiDimensionsEnabled,
    toggleAiDimensions,
    marketAnalysisEnabled,
    toggleMarketAnalysis,
    // Development mode functions
    toggleSubscriptionTier
  }), [
    config,
    updateConfig,
    currentShipment,
    savedShipments,
    createNewShipment,
    saveCurrentShipment,
    loadShipment,
    updateShipmentName,
    updateShipment,
    addProduct,
    updateProduct,
    removeProduct,
    addContainer,
    updateContainer,
    removeContainer,
    subscription,
    subscriptionTier,
    featureLimits,
    isFeatureAvailable,
    canCreateShipment,
    canAddProduct,
    canAddContainer,
    isPremiumUser,
    dumpingPenalizerEnabled,
    toggleDumpingPenalizer,
    aiDimensionsEnabled,
    toggleAiDimensions,
    marketAnalysisEnabled,
    toggleMarketAnalysis,
    toggleSubscriptionTier
  ]);

  // Show loading screen while subscription data is loading
  if (subscriptionLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500 mt-2">Setting up your account</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
