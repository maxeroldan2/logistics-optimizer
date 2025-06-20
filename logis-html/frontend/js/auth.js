// Authentication management
class Auth {
    static isLoggedIn() {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        return !!token;
    }

    static async login(email, password) {
        try {
            Utils.showLoading();
            
            const response = await API.login(email, password);
            
            // Store token and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            Utils.hideLoading();
            Utils.showNotification('Login successful!', 'success');
            
            this.showApp();
            return response;
        } catch (error) {
            Utils.hideLoading();
            Utils.handleApiError(error);
            throw error;
        }
    }

    static async register(email, password) {
        try {
            Utils.showLoading();
            
            const response = await API.register(email, password);
            
            // Store token and user data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            Utils.hideLoading();
            Utils.showNotification('Registration successful!', 'success');
            
            this.showApp();
            return response;
        } catch (error) {
            Utils.hideLoading();
            Utils.handleApiError(error);
            throw error;
        }
    }

    static logout() {
        // Clear local storage
        Utils.clearUserData();
        
        // Hide app and show auth modal
        this.showAuthModal();
        
        Utils.showNotification('Logged out successfully', 'info');
    }

    static showApp() {
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Update user info in header
        const user = Utils.getCurrentUser();
        document.getElementById('userEmail').textContent = user.email || '';
        
        // Load dashboard
        App.loadDashboard();
    }

    static showAuthModal() {
        document.getElementById('app').classList.add('hidden');
        document.getElementById('authModal').classList.remove('hidden');
    }

    static async checkAuth() {
        if (this.isLoggedIn()) {
            try {
                // Verify token is still valid
                await API.getProfile();
                this.showApp();
            } catch (error) {
                console.warn('Token validation failed:', error);
                this.logout();
            }
        } else {
            this.showAuthModal();
        }
    }
}

// Auth modal functions (called from HTML)
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const switchText = document.getElementById('authSwitchText');
    
    if (isLoginMode) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode()">Sign up</a>';
    } else {
        title.textContent = 'Sign Up';
        submitBtn.textContent = 'Sign Up';
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode()">Login</a>';
    }
}

function closeAuthModal() {
    // Only allow closing if user is logged in
    if (Auth.isLoggedIn()) {
        document.getElementById('authModal').classList.add('hidden');
    }
}

// Auth form handler
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!Utils.isValidEmail(email)) {
                Utils.showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            if (password.length < 6) {
                Utils.showNotification('Password must be at least 6 characters', 'error');
                return;
            }
            
            try {
                if (isLoginMode) {
                    await Auth.login(email, password);
                } else {
                    await Auth.register(email, password);
                }
                
                // Clear form
                authForm.reset();
            } catch (error) {
                // Error is already handled in Auth methods
            }
        });
    }
});