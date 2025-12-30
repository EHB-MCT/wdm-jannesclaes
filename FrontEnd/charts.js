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

    // ==========================================
    // BEHAVIORAL ANALYSIS CHARTS
    // ==========================================

    // Behavioral Metrics Radar Chart
    createBehavioralRadarChart(analysisData, canvasId = 'behavioralRadarChart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Behavioral radar canvas (${canvasId}) not found!`);
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating behavioral radar chart with data:', analysisData);
        
        const metrics = [
            { key: 'hesitationScore', label: 'Aarzeling', max: 100 },
            { key: 'decisionEfficiency', label: 'Beslissingsefficiëntie', max: 100 },
            { key: 'movementEfficiency', label: 'Bewegingsefficiëntie', max: 100 },
            { key: 'interactionComplexity', label: 'Interactiecomplexiteit', max: 100 },
            { key: 'cognitiveLoad', label: 'Cognitieve Belasting', max: 100 }
        ];
        
        const labels = metrics.map(m => m.label);
        const data = metrics.map(m => {
            const value = analysisData[m.key] || 0;
            return Math.round((value / 100) * m.max); // Normalize to 0-100 scale
        });
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Uw Gedragsprofiel',
                    data: data,
                    backgroundColor: this.colors.primary + '40',
                    borderColor: this.colors.primary,
                    borderWidth: 2,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.colors.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Behavioral Trends Line Chart
    createBehavioralTrendsChart(trendData, canvasId = 'behavioralTrendsChart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Behavioral trends canvas (${canvasId}) not found!`);
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating behavioral trends chart with data:', trendData);
        
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('nl-NL', { day: 'short', month: 'short' });
        });
        
        const datasets = [
            {
                label: 'Aarzeling',
                data: trendData.map(item => Math.round((item.hesitationScore || 0) * 100)),
                borderColor: this.colors.primary,
                backgroundColor: this.colors.primary + '20',
                tension: 0.4
            },
            {
                label: 'Beslissingsefficiëntie',
                data: trendData.map(item => Math.round((item.decisionEfficiency || 0) * 100)),
                borderColor: this.colors.secondary,
                backgroundColor: this.colors.secondary + '20',
                tension: 0.4
            },
            {
                label: 'Bewegingsefficiëntie',
                data: trendData.map(item => Math.round((item.movementEfficiency || 0) * 100)),
                borderColor: this.colors.tertiary,
                backgroundColor: this.colors.tertiary + '20',
                tension: 0.4
            }
        ];
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Behavioral Profile Distribution Chart
    createBehavioralProfileChart(profileData, canvasId = 'behavioralProfileChart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Behavioral profile canvas (${canvasId}) not found!`);
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating behavioral profile chart with data:', profileData);
        
        const labels = Object.keys(profileData);
        const data = Object.values(profileData);
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.tertiary,
                        this.colors.quaternary,
                        this.colors.quinary,
                        this.colors.gray
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    // Comparative Analysis Chart (User vs Average)
    createComparativeAnalysisChart(userData, averageData, canvasId = 'comparativeAnalysisChart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Comparative analysis canvas (${canvasId}) not found!`);
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating comparative analysis chart');
        
        const metrics = [
            { key: 'hesitationScore', label: 'Aarzeling' },
            { key: 'decisionEfficiency', label: 'Beslissingsefficiëntie' },
            { key: 'movementEfficiency', label: 'Bewegingsefficiëntie' },
            { key: 'interactionComplexity', label: 'Interactiecomplexiteit' },
            { key: 'cognitiveLoad', label: 'Cognitieve Belasting' }
        ];
        
        const labels = metrics.map(m => m.label);
        const userDataPoints = metrics.map(m => Math.round((userData[m.key] || 0) * 100));
        const avgDataPoints = metrics.map(m => Math.round((averageData[m.key] || 0) * 100));
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Uw Score',
                        data: userDataPoints,
                        backgroundColor: this.colors.primary,
                        borderWidth: 1
                    },
                    {
                        label: 'Gemiddelde',
                        data: avgDataPoints,
                        backgroundColor: this.colors.secondary,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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

    // Initialize all charts
    async initializeCharts() {
        try {
            console.log('Initializing admin charts...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Wait for chart canvases to be available
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                const vehicleCanvas = document.getElementById('vehicleUsageChart');
                if (vehicleCanvas) break;
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                throw new Error('Chart canvases not found after waiting');
            }
            
            const overviewData = await this.fetchOverviewStats();
            console.log('Overview data:', overviewData);
            console.log('Performance trend data:', overviewData.performanceTrend);
            const rankingsData = await this.fetchRankings();
            console.log('Rankings data:', rankingsData);
            
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
            
            // Load user selection
            await this.loadUserSelection();
            
            // Initialize admin behavioral charts if we have admin charts container
            const adminChartsContainer = document.getElementById('admin-charts-container');
            if (adminChartsContainer) {
                await this.initializeAdminBehavioralCharts();
            }
            
            console.log('All charts initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing charts:', error);
            this.showErrorToUser('Kan grafieken niet initialiseren: ' + error.message);
        }
    }



    // Method for debounced filter updates
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

    // ==========================================
    // ADMIN BEHAVIORAL ANALYSIS CHARTS
    // ==========================================

    // Fetch behavioral metrics for admin dashboard
    async fetchBehavioralMetrics() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/analyze/metrics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }

    // Admin Behavioral Profile Distribution Chart
    createAdminBehavioralProfileChart(tagData) {
        const canvas = document.getElementById('adminBehavioralProfileChart');
        if (!canvas) {
            console.error('Admin behavioral profile canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.adminBehavioralProfile) {
            this.charts.adminBehavioralProfile.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating admin behavioral profile chart with data:', tagData);
        
        const labels = Object.keys(tagData);
        const data = Object.values(tagData);
        
        this.charts.adminBehavioralProfile = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.tertiary,
                        this.colors.quaternary,
                        this.colors.quinary,
                        this.colors.gray,
                        '#FF6B6B',
                        '#4ECDC4'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Admin Behavioral Average Metrics Chart
    createAdminBehavioralAverageChart(averageData) {
        const canvas = document.getElementById('adminBehavioralAverageChart');
        if (!canvas) {
            console.error('Admin behavioral average canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.adminBehavioralAverage) {
            this.charts.adminBehavioralAverage.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating admin behavioral average chart with data:', averageData);
        
        const metrics = [
            { key: 'hesitationScore', label: 'Aarzeling' },
            { key: 'decisionEfficiency', label: 'Beslissingsefficiëntie' },
            { key: 'movementEfficiency', label: 'Bewegingsefficiëntie' },
            { key: 'interactionComplexity', label: 'Interactiecomplexiteit' },
            { key: 'cognitiveLoad', label: 'Cognitieve Belasting' }
        ];
        
        const labels = metrics.map(m => m.label);
        const data = metrics.map(m => Math.round((averageData[m.key] || 0) * 100));
        
        this.charts.adminBehavioralAverage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gemiddelde Score (%)',
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
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Admin Behavioral Tags Frequency Chart
    createAdminBehavioralTagsChart(tagData) {
        const canvas = document.getElementById('adminBehavioralTagsChart');
        if (!canvas) {
            console.error('Admin behavioral tags canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.adminBehavioralTags) {
            this.charts.adminBehavioralTags.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating admin behavioral tags chart with data:', tagData);
        
        const labels = Object.keys(tagData);
        const data = Object.values(tagData);
        
        this.charts.adminBehavioralTags = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Aantal Gebruikers',
                    data: data,
                    backgroundColor: this.colors.secondary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Aantal Gebruikers'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Admin Cognitive Load Distribution Chart
    createAdminCognitiveLoadChart(analysisData) {
        const canvas = document.getElementById('adminCognitiveLoadChart');
        if (!canvas) {
            console.error('Admin cognitive load canvas not found!');
            return;
        }
        
        // Destroy existing chart if present
        if (this.charts.adminCognitiveLoad) {
            this.charts.adminCognitiveLoad.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        console.log('Creating admin cognitive load chart');
        
        // Create distribution bins
        const bins = {
            '0-20%': 0,
            '20-40%': 0,
            '40-60%': 0,
            '60-80%': 0,
            '80-100%': 0
        };
        
        // This would normally use real data, for now create sample distribution
        bins['0-20%'] = Math.floor(Math.random() * 5) + 2;
        bins['20-40%'] = Math.floor(Math.random() * 8) + 5;
        bins['40-60%'] = Math.floor(Math.random() * 12) + 8;
        bins['60-80%'] = Math.floor(Math.random() * 10) + 6;
        bins['80-100%'] = Math.floor(Math.random() * 3) + 1;
        
        this.charts.adminCognitiveLoad = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(bins),
                datasets: [{
                    label: 'Aantal Gebruikers',
                    data: Object.values(bins),
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
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Aantal Gebruikers'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Initialize admin behavioral charts
    async initializeAdminBehavioralCharts() {
        try {
            console.log('Initializing admin behavioral charts...');
            
            const metrics = await this.fetchBehavioralMetrics();
            
            if (metrics.success && metrics.systemMetrics) {
                const tagData = metrics.systemMetrics.behavioralTagDistribution;
                const averageData = metrics.systemMetrics.averageBiasedScores;
                
                // Create admin behavioral charts
                this.createAdminBehavioralProfileChart(tagData);
                this.createAdminBehavioralAverageChart(averageData);
                this.createAdminBehavioralTagsChart(tagData);
                this.createAdminCognitiveLoadChart(metrics.systemMetrics);
                
                console.log('✓ Admin behavioral charts initialized successfully!');
            } else {
                console.warn('No behavioral metrics available for admin charts');
            }
            
        } catch (error) {
            console.error('Error initializing admin behavioral charts:', error);
            this.showErrorToUser('Kan gedragsgrafieken niet initialiseren: ' + error.message);
        }
    }

    // ==========================================
    // BEHAVIORAL ANALYSIS MODAL SYSTEM
    // ==========================================

    // Show behavioral analysis modal with charts
    showBehavioralAnalysisModal(analysisData, userName = 'Gebruiker') {
        // Create modal if it doesn't exist
        let modal = document.getElementById('behavioralModal');
        if (!modal) {
            modal = this.createBehavioralModal();
        }

        // Update modal content
        this.updateBehavioralModalContent(modal, analysisData, userName);
        
        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Initialize charts after modal is visible
        setTimeout(() => {
            this.initializeBehavioralCharts(analysisData);
        }, 100);
    }

    // Create modal HTML structure
    createBehavioralModal() {
        const modal = document.createElement('div');
        modal.id = 'behavioralModal';
        modal.className = 'behavioral-modal';
        modal.innerHTML = `
            <div class="behavioral-modal-content">
                <div class="behavioral-modal-header">
                    <h2 class="behavioral-modal-title">Gedragsanalyse Resultaten</h2>
                    <button class="behavioral-modal-close" onclick="window.adminChartsInstance.closeBehavioralModal()">&times;</button>
                </div>
                <div class="behavioral-modal-body">
                    <div class="behavioral-summary">
                        <h3>📊 Samenvatting</h3>
                        <div id="behavioralSummaryContent"></div>
                    </div>
                    
                    <div class="behavioral-charts-grid">
                        <div class="behavioral-chart-container">
                            <h4>Gedragsprofiel</h4>
                            <canvas id="behavioralRadarChart"></canvas>
                        </div>
                        <div class="behavioral-chart-container">
                            <h4>Comparatieve Analyse</h4>
                            <canvas id="comparativeAnalysisChart"></canvas>
                        </div>
                        <div class="behavioral-chart-container">
                            <h4>Gedragsprofiel Distributie</h4>
                            <canvas id="behavioralProfileChart"></canvas>
                        </div>
                        <div class="behavioral-chart-container">
                            <h4>Gedragstrends</h4>
                            <canvas id="behavioralTrendsChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="behavioral-warning">
                        <strong>⚠️ Belangrijke Opmerking</strong>
                        Dit is een "Weapon of Math Destruction" - een bias algoritme dat uitsluitend voor educatieve doeleinden wordt gebruikt. 
                        De resultaten zijn bedoeld om de gevaren van algoritmische bias te demonstreren en moeten niet serieus worden genomen.
                    </div>
                </div>
            </div>
        `;

        // Add close modal functionality when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeBehavioralModal();
            }
        });

        // Add escape key functionality
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeBehavioralModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);
        return modal;
    }

    // Update modal content with analysis data
    updateBehavioralModalContent(modal, analysisData, userName) {
        const summaryContent = document.getElementById('behavioralSummaryContent');
        
        const metrics = [
            { key: 'hesitationScore', label: 'Aarzeling', icon: '🤔' },
            { key: 'decisionEfficiency', label: 'Beslissingsefficiëntie', icon: '⚡' },
            { key: 'movementEfficiency', label: 'Bewegingsefficiëntie', icon: '🖱️' },
            { key: 'interactionComplexity', label: 'Interactiecomplexiteit', icon: '🧩' },
            { key: 'cognitiveLoad', label: 'Cognitieve Belasting', icon: '🧠' }
        ];

        const metricsHTML = metrics.map(metric => {
            const value = Math.round((analysisData[metric.key] || 0) * 100);
            return `
                <div class="metric-item">
                    <div class="metric-value">${value}%</div>
                    <div class="metric-label">${metric.icon} ${metric.label}</div>
                </div>
            `;
        }).join('');

        const tagsHTML = (analysisData.behavioralTags || []).map(tag => 
            `<span class="behavioral-tag">${tag}</span>`
        ).join('');

        summaryContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <strong style="font-size: 1.2rem; color: #333;">Analyse van ${userName}</strong>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 2rem; font-weight: bold; color: var(--red);">
                    ${Math.round((analysisData.hesitationScore || 0) * 100)}%
                </div>
                <div style="color: #666;">Algemene Score</div>
            </div>
            <div class="behavioral-metrics">
                ${metricsHTML}
            </div>
            ${tagsHTML ? `
                <div style="margin-top: 20px;">
                    <strong>Gedragstags:</strong>
                    <div class="behavioral-tags">
                        ${tagsHTML}
                    </div>
                </div>
            ` : ''}
            <div style="margin-top: 15px; text-align: center; color: #666; font-size: 0.9rem;">
                Data Points Geanalyseerd: ${analysisData.dataPoints || 0}
            </div>
        `;

        // Update modal title with user name
        const modalTitle = modal.querySelector('.behavioral-modal-title');
        modalTitle.textContent = `Gedragsanalyse van ${userName}`;
    }

    // Initialize all behavioral charts in modal
    async initializeBehavioralCharts(analysisData) {
        try {
            // Create radar chart
            this.createBehavioralRadarChart(analysisData);
            
            // Get average data for comparison
            const averageData = await this.fetchAverageBehavioralData();
            if (averageData) {
                this.createComparativeAnalysisChart(analysisData, averageData);
            }
            
            // Create profile distribution chart (mock data for now)
            const profileData = {
                'Efficiënt': 35,
                'Analytisch': 25,
                'Aarzelend': 20,
                'Impulsief': 15,
                'Methodisch': 5
            };
            this.createBehavioralProfileChart(profileData);
            
            // Create trends chart (mock data for now)
            const trendData = this.generateMockTrendData(analysisData);
            this.createBehavioralTrendsChart(trendData);
            
        } catch (error) {
            console.error('Error initializing behavioral charts:', error);
        }
    }

    // Fetch average behavioral data for comparison
    async fetchAverageBehavioralData() {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await fetch(`${window.BACKEND_URL || 'http://localhost:5050'}/api/analyze/average`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching average behavioral data:', error);
        }
        
        // Return fallback data
        return {
            hesitationScore: 0.3,
            decisionEfficiency: 0.6,
            movementEfficiency: 0.7,
            interactionComplexity: 0.4,
            cognitiveLoad: 0.5
        };
    }

    // Generate mock trend data for demonstration
    generateMockTrendData(currentData) {
        const days = 7;
        const trendData = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Generate data with some variation around current values
            const variation = 0.1;
            trendData.push({
                date: date.toISOString(),
                hesitationScore: Math.max(0, Math.min(1, (currentData.hesitationScore || 0.5) + (Math.random() - 0.5) * variation)),
                decisionEfficiency: Math.max(0, Math.min(1, (currentData.decisionEfficiency || 0.5) + (Math.random() - 0.5) * variation)),
                movementEfficiency: Math.max(0, Math.min(1, (currentData.movementEfficiency || 0.5) + (Math.random() - 0.5) * variation))
            });
        }
        
        return trendData;
    }

    // Close behavioral modal
    closeBehavioralModal() {
        const modal = document.getElementById('behavioralModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Clean up charts after modal closes
            setTimeout(() => {
                ['behavioralRadarChart', 'comparativeAnalysisChart', 'behavioralProfileChart', 'behavioralTrendsChart'].forEach(chartId => {
                    if (this.charts[chartId]) {
                        this.charts[chartId].destroy();
                        delete this.charts[chartId];
                    }
                });
            }, 300);
        }
    }

    // Load users for admin filter dropdown
    async loadUserSelection() {
        const rankingsData = await this.fetchRankings();
        const userFilter = document.getElementById('userFilter');
        
        // Populate admin user filter
        if (userFilter && rankingsData && rankingsData.userRankings) {
            userFilter.innerHTML = '';
            userFilter.appendChild(new Option('Alle Gebruikers', 'all'));
            
            rankingsData.userRankings.forEach(user => {
                if (user.username) {
                    // Simplified ObjectId conversion - should work now that backend is fixed
                    const userIdStr = user._id ? String(user._id) : 'unknown';
                    const option = new Option(user.username, userIdStr);
                    userFilter.appendChild(option);
                }
            });
        }
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
            const userFilterElement = document.getElementById('userFilter');
            const dateFrom = document.getElementById('dateFromFilter')?.value || '';
            const dateTo = document.getElementById('dateToFilter')?.value || '';
            
            // Get userId and ensure it's a string
            let userId = 'all';
            if (userFilterElement) {
                const rawValue = userFilterElement.value;
                
                // Force string conversion and handle problematic cases
                if (rawValue && rawValue !== 'all') {
                    userId = String(rawValue).trim();
                    
                    if (userId === '[object Object]' || 
                        userId.includes('object') || 
                        userId === 'undefined' || 
                        userId === 'null' ||
                        userId.length === 0 ||
                        userId === 'unknown') {
                        console.warn('Invalid userId detected, using "all". Value was:', userId);
                        userId = 'all';
                    }
                }
            }
            
            const filters = {
                performance,
                vehicle,
                userId,
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