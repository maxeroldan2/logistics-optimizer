import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SavedProduct, Product } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

export const useSavedProducts = () => {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's saved products
  const fetchSavedProducts = async () => {
    if (!user) return;
    
    // Check if using placeholder credentials
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (isPlaceholder) {
      // Skip network requests in placeholder mode
      setLoading(false);
      setSavedProducts([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select('*')
        .order('name');

      if (error) throw error;
      setSavedProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved products');
      console.error('Error fetching saved products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save a product as a preset
  const saveProduct = async (product: Product, description?: string, tags?: string[]) => {
    if (!user) {
      setError('User must be logged in to save products');
      return false;
    }

    // Check if using placeholder credentials
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (isPlaceholder) {
      // Skip network requests in placeholder mode, just return success
      return true;
    }

    setLoading(true);
    setError(null);

    try {
      const savedProduct = {
        user_id: user.id,
        name: product.name,
        description: description || '',
        purchase_price: product.purchasePrice,
        resale_price: product.resalePrice,
        height: product.height,
        width: product.width,
        length: product.length,
        weight: product.weight,
        quantity: product.quantity,
        days_to_sell: product.daysToSell,
        icon: product.icon || '📦',
        tags: tags || []
      };

      const { error } = await supabase
        .from('saved_products')
        .insert([savedProduct]);

      if (error) throw error;

      // Refresh the list
      await fetchSavedProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      console.error('Error saving product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Convert SavedProduct to Product format
  const savedProductToProduct = (savedProduct: SavedProduct): Omit<Product, 'id'> => {
    return {
      name: savedProduct.name,
      purchasePrice: savedProduct.purchase_price,
      resalePrice: savedProduct.resale_price,
      height: savedProduct.height,
      width: savedProduct.width,
      length: savedProduct.length,
      weight: savedProduct.weight,
      quantity: savedProduct.quantity,
      daysToSell: savedProduct.days_to_sell,
      icon: savedProduct.icon,
      isBoxed: true,
      tag: savedProduct.tags?.[0] || undefined
    };
  };

  // Delete a saved product
  const deleteSavedProduct = async (id: string) => {
    if (!user) {
      setError('User must be logged in to delete products');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      console.error('Error deleting product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update a saved product
  const updateSavedProduct = async (id: string, updates: Partial<Omit<SavedProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      setError('User must be logged in to update products');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedProducts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      console.error('Error updating product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load saved products when user changes
  useEffect(() => {
    fetchSavedProducts();
  }, [user]);

  return {
    savedProducts,
    loading,
    error,
    saveProduct,
    deleteSavedProduct,
    updateSavedProduct,
    savedProductToProduct,
    refetch: fetchSavedProducts
  };
};