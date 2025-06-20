import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useAppContext } from '../context/AppContext';

export const useFolderManagement = () => {
  const { user } = useAuth();
  const { updateShipment, currentShipment } = useAppContext();
  const lastUserId = useRef<string | null>(null);
  
  // Initialize with default folders
  const [folders, setFolders] = useState([
    { id: '1', name: 'Q1 2024' },
    { id: '2', name: 'Electronics' },
    { id: '3', name: 'Archived' }
  ]);
  
  // Initialize with empty shipment folder assignments
  const [shipmentFolders, setShipmentFolders] = useState<Record<string, string>>({});

  // Load saved data from localStorage when user changes
  useEffect(() => {
    if (!user || user.id === lastUserId.current) return;

    const foldersKey = `folders_${user.id}`;
    const shipmentFoldersKey = `shipmentFolders_${user.id}`;

    console.log(`🔄 Loading folder data for new user ${user.id} (previous: ${lastUserId.current})`);

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
  }, [user]);

  // Save data when state changes (but only if we have a user and the change isn't from loading)
  useEffect(() => {
    if (!user || user.id !== lastUserId.current) return;
    
    const foldersKey = `folders_${user.id}`;
    console.log('💾 Saving folders to localStorage:', folders);
    localStorage.setItem(foldersKey, JSON.stringify(folders));
  }, [folders, user]);

  useEffect(() => {
    if (!user || user.id !== lastUserId.current) return;
    
    const shipmentFoldersKey = `shipmentFolders_${user.id}`;
    console.log('💾 Saving shipment folders to localStorage:', shipmentFolders);
    localStorage.setItem(shipmentFoldersKey, JSON.stringify(shipmentFolders));
  }, [shipmentFolders, user]);

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