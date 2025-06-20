import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSubscription = () => {
  const { subscriptionTier, featureLimits } = useAppContext();
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string>('');

  const showUpgradePrompt = (feature: string) => {
    setCurrentFeature(feature);
    setUpgradePromptOpen(true);
  };

  const hideUpgradePrompt = () => {
    setUpgradePromptOpen(false);
    setCurrentFeature('');
  };

  const handleUpgrade = async () => {
    try {
      // Redirect to Stripe checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Handle error - show error message to user
    }
  };

  const checkFeatureLimit = (feature: keyof typeof featureLimits): boolean => {
    return featureLimits[feature] as boolean;
  };

  const checkQuantityLimit = (
    type: 'shipments' | 'products' | 'containers',
    currentCount: number
  ): boolean => {
    switch (type) {
      case 'shipments':
        return featureLimits.maxShipments === -1 || currentCount < featureLimits.maxShipments;
      case 'products':
        return featureLimits.maxProductsPerShipment === -1 || currentCount < featureLimits.maxProductsPerShipment;
      case 'containers':
        return featureLimits.maxContainersPerShipment === -1 || currentCount < featureLimits.maxContainersPerShipment;
      default:
        return false;
    }
  };

  const getFeatureRestrictionMessage = (feature: string): string => {
    const messages: Record<string, string> = {
      'unlimited-shipments': 'Create unlimited shipments',
      'advanced-analytics': 'Access advanced analytics and dumping penalizer',
      'market-analysis': 'Use market analysis and competition simulation',
      'ai-dimensions': 'Get AI-powered dimension autocomplete',
      'export-data': 'Export your data to CSV and other formats',
      'api-integrations': 'Connect with Amazon, Shopify, and MercadoLibre APIs',
      'save-shipments': 'Save and manage multiple shipments',
      'compare-shipments': 'Compare shipments side by side',
    };

    return messages[feature] || 'Access this premium feature';
  };

  return {
    subscriptionTier,
    featureLimits,
    upgradePromptOpen,
    currentFeature,
    showUpgradePrompt,
    hideUpgradePrompt,
    handleUpgrade,
    checkFeatureLimit,
    checkQuantityLimit,
    getFeatureRestrictionMessage,
  };
};