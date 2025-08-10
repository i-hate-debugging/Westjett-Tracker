// Flight Tracker Application
class FlightTracker {
    constructor() {
        this.apiKey = null;
        this.recentFlights = JSON.parse(localStorage.getItem('recentFlights') || '[]');
        this.currentFlight = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadRecentFlights();
        this.checkApiKey();
    }

    initializeElements() {
        // Search elements
        this.flightNumberInput = document.getElementById('flightNumber');
        this.originInput = document.getElementById('origin');
        this.destinationInput = document.getElementById('destination');
        this.searchBtn = document.getElementById('searchBtn');
        this.refreshBtn = document.getElementById('refreshBtn');

        // Display elements
        this.flightStatus = document.getElementById('flightStatus');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusDot = document.querySelector('.status-dot');
        this.statusText = document.querySelector('.status-text');
        this.displayFlightNumber = document.getElementById('displayFlightNumber');
        this.originCode = document.getElementById('originCode');
        this.originName = document.getElementById('originName');
        this.originTime = document.getElementById('originTime');
        this.destinationCode = document.getElementById('destinationCode');
        this.destinationName = document.getElementById('destinationName');
        this.destinationTime = document.getElementById('destinationTime');
        this.flightStatusText = document.getElementById('flightStatusText');
        this.departureStatus = document.getElementById('departureStatus');
        this.arrivalStatus = document.getElementById('arrivalStatus');
        this.gateInfo = document.getElementById('gateInfo');

        // Other elements
        this.recentFlightsContainer = document.getElementById('recentFlights');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchFlight());
        this.refreshBtn.addEventListener('click', () => this.refreshCurrentFlight());
        
        // Enter key support for search
        [this.flightNumberInput, this.originInput, this.destinationInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchFlight();
            });
        });

        // Auto-format flight number input
        this.flightNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase();
            if (value && !value.startsWith('WS')) {
                value = 'WS' + value;
            }
            e.target.value = value;
        });

        // Auto-format airport codes
        [this.originInput, this.destinationInput].forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        });
    }

    checkApiKey() {
        // Check if API key is available
        if (!this.apiKey) {
            this.showError('Please add your API key to the config.js file');
            this.disableSearch();
        }
    }

    disableSearch() {
        this.searchBtn.disabled = true;
        this.searchBtn.style.opacity = '0.5';
        this.searchBtn.style.cursor = 'not-allowed';
    }

    enableSearch() {
        this.searchBtn.disabled = false;
        this.searchBtn.style.opacity = '1';
        this.searchBtn.style.cursor = 'pointer';
    }

    async searchFlight() {
        const flightNumber = this.flightNumberInput.value.trim();
        const origin = this.originInput.value.trim();
        const destination = this.destinationInput.value.trim();

        if (!flightNumber && !origin && !destination) {
            this.showError('Please enter at least one search criteria');
            return;
        }

        this.showLoading();
        this.hideError();

        try {
            let flightData;
            
            if (flightNumber) {
                flightData = await this.searchByFlightNumber(flightNumber);
            } else if (origin && destination) {
                flightData = await this.searchByRoute(origin, destination);
            } else {
                this.showError('Please enter either a flight number or both origin and destination');
                this.hideLoading();
                return;
            }

            if (flightData) {
                this.displayFlightData(flightData);
                this.addToRecentFlights(flightData);
                this.currentFlight = flightData;
            } else {
                this.showError('No flights found matching your criteria');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('An error occurred while searching for flights. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async searchByFlightNumber(flightNumber) {
        // Simulate API call - replace with actual flight API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock data for demonstration
                const mockFlight = this.generateMockFlight(flightNumber);
                resolve(mockFlight);
            }, 1500);
        });
    }

    async searchByRoute(origin, destination) {
        // Simulate API call - replace with actual flight API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock data for demonstration
                const mockFlight = this.generateMockFlight('WS' + Math.floor(Math.random() * 1000), origin, destination);
                resolve(mockFlight);
            }, 1500);
        });
    }

    generateMockFlight(flightNumber, origin = 'YYC', destination = 'YYZ') {
        const now = new Date();
        const departureTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const arrivalTime = new Date(departureTime.getTime() + (2 + Math.random() * 3) * 60 * 60 * 1000);
        
        const statuses = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Arrived'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const airports = {
            'YYC': 'Calgary International Airport',
            'YYZ': 'Toronto Pearson International Airport',
            'YVR': 'Vancouver International Airport',
            'YEG': 'Edmonton International Airport',
            'YOW': 'Ottawa Macdonald-Cartier International Airport'
        };

        return {
            flightNumber: flightNumber,
            origin: {
                code: origin,
                name: airports[origin] || 'Unknown Airport',
                time: departureTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                })
            },
            destination: {
                code: destination,
                name: airports[destination] || 'Unknown Airport',
                time: arrivalTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                })
            },
            status: status,
            departureTime: departureTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            arrivalTime: arrivalTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }),
            gate: 'Gate ' + (Math.floor(Math.random() * 50) + 1),
            airline: 'WestJet'
        };
    }

    displayFlightData(flightData) {
        // Update flight display
        this.displayFlightNumber.textContent = flightData.flightNumber;
        this.originCode.textContent = flightData.origin.code;
        this.originName.textContent = flightData.origin.name;
        this.originTime.textContent = flightData.origin.time;
        this.destinationCode.textContent = flightData.destination.code;
        this.destinationName.textContent = flightData.destination.name;
        this.destinationTime.textContent = flightData.destination.time;
        this.flightStatusText.textContent = flightData.status;
        this.departureStatus.textContent = flightData.departureTime;
        this.arrivalStatus.textContent = flightData.arrivalTime;
        this.gateInfo.textContent = flightData.gate;

        // Update status indicator
        this.updateStatusIndicator(flightData.status);

        // Show flight status section
        this.flightStatus.style.display = 'block';
        
        // Scroll to flight status
        this.flightStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updateStatusIndicator(status) {
        // Remove existing status classes
        this.statusDot.className = 'status-dot';
        this.statusText.textContent = status;

        // Add appropriate status class
        if (status.includes('On Time') || status.includes('Arrived')) {
            this.statusDot.classList.add('on-time');
        } else if (status.includes('Delayed')) {
            this.statusDot.classList.add('delayed');
        } else if (status.includes('Cancelled')) {
            this.statusDot.classList.add('cancelled');
        } else if (status.includes('Boarding')) {
            this.statusDot.classList.add('boarding');
        }
    }

    addToRecentFlights(flightData) {
        // Remove if already exists
        this.recentFlights = this.recentFlights.filter(flight => 
            flight.flightNumber !== flightData.flightNumber
        );

        // Add to beginning
        this.recentFlights.unshift(flightData);

        // Keep only last 5 flights
        if (this.recentFlights.length > 5) {
            this.recentFlights = this.recentFlights.slice(0, 5);
        }

        // Save to localStorage
        localStorage.setItem('recentFlights', JSON.stringify(this.recentFlights));

        // Update display
        this.loadRecentFlights();
    }

    loadRecentFlights() {
        if (this.recentFlights.length === 0) {
            this.recentFlightsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; font-style: italic;">No recent searches yet</p>';
            return;
        }

        this.recentFlightsContainer.innerHTML = this.recentFlights.map(flight => `
            <div class="recent-flight-item" onclick="flightTracker.loadFlightFromRecent('${flight.flightNumber}')">
                <div class="recent-flight-info">
                    <h4>${flight.flightNumber}</h4>
                    <p>${flight.origin.code} → ${flight.destination.code}</p>
                </div>
                <div class="recent-flight-status ${this.getStatusClass(flight.status)}">
                    ${flight.status}
                </div>
            </div>
        `).join('');
    }

    getStatusClass(status) {
        if (status.includes('On Time') || status.includes('Arrived')) return 'on-time';
        if (status.includes('Delayed')) return 'delayed';
        if (status.includes('Cancelled')) return 'cancelled';
        return 'on-time';
    }

    loadFlightFromRecent(flightNumber) {
        const flight = this.recentFlights.find(f => f.flightNumber === flightNumber);
        if (flight) {
            this.displayFlightData(flight);
            this.currentFlight = flight;
        }
    }

    async refreshCurrentFlight() {
        if (!this.currentFlight) {
            this.showError('No flight to refresh. Please search for a flight first.');
            return;
        }

        this.showLoading();
        this.hideError();

        try {
            // Simulate refresh - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate updated mock data
            const updatedFlight = this.generateMockFlight(
                this.currentFlight.flightNumber,
                this.currentFlight.origin.code,
                this.currentFlight.destination.code
            );
            
            this.displayFlightData(updatedFlight);
            this.currentFlight = updatedFlight;
            
            // Update in recent flights
            this.addToRecentFlights(updatedFlight);
            
        } catch (error) {
            console.error('Refresh error:', error);
            this.showError('Failed to refresh flight data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        this.loadingSpinner.style.display = 'flex';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    // Method to set API key (called from config)
    setApiKey(key) {
        this.apiKey = key;
        this.enableSearch();
    }
}

// Initialize the application
let flightTracker;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    flightTracker = new FlightTracker();
    
    // Try to load API key from config
    if (typeof config !== 'undefined' && config.apiKey) {
        flightTracker.setApiKey(config.apiKey);
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', () => {}, { passive: true });

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 