import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export const useFolderManagement = () => {
  const { user } = useAuth();
  const { updateShipment, currentShipment, savedShipments } = useAppContext();
  const lastUserId = useRef<string | null>(null);
  
  // Initialize with default folders
  const [folders, setFolders] = useState([
    { id: '1', name: 'Q1 2024' },
    { id: '2', name: 'Electronics' },
    { id: '3', name: 'Archived' }
  ]);
  
  // Initialize with empty shipment folder assignments
  const [shipmentFolders, setShipmentFolders] = useState<Record<string, string>>({});

  // Save folders to Supabase
  const saveFoldersToDatabase = async (newFolders: typeof folders) => {
    if (!user) {
      console.warn('⚠️  No user found, skipping folder save');
      return;
    }
    
    try {
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        console.log('💾 Saving folders to localStorage (placeholder mode)');
        const foldersKey = `folders_${user.id}`;
        localStorage.setItem(foldersKey, JSON.stringify(newFolders));
        return;
      }

      console.log('💾 Saving folders to Supabase database:', newFolders);
      const { error } = await supabase
        .from('user_settings')
        .update({
          folders: newFolders
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error saving folders to database:', error);
      } else {
        console.log('✅ Folders saved to database successfully');
      }
    } catch (error) {
      console.error('❌ Failed to save folders:', error);
    }
  };

  // Save shipment folders to Supabase
  const saveShipmentFoldersToDatabase = async (newShipmentFolders: Record<string, string>) => {
    if (!user) {
      console.warn('⚠️  No user found, skipping shipment folder save');
      return;
    }
    
    try {
      // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
      const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
      const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
      
      if (isPlaceholder || isMockAuth || forceLocalStorage) {
        console.log('💾 Saving shipment folders to localStorage (placeholder mode)');
        const shipmentFoldersKey = `shipmentFolders_${user.id}`;
        localStorage.setItem(shipmentFoldersKey, JSON.stringify(newShipmentFolders));
        return;
      }

      console.log('💾 Saving shipment folders to Supabase database:', newShipmentFolders);
      const { error } = await supabase
        .from('user_settings')
        .update({
          shipment_folders: newShipmentFolders
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error saving shipment folders to database:', error);
      } else {
        console.log('✅ Shipment folders saved to database successfully');
      }
    } catch (error) {
      console.error('❌ Failed to save shipment folders:', error);
    }
  };

  // Load folder data from Supabase when user changes
  useEffect(() => {
    if (!user || user.id === lastUserId.current) return;

    console.log(`🔄 Loading folder data for user ${user.id} (previous: ${lastUserId.current})`);

    const loadFolderData = async () => {
      try {
        console.log(`🔍 Loading folder data for user ID: ${user.id}`);
        
        // Check if we should use localStorage (placeholder credentials, mock auth, or forced localStorage mode)
        const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                             import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
        const isMockAuth = user?.id.startsWith('60abafe0-') || user?.id.includes('mock');
        const forceLocalStorage = import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
        
        if (isPlaceholder || isMockAuth || forceLocalStorage) {
          console.log('📁 Loading folder data from localStorage (placeholder mode)');
          
          const foldersKey = `folders_${user.id}`;
          const shipmentFoldersKey = `shipmentFolders_${user.id}`;

          // Load folders
          const savedFolders = localStorage.getItem(foldersKey);
          if (savedFolders) {
            try {
              const parsedFolders = JSON.parse(savedFolders);
              console.log('📁 Loaded folders from localStorage:', parsedFolders);
              setFolders(parsedFolders);
            } catch (error) {
              console.error('Error parsing saved folders:', error);
            }
          }

          // Load shipment folder assignments
          const savedShipmentFolders = localStorage.getItem(shipmentFoldersKey);
          if (savedShipmentFolders) {
            try {
              const parsedShipmentFolders = JSON.parse(savedShipmentFolders);
              console.log('📦 Loaded shipment folders from localStorage:', parsedShipmentFolders);
              setShipmentFolders(parsedShipmentFolders);
            } catch (error) {
              console.error('Error parsing saved shipment folders:', error);
            }
          } else {
            console.log('📦 No saved shipment folders found, starting with empty object');
            setShipmentFolders({});
          }
          
          lastUserId.current = user.id;
          return;
        }

        // Load from Supabase
        console.log('📁 Loading folder data from Supabase database...');
        const { data, error } = await supabase
          .from('user_settings')
          .select('folders, shipment_folders')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('📁 No user_settings record found for user, will create one');
          } else {
            console.error('❌ Error loading folder data from database:', error);
            console.error('❌ Full error details:', JSON.stringify(error, null, 2));
            
            // If this is a 406 error, it might mean the user doesn't exist in auth system
            if (error.message && error.message.includes('406')) {
              console.warn('⚠️  User session may be invalid. Consider logging out and back in.');
              // Fall back to default folders for this session
              setFolders([
                { id: '1', name: 'Q1 2024' },
                { id: '2', name: 'Electronics' },
                { id: '3', name: 'Archived' }
              ]);
              setShipmentFolders({});
            }
            return;
          }
        }

        if (data) {
          if (data.folders && Array.isArray(data.folders)) {
            console.log('📁 Loaded folders from database:', data.folders);
            setFolders(data.folders);
          }
          
          if (data.shipment_folders && typeof data.shipment_folders === 'object') {
            console.log('📦 Loaded shipment folders from database:', data.shipment_folders);
            setShipmentFolders(data.shipment_folders);
          } else {
            console.log('📦 No shipment folders found in database, starting with empty object');
            setShipmentFolders({});
          }
        } else {
          console.log('📁 No user settings found in database, creating new record with defaults');
          // Create new user settings record since it doesn't exist
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              measurement: 'metric',
              currency: 'USD',
              language: 'en',
              show_tooltips: true,
              folders: folders,
              shipment_folders: {}
            });

          if (insertError) {
            console.error('❌ Error creating user settings:', insertError);
          } else {
            console.log('✅ Created new user settings record with default folders');
          }
        }
      } catch (error) {
        console.error('❌ Failed to load folder data:', error);
      }
    };

    loadFolderData();
    lastUserId.current = user.id;
  }, [user]);

  // Save folders when they change (but only if we have a user and the change isn't from loading)
  useEffect(() => {
    if (!user || user.id !== lastUserId.current) return;
    saveFoldersToDatabase(folders);
  }, [folders, user]);

  // Save shipment folders when they change (but only if we have a user and the change isn't from loading)
  useEffect(() => {
    if (!user || user.id !== lastUserId.current) return;
    saveShipmentFoldersToDatabase(shipmentFolders);
  }, [shipmentFolders, user]);

  // Sync shipmentFolders with savedShipments that have folderId
  useEffect(() => {
    if (!user || !savedShipments) return;

    setShipmentFolders(prev => {
      const updated = { ...prev };
      
      // Add any shipments that have folderId but aren't in the local state
      savedShipments.forEach(shipment => {
        if (shipment.folderId && !updated[shipment.id]) {
          updated[shipment.id] = shipment.folderId;
        }
      });

      return updated;
    });
  }, [savedShipments, user]);

  const handleRenameShipment = (id: string, newName: string) => {
    // In real app, this would update the shipment in context/database
    console.log(`Renaming shipment ${id} to ${newName}`);
  };

  const handleMoveToFolder = (shipmentId: string, folderId: string) => {
    // Update the local shipment folders state for UI
    setShipmentFolders(prev => {
      const updated = { ...prev };
      if (folderId === '') {
        // Remove folder assignment if moving to "No folder"
        delete updated[shipmentId];
      } else {
        updated[shipmentId] = folderId;
      }
      console.log(`Moving shipment ${shipmentId} to folder ${folderId || 'No folder'}`);
      return updated;
    });

    // If this is the current shipment, update it in the context
    if (currentShipment && currentShipment.id === shipmentId) {
      const newFolderId = folderId === '' ? undefined : folderId;
      console.log(`🔄 Updating current shipment folder to: ${newFolderId || 'No folder'}`);
      updateShipment({ folderId: newFolderId });
    }
  };

  const handleArchiveShipment = (id: string) => {
    // Move to archived folder or mark as archived
    const archivedFolder = folders.find(f => f.name === 'Archived');
    if (archivedFolder) {
      handleMoveToFolder(id, archivedFolder.id);
    }
  };

  const handleDeleteShipment = (id: string) => {
    // In real app, this would delete from context/database
    console.log(`Deleting shipment ${id}`);
  };

  const createNewFolder = (name: string) => {
    const newFolder = {
      id: Date.now().toString(),
      name: name.trim()
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleRenameFolder = (id: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === id ? { ...folder, name: newName.trim() } : folder
    ));
    console.log(`Renaming folder ${id} to ${newName}`);
  };

  const handleDeleteFolder = (id: string) => {
    // Remove the folder
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    // Move all shipments from this folder to "no folder" (remove their folder assignment)
    setShipmentFolders(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(shipmentId => {
        if (updated[shipmentId] === id) {
          delete updated[shipmentId];
        }
      });
      return updated;
    });
    
    console.log(`Deleting folder ${id} and moving shipments to "no folder"`);
  };

  return {
    folders,
    shipmentFolders,
    handleRenameShipment,
    handleMoveToFolder,
    handleArchiveShipment,
    handleDeleteShipment,
    createNewFolder,
    handleRenameFolder,
    handleDeleteFolder
  };
};