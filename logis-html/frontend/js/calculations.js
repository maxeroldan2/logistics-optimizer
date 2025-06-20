// Calculation utilities for logistics optimization
class Calculations {
    // Calculate product efficiency score
    static calculateProductScore(product) {
        const volume = Utils.calculateVolume(product.height, product.width, product.length);
        const profit = product.resale_price - product.purchase_price;
        const profitMargin = (profit / product.purchase_price) * 100;
        const turnoverRate = 30 / product.days_to_sell; // Annualized turnover
        const volumeEfficiency = profit / volume; // Profit per cubic cm
        
        // Weighted scoring system
        const marginScore = Math.min(profitMargin * 2, 100); // Up to 50% margin gets 100 points
        const turnoverScore = Math.min(turnoverRate * 25, 100); // Daily turnover * 25
        const volumeScore = Math.min(volumeEfficiency * 1000, 100); // Adjust multiplier as needed
        
        // Weighted average: 40% margin, 30% turnover, 30% volume efficiency
        const finalScore = (marginScore * 0.4) + (turnoverScore * 0.3) + (volumeScore * 0.3);
        
        return {
            score: Math.round(finalScore),
            profit,
            profitMargin,
            turnoverRate,
            volumeEfficiency,
            volume,
            breakdown: {
                marginScore: Math.round(marginScore),
                turnoverScore: Math.round(turnoverScore),
                volumeScore: Math.round(volumeScore)
            }
        };
    }

    // Calculate container utilization
    static calculateContainerUtilization(container, products) {
        const containerVolume = Utils.calculateVolume(
            container.height, 
            container.width, 
            container.length
        );
        
        const assignedProducts = products.filter(p => p.container_id === container.id);
        
        let usedVolume = 0;
        let usedWeight = 0;
        let totalValue = 0;
        let totalProfit = 0;
        
        assignedProducts.forEach(product => {
            const productVolume = Utils.calculateVolume(product.height, product.width, product.length);
            const quantity = product.quantity || 1;
            
            usedVolume += productVolume * quantity;
            usedWeight += product.weight * quantity;
            totalValue += product.resale_price * quantity;
            totalProfit += (product.resale_price - product.purchase_price) * quantity;
        });
        
        const volumeUtilization = (usedVolume / containerVolume) * 100;
        const weightUtilization = (usedWeight / container.weight_limit) * 100;
        
        return {
            containerVolume,
            usedVolume,
            usedWeight,
            volumeUtilization: Math.round(volumeUtilization),
            weightUtilization: Math.round(weightUtilization),
            totalValue,
            totalProfit,
            productCount: assignedProducts.length,
            remainingVolume: containerVolume - usedVolume,
            remainingWeight: container.weight_limit - usedWeight,
            isOverweight: usedWeight > container.weight_limit,
            isOvervolume: usedVolume > containerVolume
        };
    }

    // Calculate shipment metrics
    static calculateShipmentMetrics(shipment, containers, products) {
        let totalProfit = 0;
        let totalValue = 0;
        let totalVolume = 0;
        let totalWeight = 0;
        let totalProducts = 0;
        let averageScore = 0;
        let scoreSum = 0;
        
        // Calculate per-product metrics
        products.forEach(product => {
            const quantity = product.quantity || 1;
            const profit = (product.resale_price - product.purchase_price) * quantity;
            const productScore = this.calculateProductScore(product);
            
            totalProfit += profit;
            totalValue += product.resale_price * quantity;
            totalVolume += Utils.calculateVolume(product.height, product.width, product.length) * quantity;
            totalWeight += product.weight * quantity;
            totalProducts += quantity;
            scoreSum += productScore.score * quantity;
        });
        
        if (totalProducts > 0) {
            averageScore = scoreSum / totalProducts;
        }
        
        // Calculate container utilization
        const containerMetrics = containers.map(container => 
            this.calculateContainerUtilization(container, products)
        );
        
        const totalContainerVolume = containers.reduce((sum, container) => 
            sum + Utils.calculateVolume(container.height, container.width, container.length), 0
        );
        
        const totalContainerWeight = containers.reduce((sum, container) => 
            sum + container.weight_limit, 0
        );
        
        const overallVolumeUtilization = totalContainerVolume > 0 ? 
            (totalVolume / totalContainerVolume) * 100 : 0;
        
        const overallWeightUtilization = totalContainerWeight > 0 ? 
            (totalWeight / totalContainerWeight) * 100 : 0;
        
        return {
            totalProfit,
            totalValue,
            totalVolume,
            totalWeight,
            totalProducts,
            totalContainers: containers.length,
            averageScore: Math.round(averageScore),
            overallVolumeUtilization: Math.round(overallVolumeUtilization),
            overallWeightUtilization: Math.round(overallWeightUtilization),
            profitMargin: totalValue > 0 ? ((totalProfit / (totalValue - totalProfit)) * 100) : 0,
            containerMetrics,
            unassignedProducts: products.filter(p => !p.container_id).length
        };
    }

    // Calculate optimal product assignment to containers
    static calculateOptimalAssignment(containers, products) {
        const unassignedProducts = products.filter(p => !p.container_id);
        const assignments = [];
        
        // Sort products by efficiency score (descending)
        const sortedProducts = unassignedProducts
            .map(product => ({
                ...product,
                score: this.calculateProductScore(product).score
            }))
            .sort((a, b) => b.score - a.score);
        
        // Sort containers by available space (ascending)
        const sortedContainers = containers
            .map(container => ({
                ...container,
                utilization: this.calculateContainerUtilization(container, products)
            }))
            .sort((a, b) => a.utilization.remainingVolume - b.utilization.remainingVolume);
        
        // Assign products to containers using best-fit algorithm
        sortedProducts.forEach(product => {
            const productVolume = Utils.calculateVolume(product.height, product.width, product.length);
            const productWeight = product.weight * (product.quantity || 1);
            
            // Find best container that can fit this product
            for (const container of sortedContainers) {
                if (container.utilization.remainingVolume >= productVolume && 
                    container.utilization.remainingWeight >= productWeight) {
                    
                    assignments.push({
                        product_id: product.id,
                        container_id: container.id,
                        reason: 'optimal_fit'
                    });
                    
                    // Update container utilization
                    container.utilization.remainingVolume -= productVolume;
                    container.utilization.remainingWeight -= productWeight;
                    break;
                }
            }
        });
        
        return assignments;
    }

    // Calculate ROI (Return on Investment)
    static calculateROI(investment, profit, timeframe = 1) {
        if (investment <= 0) return 0;
        return ((profit / investment) * 100) / timeframe;
    }

    // Calculate break-even point
    static calculateBreakEven(fixedCosts, pricePerUnit, variableCostPerUnit) {
        const contributionMargin = pricePerUnit - variableCostPerUnit;
        if (contributionMargin <= 0) return null;
        return Math.ceil(fixedCosts / contributionMargin);
    }

    // Calculate weighted average turnover
    static calculateWeightedTurnover(products) {
        let totalValue = 0;
        let weightedTurnover = 0;
        
        products.forEach(product => {
            const value = product.resale_price * (product.quantity || 1);
            totalValue += value;
            weightedTurnover += (value * product.days_to_sell);
        });
        
        return totalValue > 0 ? weightedTurnover / totalValue : 0;
    }

    // Calculate inventory velocity
    static calculateInventoryVelocity(products) {
        const averageTurnover = this.calculateWeightedTurnover(products);
        return averageTurnover > 0 ? 365 / averageTurnover : 0;
    }

    // Calculate space efficiency ratio
    static calculateSpaceEfficiency(containers, products) {
        const totalContainerVolume = containers.reduce((sum, container) => 
            sum + Utils.calculateVolume(container.height, container.width, container.length), 0
        );
        
        const totalProductVolume = products.reduce((sum, product) => 
            sum + Utils.calculateVolume(product.height, product.width, product.length) * (product.quantity || 1), 0
        );
        
        return totalContainerVolume > 0 ? (totalProductVolume / totalContainerVolume) : 0;
    }

    // Calculate profit density (profit per unit volume)
    static calculateProfitDensity(products) {
        let totalProfit = 0;
        let totalVolume = 0;
        
        products.forEach(product => {
            const quantity = product.quantity || 1;
            const profit = (product.resale_price - product.purchase_price) * quantity;
            const volume = Utils.calculateVolume(product.height, product.width, product.length) * quantity;
            
            totalProfit += profit;
            totalVolume += volume;
        });
        
        return totalVolume > 0 ? totalProfit / totalVolume : 0;
    }

    // Risk assessment based on turnover and profit margin
    static calculateRiskAssessment(product) {
        const score = this.calculateProductScore(product);
        const profitMargin = score.profitMargin;
        const daysToSell = product.days_to_sell;
        
        let riskLevel = 'low';
        let riskScore = 0;
        
        // High risk factors
        if (daysToSell > 30) riskScore += 30;
        if (profitMargin < 20) riskScore += 25;
        if (product.purchase_price > 1000) riskScore += 20;
        if (score.score < 40) riskScore += 25;
        
        if (riskScore >= 70) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';
        
        return {
            level: riskLevel,
            score: riskScore,
            factors: {
                slowTurnover: daysToSell > 30,
                lowMargin: profitMargin < 20,
                highInvestment: product.purchase_price > 1000,
                lowEfficiency: score.score < 40
            }
        };
    }
}