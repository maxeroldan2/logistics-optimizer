console.log('🔄 Fixing authentication and reloading...');

// Clear all storage to remove bad cached auth
localStorage.clear();
sessionStorage.clear();

console.log('✅ Cleared localStorage and sessionStorage');

// Show the expected new user ID for demo@example.com
const email = 'demo@example.com';
let hash = 0;
for (let i = 0; i < email.length; i++) {
  hash = ((hash << 5) - hash + email.charCodeAt(i)) & 0xffffffff;
}
const hexHash = Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
const newUserId = [
  hexHash.substring(0, 8),
  hexHash.substring(8, 12),
  hexHash.substring(12, 16),
  hexHash.substring(16, 20),
  hexHash.substring(20, 32)
].join('-');

console.log('📧 After login with demo@example.com, user ID will be:', newUserId);
console.log('✅ This is a valid UUID format compatible with PostgreSQL');

// Wait 2 seconds then reload
setTimeout(() => {
  console.log('🔄 Reloading page...');
  location.reload();
}, 2000);