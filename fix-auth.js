// Quick fix script - paste this in browser console (F12)

console.log('🔧 Fixing authentication...');

// Clear any corrupted auth data
localStorage.clear();
sessionStorage.clear();

// Check current location
console.log('Current URL:', window.location.href);

// Force redirect to login if not authenticated
if (!localStorage.getItem('token')) {
    console.log('No token found, redirecting to login...');
    window.location.href = '/login';
} else {
    console.log('Token exists, reloading page...');
    window.location.reload();
}