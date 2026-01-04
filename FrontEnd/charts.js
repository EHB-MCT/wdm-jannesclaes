class AdminCharts {
    constructor() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }
        
        console.log('Chart.js is available, version:', Chart.version);
        this.charts = {};
        this.colors = {
            primary: '#ff2e1f',
            secondary: '#4CAF50',
            tertiary: '#2196F3',
            quaternary: '#FF9800',
            quinary: '#9C27B0',
            gray: '#666',
            lightGray: '#e6e6e6'
        };
        
        // Auto-refresh properties
        this.refreshInterval = null;
    }

    // API calls
    async fetchOverviewStats(filters = {}) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const queryString = new URLSearchParams(filters).toString();
        const url = `${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/stats/overview${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    async fetchUserStats(userId) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/stats/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('fetchUserStats error:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async fetchRankings(filters = {}) {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const queryString = new URLSearchParams(filters).toString();
        const url = `${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/stats/rankings${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    // Vehicle Usage Bar Chart
    createVehicleUsageChart(vehicleStats) {
        const canvas = document.getElementById('vehicleUsageChart');
        if (!canvas) {
            console.error('Vehicle usage canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.vehicleUsage) {
            this.charts.vehicleUsage.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating vehicle usage chart with data:', vehicleStats);
        
        const labels = vehicleStats.map(item => item._id || 'Onbekend');
        const data = vehicleStats.map(item => item.count || 0);
        
        this.charts.vehicleUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Aantal Ritten',
                    data: data,
                    backgroundColor: this.colors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Monthly Activity Bar Chart
    createMonthlyActivityChart(monthlyActivity) {
        const canvas = document.getElementById('monthlyActivityChart');
        if (!canvas) {
            console.error('Monthly activity canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.monthlyActivity) {
            this.charts.monthlyActivity.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating monthly activity chart with data:', monthlyActivity);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = monthlyActivity.map(item => {
            if (!item._id || !item._id.month || !item._id.year) return 'Onbekend';
            return `${monthNames[item._id.month - 1]} ${item._id.year}`;
        });
        const data = monthlyActivity.map(item => item.count || 0);
        
        this.charts.monthlyActivity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ritten per Maand',
                    data: data,
                    backgroundColor: this.colors.tertiary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // User Rankings Horizontal Bar Chart
    createUserRankingsChart(userRankings) {
        const canvas = document.getElementById('userRankingsChart');
        if (!canvas) {
            console.error('User rankings canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.userRankings) {
            this.charts.userRankings.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating user rankings chart with data:', userRankings);
        
        const topUsers = userRankings.slice(0, 10);
        const labels = topUsers.map(user => user.username || 'Onbekend');
        const data = topUsers.map(user => Math.round(user.avgEfficiency || 0));
        
        this.charts.userRankings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gemiddelde Efficiëntie',
                    data: data,
                    backgroundColor: this.colors.secondary,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Hourly Patterns Line Chart
    createHourlyPatternsChart(hourlyPatterns) {
        const canvas = document.getElementById('hourlyPatternsChart');
        if (!canvas) {
            console.error('Hourly patterns canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.hourlyPatterns) {
            this.charts.hourlyPatterns.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating hourly patterns chart with data:', hourlyPatterns);
        
        const hourlyData = new Array(24).fill(0);
        
        if (hourlyPatterns && hourlyPatterns.length > 0) {
            hourlyPatterns.forEach(item => {
                if (item._id >= 0 && item._id <= 23) {
                    hourlyData[item._id] = item.count;
                }
            });
        }
        
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        this.charts.hourlyPatterns = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ritten per Uur',
                    data: hourlyData,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Environmental Impact Bar Chart
    createEnvironmentalImpactChart(impactByVehicle) {
        const canvas = document.getElementById('environmentalImpactChart');
        if (!canvas) {
            console.error('Environmental impact canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.environmentalImpact) {
            this.charts.environmentalImpact.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating environmental impact chart with data:', impactByVehicle);
        
        if (!impactByVehicle || impactByVehicle.length === 0) return;
        
        const labels = impactByVehicle.map(item => item._id || 'Onbekend');
        const avgEfficiency = impactByVehicle.map(item => Math.round(item.avgEfficiency || 0));
        const totalDistance = impactByVehicle.map(item => Math.round(item.totalDistance || 0));
        
        this.charts.environmentalImpact = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gemiddelde Efficiëntie',
                    data: avgEfficiency,
                    backgroundColor: this.colors.secondary,
                    borderWidth: 1
                }, {
                    label: 'Totaal Afstand (km)',
                    data: totalDistance,
                    backgroundColor: this.colors.tertiary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Performance Trend Line Chart
    createPerformanceTrendChart(performanceTrend) {
        const canvas = document.getElementById('performanceTrendChart');
        if (!canvas) {
            console.error('Performance trend canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.performanceTrend) {
            this.charts.performanceTrend.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating performance trend chart with data:', performanceTrend);
        
        if (!performanceTrend || performanceTrend.length === 0) return;
        
        const labels = performanceTrend.map(item => {
            if (!item._id || !item._id.month || !item._id.year) return 'Onbekend';
            return `${item._id.month}/${item._id.year}`;
        });
        const data = performanceTrend.map(item => Math.round(item.avgScore || 0));
        
        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gemiddelde Efficiëntie',
                    data: data,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Distance vs Efficiency Scatter Chart
    async createDistanceEfficiencyChart(userId = null) {
        const canvas = document.getElementById('distanceEfficiencyChart');
        if (!canvas) {
            console.error('Distance efficiency canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.distanceEfficiency) {
            this.charts.distanceEfficiency.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        let data;
        if (userId) {
            const userStats = await this.fetchUserStats(userId);
            data = userStats.distanceEfficiency;
        } else {
            // Get all trips with user info
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/trips`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const trips = await response.json();
            data = trips;
        }
        
        const scatterData = data.map(trip => ({
            x: trip.distance || 0,
            y: trip.efficiencyScore || 0,
            label: userId ? trip.vehicle : `${trip.username || 'Onbekend'} - ${trip.vehicle || 'Onbekend'}`
        }));
        
        this.charts.distanceEfficiency = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Afstand vs Efficiëntie',
                    data: scatterData,
                    backgroundColor: this.colors.primary,
                    borderColor: this.colors.primary,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Afstand (km)'
                        },
                        beginAtZero: true
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Efficiëntie Score'
                        },
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Initialize all admin charts
    async initializeCharts() {
        try {
            console.log('Initializing admin charts...');
            
            // Show loading state
            this.showLoadingState();
            
            // Fetch initial data
            const overviewData = await this.fetchOverviewStats();
            const rankingsData = await this.fetchRankings();
            
            console.log('Initial overview data:', overviewData);
            console.log('Initial rankings data:', rankingsData);
            
            // Check if data is valid
            if (!overviewData || !rankingsData) {
                throw new Error('Geen data ontvangen van server');
            }
            
            // Create all charts
            this.createVehicleUsageChart(overviewData.vehicleStats || []);
            this.createMonthlyActivityChart(overviewData.monthlyActivity || []);
            this.createUserRankingsChart(rankingsData.userRankings || []);
            this.createHourlyPatternsChart(rankingsData.hourlyPatterns || []);
            this.createEnvironmentalImpactChart(rankingsData.impactByVehicle || []);
            
            // Create performance trend chart
            if (overviewData.performanceTrend && overviewData.performanceTrend.length > 0) {
                this.createPerformanceTrendChart(overviewData.performanceTrend);
            }
            
            // Load user selection
            await this.loadUserSelection();
            
            console.log('All charts initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing charts:', error);
            this.showErrorToUser('Kan grafieken niet initialiseren: ' + error.message);
        } finally {
            // Hide loading state
            this.hideLoadingState();
        }
    }

    // Load user selection dropdown
    async loadUserSelection() {
        try {
            console.log('Loading user selection...');
            
            // Use rankings endpoint to get user data
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/stats/rankings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                console.warn('Could not load user selection:', response.status);
                return;
            }
            
            const rankingsData = await response.json();
            console.log('Rankings data loaded:', rankingsData);
            
            const userSelect = document.getElementById('performanceFilter');
            if (!userSelect) {
                console.warn('User selection dropdown not found');
                return;
            }
            
            // Get unique users from rankings data
            const users = rankingsData.userRankings || [];
            const uniqueUsers = [];
            const userIds = new Set();
            
            users.forEach(user => {
                if (!userIds.has(user._id)) {
                    userIds.add(user._id);
                    uniqueUsers.push({
                        _id: user._id,
                        username: user.username || 'Onbekend'
                    });
                }
            });
            
            // Clear existing options (except the first "all" option)
            const firstOption = userSelect.options[0];
            userSelect.innerHTML = '';
            userSelect.appendChild(firstOption);
            
            // Add user options
            uniqueUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user._id;
                option.textContent = user.username || 'Onbekend';
                userSelect.appendChild(option);
            });
            
            console.log('User selection loaded successfully with', uniqueUsers.length, 'users');
            
        } catch (error) {
            console.error('Error loading user selection:', error);
        }
    }

    applyFiltersWithDebounce(delay = 300) {
        clearTimeout(window.debounceTimer);
        window.debounceTimer = setTimeout(async () => {
            await this.updateChartsWithFilters({});
        }, delay);
    }

    // Update all charts with filters
    async updateChartsWithFilters(filters = {}) {
        try {
            console.log('Updating charts with filters:', filters);
            
            // Clear any existing error messages
            const existingError = document.querySelector('.chart-error');
            if (existingError) existingError.remove();
            
            // Show loading state
            this.showLoadingState();
            
            const overviewData = await this.fetchOverviewStats(filters);
            const rankingsData = await this.fetchRankings(filters);
            
            console.log('Filtered overview data:', overviewData);
            console.log('Filtered rankings data:', rankingsData);
            
            // Check if data is valid
            if (!overviewData || !rankingsData) {
                throw new Error('Geen data ontvangen van server');
            }
            
            // Update all charts with filtered data
            this.updateVehicleUsageChart(overviewData.vehicleStats || []);
            this.updateMonthlyActivityChart(overviewData.monthlyActivity || []);
            this.updateUserRankingsChart(rankingsData.userRankings || []);
            this.updateHourlyPatternsChart(rankingsData.hourlyPatterns || []);
            this.updateEnvironmentalImpactChart(rankingsData.impactByVehicle || []);
            
            // Update performance trend chart
            if (overviewData.performanceTrend && overviewData.performanceTrend.length > 0) {
                this.updatePerformanceTrendChart(overviewData.performanceTrend);
            }
            
            // Update distance efficiency chart
            if (filters.userId && filters.userId !== 'all') {
                await this.updateDistanceEfficiencyChart(filters.userId);
            } else {
                await this.updateDistanceEfficiencyChart();
            }
            
            console.log('Charts updated with filters successfully!');
            
        } catch (error) {
            console.error('Error updating charts with filters:', error);
            this.showErrorToUser('Fout bij het updaten van grafieken: ' + error.message);
        } finally {
            this.hideLoadingState();
        }
    }

    // Update methods for existing charts (update data without recreating)
    updateVehicleUsageChart(vehicleStats) {
        if (!this.charts.vehicleUsage) {
            console.warn('Vehicle usage chart not initialized');
            return;
        }
        if (!vehicleStats || vehicleStats.length === 0) {
            console.warn('No vehicle stats data available');
            return;
        }
        
        const labels = vehicleStats.map(item => item._id || 'Onbekend');
        const data = vehicleStats.map(item => item.count || 0);
        
        this.charts.vehicleUsage.data.labels = labels;
        this.charts.vehicleUsage.data.datasets[0].data = data;
        this.charts.vehicleUsage.update('none');
    }

    updateMonthlyActivityChart(monthlyActivity) {
        if (!this.charts.monthlyActivity) {
            console.warn('Monthly activity chart not initialized');
            return;
        }
        if (!monthlyActivity || monthlyActivity.length === 0) {
            console.warn('No monthly activity data available');
            return;
        }
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = monthlyActivity.map(item => {
            if (!item._id || !item._id.month || !item._id.year) return 'Onbekend';
            return `${monthNames[item._id.month - 1]} ${item._id.year}`;
        });
        const data = monthlyActivity.map(item => item.count || 0);
        
        this.charts.monthlyActivity.data.labels = labels;
        this.charts.monthlyActivity.data.datasets[0].data = data;
        this.charts.monthlyActivity.update('none');
    }

    updateUserRankingsChart(userRankings) {
        if (!this.charts.userRankings) {
            console.warn('User rankings chart not initialized');
            return;
        }
        if (!userRankings || userRankings.length === 0) {
            console.warn('No user rankings data available');
            return;
        }
        
        const topUsers = userRankings.slice(0, 10);
        const labels = topUsers.map(user => user.username || 'Onbekend');
        const data = topUsers.map(user => Math.round(user.avgEfficiency || 0));
        
        this.charts.userRankings.data.labels = labels;
        this.charts.userRankings.data.datasets[0].data = data;
        this.charts.userRankings.update('none');
    }

    updateHourlyPatternsChart(hourlyPatterns) {
        if (!this.charts.hourlyPatterns) {
            console.warn('Hourly patterns chart not initialized');
            return;
        }
        
        const hourlyData = new Array(24).fill(0);
        
        if (hourlyPatterns && hourlyPatterns.length > 0) {
            hourlyPatterns.forEach(item => {
                if (item._id >= 0 && item._id <= 23) {
                    hourlyData[item._id] = item.count;
                }
            });
        }
        
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        this.charts.hourlyPatterns.data.labels = labels;
        this.charts.hourlyPatterns.data.datasets[0].data = hourlyData;
        this.charts.hourlyPatterns.update('none');
    }

    updateEnvironmentalImpactChart(impactByVehicle) {
        if (!this.charts.environmentalImpact) {
            console.warn('Environmental impact chart not initialized');
            return;
        }
        if (!impactByVehicle || impactByVehicle.length === 0) {
            console.warn('No environmental impact data available');
            return;
        }
        
        const labels = impactByVehicle.map(item => item._id || 'Onbekend');
        const avgEfficiency = impactByVehicle.map(item => Math.round(item.avgEfficiency || 0));
        const totalDistance = impactByVehicle.map(item => Math.round(item.totalDistance || 0));
        
        this.charts.environmentalImpact.data.labels = labels;
        this.charts.environmentalImpact.data.datasets[0].data = avgEfficiency;
        this.charts.environmentalImpact.data.datasets[1].data = totalDistance;
        this.charts.environmentalImpact.update('none');
    }

    updatePerformanceTrendChart(performanceTrend) {
        if (!this.charts.performanceTrend) {
            console.warn('Performance trend chart not initialized');
            return;
        }
        if (!performanceTrend || performanceTrend.length === 0) {
            console.warn('No performance trend data available');
            return;
        }
        
        const labels = performanceTrend.map(item => {
            if (!item._id || !item._id.month || !item._id.year) return 'Onbekend';
            return `${item._id.month}/${item._id.year}`;
        });
        const data = performanceTrend.map(item => Math.round(item.avgScore || 0));
        
        this.charts.performanceTrend.data.labels = labels;
        this.charts.performanceTrend.data.datasets[0].data = data;
        this.charts.performanceTrend.update('none');
    }

    async updateDistanceEfficiencyChart(userId = null) {
        if (!this.charts.distanceEfficiency) return;
        
        let data;
        try {
            if (userId) {
                const userStats = await this.fetchUserStats(userId);
                if (!userStats || userStats.message) {
                    console.error('No user stats for distance efficiency chart:', userStats);
                    data = [];
                } else {
                    data = userStats.distanceEfficiency;
                }
            } else {
                // Get all trips with user info
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/admin/trips`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const trips = await response.json();
                data = trips;
            }
            
            // Ensure data is an array before mapping
            const dataArray = Array.isArray(data) ? data : [];
            
            const scatterData = dataArray.map(trip => ({
                x: trip.distance || 0,
                y: trip.efficiencyScore || 0,
                label: userId ? trip.vehicle : `${trip.username || 'Onbekend'} - ${trip.vehicle || 'Onbekend'}`
            }));
            
            this.charts.distanceEfficiency.data.datasets[0].data = scatterData;
            this.charts.distanceEfficiency.update('none');
            
        } catch (error) {
            console.error('Error updating distance efficiency chart:', error);
            // Set empty data to prevent chart errors
            this.charts.distanceEfficiency.data.datasets[0].data = [];
            this.charts.distanceEfficiency.update('none');
        }
    }

    // Show error to user
    showErrorToUser(message) {
        const existing = document.querySelector('.chart-error');
        if (existing) existing.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = message;
        errorMsg.style.cssText = `
            background: #ff2e1f;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            text-align: center;
        `;
        
        const chartsContainer = document.querySelector('.charts-grid');
        if (chartsContainer) {
            chartsContainer.parentNode.insertBefore(errorMsg, chartsContainer);
        }
    }

    // Show loading state
    showLoadingState() {
        const chartsGrid = document.querySelector('.charts-grid');
        if (!chartsGrid) return;
        
        const loading = document.createElement('div');
        loading.id = 'charts-loading';
        loading.innerHTML = '⏳ Grafieken bijwerken...';
        loading.style.cssText = `
            text-align: center;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 4px;
            margin: 10px 0;
            font-weight: bold;
        `;
        
        chartsGrid.parentNode.insertBefore(loading, chartsGrid);
    }

    // Hide loading state
    hideLoadingState() {
        const loading = document.getElementById('charts-loading');
        if (loading) loading.remove();
    }


}

// Export for use in app.js
window.adminChartsInstance = null;
window.AdminCharts = AdminCharts;

// Make function available globally
window.applyFiltersWithDebounce = async (delay = 300) => {
    if (window.adminChartsInstance) {
        clearTimeout(window.debounceTimer);
        window.debounceTimer = setTimeout(async () => {
            // Collect filter values with explicit string conversion
            const performance = document.getElementById('performanceFilter')?.value || 'all';
            const vehicle = document.getElementById('vehicleFilter')?.value || 'all';
            const dateFrom = document.getElementById('dateFromFilter')?.value || '';
            const dateTo = document.getElementById('dateToFilter')?.value || '';
            
            const filters = {
                performance,
                vehicle,
                dateFrom,
                dateTo
            };
            

            
            await window.adminChartsInstance.updateChartsWithFilters(filters);
        }, delay);
    }
};

// Auto-create instance when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.adminChartsInstance = new AdminCharts();
        console.log('AdminCharts instance created and ready');
    }
});