// Script to clear localStorage and check for errors
console.log('🧹 Clearing localStorage...');
localStorage.clear();
console.log('✅ localStorage cleared');

// Log current storage state
console.log('📊 Current localStorage keys:', Object.keys(localStorage));
console.log('📊 Current sessionStorage keys:', Object.keys(sessionStorage));

// Check if we're on the correct URL
console.log('🌐 Current URL:', window.location.href);

// Test if Supabase is accessible
fetch('http://127.0.0.1:54321/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  }
})
.then(response => {
  console.log('✅ Supabase connection test:', response.status === 200 ? 'SUCCESS' : 'FAILED');
  return response.json();
})
.then(data => {
  console.log('📡 Supabase API info:', data.info ? data.info.title : 'API responding');
})
.catch(error => {
  console.error('❌ Supabase connection error:', error);
});

console.log('🔄 Please refresh the page after clearing storage');