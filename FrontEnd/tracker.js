class TelemetryTracker {
    constructor() {
        this.eventBuffer = [];
        this.isTracking = false;
        this.batchInterval = null;
        this.lastMoveTime = 0;
        this.moveThrottleDelay = 100; // Throttle mousemove events
    }

    // Initialize tracking only if user is authenticated
    init() {
        const token = this.getAuthToken();
        if (!token) {
            console.log('No auth token found, telemetry tracking disabled');
            return;
        }

        this.isTracking = true;
        console.log('Telemetry tracking initialized');
        this.setupEventListeners();
        this.startBatchSending();
    }

    // Stop tracking and cleanup
    stop() {
        this.isTracking = false;
        if (this.batchInterval) {
            clearInterval(this.batchInterval);
            this.batchInterval = null;
        }
        this.removeEventListeners();
        this.eventBuffer = [];
        console.log('Telemetry tracking stopped');
    }

    // Get authentication token from localStorage or sessionStorage
    getAuthToken() {
        return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    // Setup event listeners
    setupEventListeners() {
        this.boundMouseMoveHandler = this.throttleMouseMove.bind(this);
        this.boundClickHandler = this.handleClick.bind(this);
        this.boundMouseOverHandler = this.handleMouseOver.bind(this);

        document.body.addEventListener('mousemove', this.boundMouseMoveHandler);
        document.body.addEventListener('click', this.boundClickHandler);
        document.body.addEventListener('mouseover', this.boundMouseOverHandler);
    }

    // Remove event listeners
    removeEventListeners() {
        if (this.boundMouseMoveHandler) {
            document.body.removeEventListener('mousemove', this.boundMouseMoveHandler);
        }
        if (this.boundClickHandler) {
            document.body.removeEventListener('click', this.boundClickHandler);
        }
        if (this.boundMouseOverHandler) {
            document.body.removeEventListener('mouseover', this.boundMouseOverHandler);
        }
    }

    // Throttle mousemove events to avoid overwhelming the buffer
    throttleMouseMove(event) {
        const now = Date.now();
        if (now - this.lastMoveTime >= this.moveThrottleDelay) {
            this.lastMoveTime = now;
            this.trackEvent('move', event);
        }
    }

    // Handle click events
    handleClick(event) {
        this.trackEvent('click', event);
    }

    // Handle mouseover events
    handleMouseOver(event) {
        this.trackEvent('hover', event);
    }

    // Track an event and add it to the buffer
    trackEvent(actionType, event) {
        if (!this.isTracking) return;

        const telemetryEvent = {
            actionType,
            target: this.getElementIdentifier(event.target),
            timestamp: new Date().toISOString(),
            metadata: {
                x: event.clientX || 0,
                y: event.clientY || 0,
                page: window.location.pathname,
                userAgent: navigator.userAgent
            }
        };



        this.eventBuffer.push(telemetryEvent);

        // Limit buffer size to prevent memory issues
        if (this.eventBuffer.length > 1000) {
            this.eventBuffer = this.eventBuffer.slice(-500); // Keep last 500 events
        }
    }

    // Get a meaningful identifier for an element
    getElementIdentifier(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ').join('.')}`;
        if (element.tagName) return element.tagName.toLowerCase();
        return 'unknown';
    }

    // Start the batch sending interval (every 5 seconds)
    startBatchSending() {
        this.batchInterval = setInterval(() => {
            this.sendBatch();
        }, 5000);
    }

    // Send batch of events to the server
    async sendBatch() {
        if (this.eventBuffer.length === 0) {
            return; // No events to send
        }

        const eventsToSend = [...this.eventBuffer]; // Copy buffer
        this.eventBuffer = []; // Clear buffer

        try {
            const token = this.getAuthToken();
            if (!token) {
                console.log('No auth token, stopping telemetry tracking');
                this.stop();
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ events: eventsToSend })
            });

            if (response.ok) {
                const result = await response.json();

            } else {
                console.error('Failed to send telemetry events:', response.status);
                // Re-add events to buffer for retry (limited)
                this.eventBuffer.unshift(...eventsToSend.slice(0, 100));
            }
        } catch (error) {
            console.error('Error sending telemetry batch:', error);
            // Re-add events to buffer for retry (limited)
            this.eventBuffer.unshift(...eventsToSend.slice(0, 100));
        }
    }
}

// Global tracker instance
let telemetryTracker = null;

// Function to start tracking (call after successful login)
function startTelemetryTracking() {
    if (!telemetryTracker) {
        telemetryTracker = new TelemetryTracker();
    }
    telemetryTracker.init();
}

// Function to stop tracking (call on logout)
function stopTelemetryTracking() {
    if (telemetryTracker) {
        telemetryTracker.stop();
    }
}

// Export functions for use in main app
window.telemetryTracking = {
    start: startTelemetryTracking,
    stop: stopTelemetryTracking
};