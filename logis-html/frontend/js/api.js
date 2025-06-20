// API utilities
class API {
    static getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    static getHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async getProfile() {
        return this.request('/user/profile');
    }

    // Shipments endpoints
    static async getShipments() {
        return this.request('/shipments');
    }

    static async getShipment(id) {
        return this.request(`/shipments/${id}`);
    }

    static async createShipment(data) {
        return this.request('/shipments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateShipment(id, data) {
        return this.request(`/shipments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteShipment(id) {
        return this.request(`/shipments/${id}`, {
            method: 'DELETE'
        });
    }

    // Containers endpoints
    static async createContainer(data) {
        return this.request('/containers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateContainer(id, data) {
        return this.request(`/containers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteContainer(id) {
        return this.request(`/containers/${id}`, {
            method: 'DELETE'
        });
    }

    // Products endpoints
    static async createProduct(data) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateProduct(id, data) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Saved products endpoints
    static async getSavedProducts() {
        return this.request('/saved-products');
    }

    static async saveProduct(data) {
        return this.request('/saved-products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async deleteSavedProduct(id) {
        return this.request(`/saved-products/${id}`, {
            method: 'DELETE'
        });
    }

    // Folders endpoints
    static async getFolders() {
        return this.request('/folders');
    }

    static async createFolder(data) {
        return this.request('/folders', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async deleteFolder(id) {
        return this.request(`/folders/${id}`, {
            method: 'DELETE'
        });
    }
}