// Main application logic
class App {
    static currentShipment = null;
    static shipments = [];
    static draggedProductId = null;

    // Initialize the application
    static async init() {
        // Check authentication
        await Auth.checkAuth();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup form handlers
        this.setupFormHandlers();
    }

    // Load dashboard with shipments
    static async loadDashboard() {
        try {
            Utils.showLoading();
            
            // Show shipment view (new design shows this by default)
            this.showView('shipmentView');
            
            // Update sidebar user info
            const user = Utils.getCurrentUser();
            document.getElementById('sidebarUserEmail').textContent = user.email || 'demo@example.com';
            
            Utils.hideLoading();
        } catch (error) {
            Utils.hideLoading();
            Utils.handleApiError(error);
        }
    }

    // Open specific shipment
    static async openShipment(shipmentId) {
        try {
            Utils.showLoading();
            
            const shipmentData = await API.getShipment(shipmentId);
            this.currentShipment = shipmentData;
            
            // Show shipment view
            this.showView('shipmentView');
            
            // Update breadcrumb
            document.getElementById('currentShipmentName').textContent = shipmentData.name;
            document.getElementById('shipmentTitle').textContent = shipmentData.name;
            
            // Render shipment content
            this.renderShipmentDetails();
            
            Utils.hideLoading();
        } catch (error) {
            Utils.hideLoading();
            Utils.handleApiError(error);
        }
    }

    // Show specific view
    static showView(viewId) {
        // Hide all views except shipmentView (which is always visible with the new design)
        if (viewId === 'dashboardView') {
            document.getElementById('dashboardView').classList.remove('hidden');
            document.getElementById('shipmentView').classList.add('hidden');
        } else if (viewId === 'shipmentView') {
            document.getElementById('dashboardView').classList.add('hidden');
            document.getElementById('shipmentView').classList.remove('hidden');
        }
    }

    // Render shipments grid
    static renderShipments() {
        const grid = document.getElementById('shipmentsGrid');
        
        if (this.shipments.length === 0) {
            grid.innerHTML = Components.renderEmptyState(
                'No Shipments Yet',
                'Create your first shipment to start optimizing your logistics.',
                '+ New Shipment',
                'showNewShipmentModal()'
            );
            return;
        }
        
        grid.innerHTML = this.shipments
            .map(shipment => Components.renderShipmentCard(shipment))
            .join('');
    }

    // Render shipment details
    static renderShipmentDetails() {
        const shipment = this.currentShipment;
        const containers = shipment.containers || [];
        const products = shipment.products || [];
        
        // Calculate metrics
        const metrics = Calculations.calculateShipmentMetrics(shipment, containers, products);
        
        // Update score cards
        document.getElementById('totalProfit').textContent = Utils.formatCurrency(metrics.totalProfit);
        document.getElementById('overallScore').textContent = metrics.averageScore;
        document.getElementById('totalProducts').textContent = metrics.totalProducts;
        document.getElementById('totalContainers').textContent = metrics.totalContainers;
        
        // Render containers
        this.renderContainers(containers, products);
        
        // Render products table
        this.renderProductsTable(products);
    }

    // Render containers grid
    static renderContainers(containers, products) {
        const grid = document.getElementById('containersGrid');
        
        if (containers.length === 0) {
            grid.innerHTML = Components.renderEmptyState(
                'No Containers',
                'Add containers to organize your products.',
                '+ Add Container',
                'showContainerForm()'
            );
            return;
        }
        
        grid.innerHTML = containers
            .map(container => Components.renderContainerCard(container, products))
            .join('');
    }

    // Render products table
    static renderProductsTable(products) {
        const tbody = document.getElementById('productsTableBody');
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted" style="padding: 48px;">
                        No products added yet. Click "Add Product" to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = products
            .map(product => Components.renderProductRow(product))
            .join('');
    }

    // Setup event listeners
    static setupEventListeners() {
        // Modal close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                // Don't close auth modal if not logged in
                if (e.target.id === 'authModal' && !Auth.isLoggedIn()) {
                    return;
                }
                e.target.classList.add('hidden');
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    if (modal.id === 'authModal' && !Auth.isLoggedIn()) {
                        return;
                    }
                    modal.classList.add('hidden');
                });
            }
        });
    }

    // Setup form handlers
    static setupFormHandlers() {
        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', this.handleProductSubmit.bind(this));
            
            // Real-time profit calculation
            ['purchasePrice', 'resalePrice'].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', this.updateProfitDisplay);
                }
            });
        }

        // Container form
        const containerForm = document.getElementById('containerForm');
        if (containerForm) {
            containerForm.addEventListener('submit', this.handleContainerSubmit.bind(this));
            
            // Real-time volume calculation
            ['containerHeight', 'containerWidth', 'containerLength'].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', this.updateVolumeDisplay);
                }
            });
        }
    }

    // Handle product form submission
    static async handleProductSubmit(e) {
        e.preventDefault();
        
        if (!this.currentShipment) {
            Utils.showNotification('Please select a shipment first', 'error');
            return;
        }

        try {
            const formData = new FormData(e.target);
            const productData = {
                shipment_id: this.currentShipment.id,
                name: formData.get('name'),
                height: parseFloat(formData.get('height')),
                width: parseFloat(formData.get('width')),
                length: parseFloat(formData.get('length')),
                weight: parseFloat(formData.get('weight')),
                purchase_price: parseFloat(formData.get('purchase_price')),
                resale_price: parseFloat(formData.get('resale_price')),
                days_to_sell: parseInt(formData.get('days_to_sell')),
                quantity: parseInt(formData.get('quantity')) || 1,
                icon: 'Package'
            };

            await API.createProduct(productData);
            
            Utils.showNotification('Product added successfully!', 'success');
            this.closeProductModal();
            this.openShipment(this.currentShipment.id); // Refresh
        } catch (error) {
            Utils.handleApiError(error);
        }
    }

    // Handle container form submission
    static async handleContainerSubmit(e) {
        e.preventDefault();
        
        if (!this.currentShipment) {
            Utils.showNotification('Please select a shipment first', 'error');
            return;
        }

        try {
            const formData = new FormData(e.target);
            const containerData = {
                shipment_id: this.currentShipment.id,
                name: formData.get('name'),
                height: parseFloat(formData.get('height')),
                width: parseFloat(formData.get('width')),
                length: parseFloat(formData.get('length')),
                weight_limit: parseFloat(formData.get('weight_limit')),
                icon: 'Package'
            };

            await API.createContainer(containerData);
            
            Utils.showNotification('Container added successfully!', 'success');
            this.closeContainerModal();
            this.openShipment(this.currentShipment.id); // Refresh
        } catch (error) {
            Utils.handleApiError(error);
        }
    }

    // Update profit display in real-time
    static updateProfitDisplay() {
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const resalePrice = parseFloat(document.getElementById('resalePrice').value) || 0;
        const profit = resalePrice - purchasePrice;
        
        document.getElementById('profitValue').textContent = Utils.formatCurrency(profit);
    }

    // Update volume display in real-time
    static updateVolumeDisplay() {
        const height = parseFloat(document.getElementById('containerHeight').value) || 0;
        const width = parseFloat(document.getElementById('containerWidth').value) || 0;
        const length = parseFloat(document.getElementById('containerLength').value) || 0;
        const volume = height * width * length;
        
        document.getElementById('containerVolumeValue').textContent = Utils.formatVolume(volume);
    }

    // Drag and drop functionality
    static handleDragStart(event, productId) {
        this.draggedProductId = productId;
        event.dataTransfer.effectAllowed = 'move';
    }

    static handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drop-zone-active');
    }

    static handleDragLeave(event) {
        event.currentTarget.classList.remove('drop-zone-active');
    }

    static async handleDrop(event, containerId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drop-zone-active');
        
        if (!this.draggedProductId) return;

        try {
            await API.updateProduct(this.draggedProductId, {
                container_id: containerId
            });
            
            Utils.showNotification('Product assigned to container!', 'success');
            this.openShipment(this.currentShipment.id); // Refresh
        } catch (error) {
            Utils.handleApiError(error);
        }
        
        this.draggedProductId = null;
    }

    // Apply product template
    static applyProductTemplate(templateId) {
        const template = CONFIG.PRODUCT_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        // Fill form with template data
        document.getElementById('productName').value = template.name;
        document.getElementById('productHeight').value = template.height;
        document.getElementById('productWidth').value = template.width;
        document.getElementById('productLength').value = template.length;
        document.getElementById('productWeight').value = template.weight;
        document.getElementById('purchasePrice').value = template.estimatedPurchasePrice;
        document.getElementById('resalePrice').value = template.estimatedResalePrice;
        document.getElementById('daysToSell').value = template.estimatedDaysToSell;
        
        this.updateProfitDisplay();
        Utils.showNotification(`Applied template: ${template.name}`, 'success');
    }

    // Modal functions
    static showProductForm() {
        document.getElementById('productModal').classList.remove('hidden');
    }

    static closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        document.getElementById('productForm').reset();
    }

    static showContainerForm() {
        document.getElementById('containerModal').classList.remove('hidden');
    }

    static closeContainerModal() {
        document.getElementById('containerModal').classList.add('hidden');
        document.getElementById('containerForm').reset();
    }

    static showDashboard() {
        this.currentShipment = null;
        document.getElementById('currentShipmentName').textContent = 'Dashboard';
        this.loadDashboard();
    }

    // Delete functions
    static async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await API.deleteProduct(productId);
            Utils.showNotification('Product deleted successfully!', 'success');
            this.openShipment(this.currentShipment.id); // Refresh
        } catch (error) {
            Utils.handleApiError(error);
        }
    }

    static async deleteContainer(containerId) {
        if (!confirm('Are you sure you want to delete this container?')) return;

        try {
            await API.deleteContainer(containerId);
            Utils.showNotification('Container deleted successfully!', 'success');
            this.openShipment(this.currentShipment.id); // Refresh
        } catch (error) {
            Utils.handleApiError(error);
        }
    }
}

// Global functions (called from HTML)
function showNewShipmentModal() {
    const name = prompt('Enter shipment name:');
    if (name) {
        createNewShipment(name);
    }
}

async function createNewShipment(name) {
    try {
        const shipment = await API.createShipment({ name });
        Utils.showNotification('Shipment created successfully!', 'success');
        App.openShipment(shipment.id);
    } catch (error) {
        Utils.handleApiError(error);
    }
}

function showProductForm() {
    App.showProductForm();
}

function closeProductModal() {
    App.closeProductModal();
}

function showContainerForm() {
    App.showContainerForm();
}

function closeContainerModal() {
    App.closeContainerModal();
}

function showDashboard() {
    App.showDashboard();
}

function showProductLibrary() {
    // This would open a product library modal
    Utils.showNotification('Product library coming soon!', 'info');
}

function showShipmentSearch() {
    Utils.showNotification('Shipment search coming soon!', 'info');
}

function showSettings() {
    Utils.showNotification('Settings coming soon!', 'info');
}

function logout() {
    Auth.logout();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('hidden');
}

function toggleFolder(folderId) {
    console.log('Toggle folder:', folderId);
    // This would expand/collapse folder contents
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});