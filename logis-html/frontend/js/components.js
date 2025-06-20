// UI Components and rendering functions
class Components {
    // Render shipment card
    static renderShipmentCard(shipment) {
        const metrics = shipment.metrics || {
            totalProducts: 0,
            totalContainers: 0,
            totalProfit: 0,
            averageScore: 0
        };

        return `
            <div class="shipment-card" onclick="App.openShipment(${shipment.id})">
                <div class="shipment-card-header">
                    <div>
                        <div class="shipment-card-title">${Utils.escapeHtml(shipment.name)}</div>
                        ${shipment.folder_name ? `<div class="shipment-card-folder">${Utils.escapeHtml(shipment.folder_name)}</div>` : ''}
                    </div>
                    <div class="status-badge active">Active</div>
                </div>
                <div class="shipment-card-stats">
                    <div class="shipment-card-stat">
                        <div class="shipment-card-stat-value">${metrics.totalProducts}</div>
                        <div class="shipment-card-stat-label">Products</div>
                    </div>
                    <div class="shipment-card-stat">
                        <div class="shipment-card-stat-value">${metrics.totalContainers}</div>
                        <div class="shipment-card-stat-label">Containers</div>
                    </div>
                    <div class="shipment-card-stat">
                        <div class="shipment-card-stat-value">${Utils.formatCurrency(metrics.totalProfit)}</div>
                        <div class="shipment-card-stat-label">Profit</div>
                    </div>
                    <div class="shipment-card-stat">
                        <div class="shipment-card-stat-value">${metrics.averageScore}</div>
                        <div class="shipment-card-stat-label">Score</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render container card
    static renderContainerCard(container, products) {
        const utilization = Calculations.calculateContainerUtilization(container, products);
        const assignedProducts = products.filter(p => p.container_id === container.id);
        
        return `
            <div class="container-card" data-container-id="${container.id}">
                <div class="container-card-header">
                    <div>
                        <div class="container-card-title">${Utils.escapeHtml(container.name)}</div>
                        <div class="container-card-dimensions">
                            ${Utils.formatDimensions(container.height, container.width, container.length)}
                            • ${Utils.formatWeight(container.weight_limit)} limit
                        </div>
                    </div>
                    <button class="action-btn danger" onclick="App.deleteContainer(${container.id})" title="Delete container">
                        🗑️
                    </button>
                </div>
                
                <div class="container-utilization">
                    <div class="utilization-bar">
                        <div class="utilization-label">Volume: ${utilization.volumeUtilization}%</div>
                        <div class="utilization-track">
                            <div class="utilization-fill" style="width: ${Math.min(utilization.volumeUtilization, 100)}%"></div>
                        </div>
                    </div>
                    <div class="utilization-bar">
                        <div class="utilization-label">Weight: ${utilization.weightUtilization}%</div>
                        <div class="utilization-track">
                            <div class="utilization-fill" style="width: ${Math.min(utilization.weightUtilization, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <div class="container-card-products ${assignedProducts.length > 0 ? 'has-products' : ''}" 
                     ondrop="App.handleDrop(event, ${container.id})" 
                     ondragover="App.handleDragOver(event)">
                    ${assignedProducts.length > 0 
                        ? assignedProducts.map(product => 
                            `<div class="container-product-chip">${Utils.escapeHtml(product.name)}</div>`
                          ).join('')
                        : '<div class="container-card-empty">Drop products here</div>'
                    }
                </div>
            </div>
        `;
    }

    // Render product table row
    static renderProductRow(product) {
        const score = Calculations.calculateProductScore(product);
        const profit = score.profit * (product.quantity || 1);
        const icon = Utils.getProductIcon(product.icon);
        const container = App.currentShipment?.containers?.find(c => c.id === product.container_id);
        
        return `
            <tr draggable="true" data-product-id="${product.id}" ondragstart="App.handleDragStart(event, ${product.id})">
                <td>
                    <div class="product-name">
                        <span class="drag-handle">⋮⋮</span>
                        <span class="product-icon">${icon}</span>
                        <div>
                            <div>${Utils.escapeHtml(product.name)}</div>
                            <div class="product-dimensions">
                                ${Utils.formatDimensions(product.height, product.width, product.length)}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${Utils.formatDimensions(product.height, product.width, product.length)}</td>
                <td>${Utils.formatWeight(product.weight)}</td>
                <td class="product-profit">${Utils.formatCurrency(profit)}</td>
                <td>
                    <div class="efficiency-bar">
                        <div class="efficiency-bar-fill ${Utils.getEfficiencyColorClass(score.score)}" 
                             style="width: ${score.score}%"></div>
                    </div>
                    <div class="efficiency-score">${score.score}/100</div>
                </td>
                <td>
                    <div class="container-assignment ${container ? 'assigned' : ''}">
                        ${container ? Utils.escapeHtml(container.name) : 'Unassigned'}
                    </div>
                </td>
                <td>
                    <button class="action-btn" onclick="App.editProduct(${product.id})" title="Edit product">
                        ✏️
                    </button>
                    <button class="action-btn danger" onclick="App.deleteProduct(${product.id})" title="Delete product">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    // Render empty state
    static renderEmptyState(title, message, actionText, actionCallback) {
        return `
            <div class="empty-state text-center">
                <div class="empty-state-icon">📦</div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-message text-muted">${message}</p>
                ${actionText ? `<button class="btn btn-primary" onclick="${actionCallback}">${actionText}</button>` : ''}
            </div>
        `;
    }

    // Render loading skeleton
    static renderSkeleton(type = 'card') {
        const skeletonCard = `
            <div class="skeleton-card">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-stats">
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                </div>
            </div>
        `;

        const skeletonTable = `
            <tr class="skeleton-row">
                <td><div class="skeleton-line"></div></td>
                <td><div class="skeleton-line short"></div></td>
                <td><div class="skeleton-line short"></div></td>
                <td><div class="skeleton-line"></div></td>
                <td><div class="skeleton-line short"></div></td>
                <td><div class="skeleton-line short"></div></td>
                <td><div class="skeleton-line short"></div></td>
            </tr>
        `;

        if (type === 'table') {
            return Array(3).fill(skeletonTable).join('');
        }
        
        return Array(3).fill(skeletonCard).join('');
    }

    // Render product template card (for library)
    static renderProductTemplate(template) {
        const icon = Utils.getProductIcon(template.icon);
        
        return `
            <div class="template-card" onclick="App.applyProductTemplate('${template.id}')">
                <div class="template-card-icon">${icon}</div>
                <div class="template-card-content">
                    <div class="template-card-title">${Utils.escapeHtml(template.name)}</div>
                    <div class="template-card-description">
                        ${Utils.formatDimensions(template.height, template.width, template.length)} • 
                        ${Utils.formatWeight(template.weight)}
                    </div>
                    <div class="template-card-price">
                        ${Utils.formatCurrency(template.estimatedPurchasePrice)} → 
                        ${Utils.formatCurrency(template.estimatedResalePrice)}
                    </div>
                </div>
            </div>
        `;
    }

    // Render utilization bar
    static renderUtilizationBar(label, percentage, type = 'primary') {
        const colorClass = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success';
        
        return `
            <div class="utilization-bar">
                <div class="utilization-header">
                    <span class="utilization-label">${label}</span>
                    <span class="utilization-percentage">${percentage}%</span>
                </div>
                <div class="utilization-track">
                    <div class="utilization-fill utilization-${colorClass}" 
                         style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }

    // Render metric card
    static renderMetricCard(icon, label, value, change = null) {
        return `
            <div class="score-card">
                <div class="score-card-icon">${icon}</div>
                <div class="score-card-content">
                    <div class="score-card-label">${label}</div>
                    <div class="score-card-value">${value}</div>
                    ${change ? `<div class="score-card-change ${change.type}">${change.text}</div>` : ''}
                </div>
            </div>
        `;
    }

    // Render breadcrumb
    static renderBreadcrumb(items) {
        return items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `
                ${index > 0 ? '<span class="breadcrumb-separator">></span>' : ''}
                ${isLast 
                    ? `<span class="breadcrumb-current">${item.text}</span>`
                    : `<a href="#" onclick="${item.action}" class="breadcrumb-link">${item.text}</a>`
                }
            `;
        }).join('');
    }

    // Render filter dropdown
    static renderFilterDropdown(options, selected, onChangeCallback) {
        return `
            <select class="filter-dropdown" onchange="${onChangeCallback}(this.value)">
                ${options.map(option => `
                    <option value="${option.value}" ${option.value === selected ? 'selected' : ''}>
                        ${option.label}
                    </option>
                `).join('')}
            </select>
        `;
    }

    // Render search input
    static renderSearchInput(placeholder, onInputCallback) {
        return `
            <div class="search-input-container">
                <input type="text" 
                       class="search-input" 
                       placeholder="${placeholder}"
                       oninput="${onInputCallback}(this.value)">
                <span class="search-icon">🔍</span>
            </div>
        `;
    }
}