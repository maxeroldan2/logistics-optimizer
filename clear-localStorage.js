// Clear localStorage to fix old user ID format issues
// Run this in the browser console

console.log('🧹 Clearing localStorage data...');

// Clear all localStorage keys that might contain old user data
const keysToRemove = [];

// Find all keys to remove
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.includes('mockAuth') ||
    key.includes('savedShipments_') ||
    key.includes('userSettings_') ||
    key.includes('folders_') ||
    key.includes('shipmentFolders_') ||
    key.includes('mock-')
  )) {
    keysToRemove.push(key);
  }
}

// Remove the keys
keysToRemove.forEach(key => {
  console.log(`🗑️  Removing: ${key}`);
  localStorage.removeItem(key);
});

console.log(`✅ Cleared ${keysToRemove.length} localStorage keys`);
console.log('🔄 Please refresh the page to see the new user ID format');