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
    }

    // Initialize all charts
    async initializeCharts() {
        try {
            console.log('Initializing admin charts...');
            

            
            const overviewData = await this.fetchOverviewStats();
            console.log('Overview data:', overviewData);
            console.log('Performance trend data:', overviewData.performanceTrend);
            const rankingsData = await this.fetchRankings();
            console.log('Rankings data:', rankingsData);
            
            // Wait a bit for DOM to be ready
            setTimeout(() => {
                console.log('Creating charts...');
                this.createVehicleUsageChart(overviewData.vehicleStats);
                console.log('✓ Vehicle usage chart created');
                
                this.createMonthlyActivityChart(overviewData.monthlyActivity);
                console.log('✓ Monthly activity chart created');
                
                this.createUserRankingsChart(rankingsData.userRankings);
                console.log('✓ User rankings chart created');
                
                this.createHourlyPatternsChart(rankingsData.hourlyPatterns);
                console.log('✓ Hourly patterns chart created');
                
                this.createEnvironmentalImpactChart(rankingsData.impactByVehicle);
                console.log('✓ Environmental impact chart created');
                
                // Create performance trend chart
                if (overviewData.performanceTrend && overviewData.performanceTrend.length > 0) {
                    this.createPerformanceTrendChart(overviewData.performanceTrend);
                    console.log('✓ Performance trend chart created');
                }
                
                // Create distance efficiency chart
                this.createDistanceEfficiencyChart();
                console.log('✓ Distance efficiency chart created');
                
            }, 100);
            
            // Load user selection
            await this.loadUserSelection();
            
            console.log('All charts initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
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
        
        const labels = vehicleStats.map(item => item._id);
        const data = vehicleStats.map(item => item.count);
        
        this.charts.vehicleUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Aantal Ritten',
                    data: data,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary, 
                        this.colors.tertiary,
                        this.colors.quaternary,
                        this.colors.quinary
                    ],
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
        const labels = monthlyActivity.map(item => 
            `${monthNames[item._id.month - 1]} ${item._id.year}`
        );
        const data = monthlyActivity.map(item => item.count);
        
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
        
        // Take top 10 users
        const topUsers = userRankings.slice(0, 10);
        const labels = topUsers.map(user => user.username);
        const data = topUsers.map(user => Math.round(user.avgEfficiency));
        
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
        
        // Create array for all 24 hours
        const hourlyData = new Array(24).fill(0);
        hourlyPatterns.forEach(item => {
            hourlyData[item._id] = item.count;
        });
        
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
        
        const labels = impactByVehicle.map(item => item._id);
        const avgEfficiency = impactByVehicle.map(item => Math.round(item.avgEfficiency));
        const totalDistance = impactByVehicle.map(item => Math.round(item.totalDistance));
        
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
                    label: 'Totale Afstand (km)',
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
    createPerformanceTrendChart(performanceData) {
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
        
        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: performanceData.map(item => `${item._id.month}/${item._id.year}`),
                datasets: [{
                    label: 'Gemiddelde Efficiëntie',
                    data: performanceData.map(item => Math.round(item.avgScore || item.avgEfficiency || 0)),
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
            x: trip.distance,
            y: trip.efficiencyScore,
            label: userId ? trip.vehicle : `${trip.username} - ${trip.vehicle}`
        }));
        
        if (this.charts.distanceEfficiency) {
            this.charts.distanceEfficiency.destroy();
        }
        
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

    // User Detail Charts
    async loadUserDetailCharts(userId) {
        const userStats = await this.fetchUserStats(userId);
        
        // User Trend Line Chart
        const trendCtx = document.getElementById('userTrendChart').getContext('2d');
        const trendData = userStats.tripTrends;
        
        if (this.charts.userTrend) {
            this.charts.userTrend.destroy();
        }
        
        if (trendData.length > 0) {
            const labels = trendData.map(item => 
                `${item._id.month}/${item._id.year}`
            );
            
            this.charts.userTrend = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gemiddelde Efficiëntie',
                        data: trendData.map(item => Math.round(item.avgEfficiency)),
                        borderColor: this.colors.secondary,
                        backgroundColor: this.colors.secondary + '20',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Totaal Afstand (km)',
                        data: trendData.map(item => Math.round(item.totalDistance)),
                        borderColor: this.colors.tertiary,
                        backgroundColor: this.colors.tertiary + '20',
                        fill: true,
                        tension: 0.4
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
        
        // User Vehicle Bar Chart
        const vehicleCtx = document.getElementById('userVehicleChart').getContext('2d');
        const vehicleData = userStats.vehicleStats;
        
        if (this.charts.userVehicle) {
            this.charts.userVehicle.destroy();
        }
        
        this.charts.userVehicle = new Chart(vehicleCtx, {
            type: 'bar',
            data: {
                labels: vehicleData.map(item => item._id),
                datasets: [{
                    label: 'Aantal Ritten',
                    data: vehicleData.map(item => item.count),
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.tertiary,
                        this.colors.quaternary,
                        this.colors.quinary
                    ]
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
        
        // Update distance efficiency chart for this user
        await this.createDistanceEfficiencyChart(userId);
    }

    // Load users for selection dropdown
    async loadUserSelection() {
        const rankingsData = await this.fetchRankings();
        const select = document.getElementById('userDetailSelect');
        const userFilter = document.getElementById('userFilter');
        
        // Clear existing options except first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        rankingsData.userRankings.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.username;
            select.appendChild(option);
        });
        
        // Also populate admin user filter
        if (userFilter) {
            userFilter.innerHTML = '';
            userFilter.appendChild(new Option('Alle Gebruikers', 'all'));
            
            rankingsData.userRankings.forEach(user => {
                userFilter.appendChild(new Option(user.username, user._id));
            });
        }
        
        // Add event listener
        select.addEventListener('change', async (e) => {
            const userDetailCharts = document.getElementById('userDetailCharts');
            if (e.target.value) {
                userDetailCharts.style.display = 'block';
                await this.loadUserDetailCharts(e.target.value);
            } else {
                userDetailCharts.style.display = 'none';
            }
        });
    }



    // Update all charts with filters
    async updateChartsWithFilters(filters = {}) {
        try {
            console.log('Updating charts with filters:', filters);
            
            const overviewData = await this.fetchOverviewStats(filters);
            const rankingsData = await this.fetchRankings(filters);
            
            console.log('Filtered overview data:', overviewData);
            console.log('Filtered rankings data:', rankingsData);
            
            // Update all charts with filtered data
            this.updateVehicleUsageChart(overviewData.vehicleStats);
            this.updateMonthlyActivityChart(overviewData.monthlyActivity);
            this.updateUserRankingsChart(rankingsData.userRankings);
            this.updateHourlyPatternsChart(rankingsData.hourlyPatterns);
            this.updateEnvironmentalImpactChart(rankingsData.impactByVehicle);
            
            // Update performance trend chart
            if (overviewData.performanceTrend && overviewData.performanceTrend.length > 0) {
                this.updatePerformanceTrendChart(overviewData.performanceTrend);
            }
            
            // Update distance efficiency chart
            if (filters.userId) {
                await this.updateDistanceEfficiencyChart(filters.userId);
            } else {
                await this.updateDistanceEfficiencyChart();
            }
            
            console.log('Charts updated with filters successfully!');
            
        } catch (error) {
            console.error('Error updating charts with filters:', error);
        }
    }

    // Update methods for existing charts (update data without recreating)
    updateVehicleUsageChart(vehicleStats) {
        if (!this.charts.vehicleUsage) return;
        if (!vehicleStats || vehicleStats.length === 0) return;
        
        const labels = vehicleStats.map(item => item._id);
        const data = vehicleStats.map(item => item.count);
        
        this.charts.vehicleUsage.data.labels = labels;
        this.charts.vehicleUsage.data.datasets[0].data = data;
        this.charts.vehicleUsage.update('none'); // Use 'none' for immediate update
    }

    updateMonthlyActivityChart(monthlyActivity) {
        if (!this.charts.monthlyActivity) return;
        if (!monthlyActivity || monthlyActivity.length === 0) return;
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = monthlyActivity.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`);
        const data = monthlyActivity.map(item => item.count);
        
        this.charts.monthlyActivity.data.labels = labels;
        this.charts.monthlyActivity.data.datasets[0].data = data;
        this.charts.monthlyActivity.update('none');
    }

    updateUserRankingsChart(userRankings) {
        if (!this.charts.userRankings) return;
        if (!userRankings || userRankings.length === 0) return;
        
        const topUsers = userRankings.slice(0, 10);
        const labels = topUsers.map(user => user.username);
        const data = topUsers.map(user => Math.round(user.avgEfficiency));
        
        this.charts.userRankings.data.labels = labels;
        this.charts.userRankings.data.datasets[0].data = data;
        this.charts.userRankings.update('none');
    }

    updateHourlyPatternsChart(hourlyPatterns) {
        if (!this.charts.hourlyPatterns) return;
        if (!hourlyPatterns || hourlyPatterns.length === 0) {
            // Show empty chart with all zeros
            const hourlyData = new Array(24).fill(0);
            const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
            this.charts.hourlyPatterns.data.labels = labels;
            this.charts.hourlyPatterns.data.datasets[0].data = hourlyData;
            this.charts.hourlyPatterns.update('none');
            return;
        }
        
        const hourlyData = new Array(24).fill(0);
        hourlyPatterns.forEach(item => {
            hourlyData[item._id] = item.count;
        });
        
        const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        this.charts.hourlyPatterns.data.labels = labels;
        this.charts.hourlyPatterns.data.datasets[0].data = hourlyData;
        this.charts.hourlyPatterns.update('none');
    }

    updateEnvironmentalImpactChart(impactByVehicle) {
        if (!this.charts.environmentalImpact) return;
        if (!impactByVehicle || impactByVehicle.length === 0) return;
        
        const labels = impactByVehicle.map(item => item._id);
        const avgEfficiency = impactByVehicle.map(item => Math.round(item.avgEfficiency));
        const totalDistance = impactByVehicle.map(item => Math.round(item.totalDistance));
        
        this.charts.environmentalImpact.data.labels = labels;
        this.charts.environmentalImpact.data.datasets[0].data = avgEfficiency;
        this.charts.environmentalImpact.data.datasets[1].data = totalDistance;
        this.charts.environmentalImpact.update('none');
    }

    updatePerformanceTrendChart(performanceTrend) {
        if (!this.charts.performanceTrend) return;
        if (!performanceTrend || performanceTrend.length === 0) return;
        
        const labels = performanceTrend.map(item => `${item._id.month}/${item._id.year}`);
        const data = performanceTrend.map(item => Math.round(item.avgScore || 0));
        
        this.charts.performanceTrend.data.labels = labels;
        this.charts.performanceTrend.data.datasets[0].data = data;
        this.charts.performanceTrend.update('none');
    }

    async updateDistanceEfficiencyChart(userId = null) {
        if (!this.charts.distanceEfficiency) return;
        
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
            x: trip.distance,
            y: trip.efficiencyScore,
            label: userId ? trip.vehicle : `${trip.username} - ${trip.vehicle}`
        }));
        
        this.charts.distanceEfficiency.data.datasets[0].data = scatterData;
        this.charts.distanceEfficiency.update('none');
    }

    // Update all charts
    async updateAllCharts() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        // Reinitialize
        await this.initializeCharts();
    }
}

// Create global instance and export
window.adminChartsInstance = null;
window.AdminCharts = AdminCharts;

// Auto-create instance when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.adminChartsInstance = new AdminCharts();
        console.log('AdminCharts instance created and ready');
    }
});