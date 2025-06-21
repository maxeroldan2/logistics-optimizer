import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SavedContainer, Container } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

export const useSavedContainers = () => {
  const { user } = useAuth();
  const [savedContainers, setSavedContainers] = useState<SavedContainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's saved containers
  const fetchSavedContainers = useCallback(async () => {
    if (!user) return;
    
    // Check if using placeholder credentials
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                         import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
    
    if (isPlaceholder) {
      // Skip network requests in placeholder mode
      setLoading(false);
      setSavedContainers([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_containers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSavedContainers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved containers');
      console.error('Error fetching saved containers:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save a container as a preset
  const saveContainer = async (container: Container, description?: string, tags?: string[]) => {
    if (!user) {
      setError('User must be logged in to save containers');
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
      const savedContainer = {
        user_id: user.id,
        name: container.name,
        description: description || '',
        height: container.height,
        width: container.width,
        length: container.length,
        weight_limit: container.maxWeight, // Use weight_limit to match database schema
        icon: container.icon || '📦'
      };

      const { error } = await supabase
        .from('saved_containers')
        .insert([savedContainer]);

      if (error) throw error;

      // Refresh the list
      await fetchSavedContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save container');
      console.error('Error saving container:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Convert SavedContainer to Container format
  const savedContainerToContainer = (savedContainer: SavedContainer): Omit<Container, 'id' | 'products'> => {
    return {
      name: savedContainer.name,
      height: savedContainer.height,
      width: savedContainer.width,
      length: savedContainer.length,
      maxWeight: savedContainer.weight_limit || savedContainer.max_weight, // Handle both field names
      shippingCost: savedContainer.shipping_cost || 0,
      shippingDuration: savedContainer.shipping_duration || 30,
      icon: savedContainer.icon || '📦',
      tag: savedContainer.tags?.[0] || undefined
    };
  };

  // Delete a saved container
  const deleteSavedContainer = async (id: string) => {
    if (!user) {
      setError('User must be logged in to delete containers');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_containers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete container');
      console.error('Error deleting container:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update a saved container
  const updateSavedContainer = async (id: string, updates: Partial<Omit<SavedContainer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      setError('User must be logged in to update containers');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('saved_containers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedContainers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update container');
      console.error('Error updating container:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load saved containers when user changes
  useEffect(() => {
    fetchSavedContainers();
  }, [user, fetchSavedContainers]);

  return {
    savedContainers,
    loading,
    error,
    saveContainer,
    deleteSavedContainer,
    updateSavedContainer,
    savedContainerToContainer,
    refetch: fetchSavedContainers
  };
};