// Utility functions
class Utils {
    // Format currency
    static formatCurrency(amount, currency = CONFIG.DEFAULTS.CURRENCY) {
        const symbol = CONFIG.DEFAULTS.CURRENCY_SYMBOL;
        return `${symbol}${Number(amount).toFixed(2)}`;
    }

    // Format dimensions
    static formatDimensions(height, width, length, unit = 'cm') {
        return `${height}×${width}×${length}${unit}`;
    }

    // Format weight
    static formatWeight(weight, unit = 'kg') {
        return `${Number(weight).toFixed(2)}${unit}`;
    }

    // Format volume
    static formatVolume(volume, unit = 'cm³') {
        return `${Number(volume).toFixed(2)} ${unit}`;
    }

    // Calculate volume
    static calculateVolume(height, width, length) {
        return height * width * length;
    }

    // Get product icon
    static getProductIcon(iconName) {
        return CONFIG.PRODUCT_ICONS[iconName] || CONFIG.PRODUCT_ICONS.Package;
    }

    // Show notification
    static showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Show/hide loading
    static showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    static hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Escape HTML
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Validate email
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Get efficiency color class
    static getEfficiencyColorClass(score) {
        if (score >= 80) return 'efficiency-excellent';
        if (score >= 60) return 'efficiency-good';
        return 'efficiency-poor';
    }

    // Format date
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Truncate text
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if user is premium
    static isPremiumUser() {
        const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || '{}');
        return user.subscription_tier === 'premium';
    }

    // Get current user
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER) || '{}');
    }

    // Set current user
    static setCurrentUser(user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // Clear user data
    static clearUserData() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_SHIPMENT);
    }

    // Handle API errors
    static handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            this.showNotification('Session expired. Please login again.', 'error');
            Auth.logout();
            return;
        }
        
        this.showNotification(error.message || 'An error occurred', 'error');
    }

    // Animate element
    static animateElement(element, animation = 'fadeIn') {
        element.style.animation = `${animation} 0.3s ease`;
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    // Smooth scroll to element
    static scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Get URL parameters
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    // Set URL parameter
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    }

    // Remove URL parameter
    static removeUrlParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }
}