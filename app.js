// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store plane markers and flight data
const planeMarkers = {};
let allFlights = [];

// Custom plane icon
const planeIcon = L.icon({
    iconUrl: 'airplaneicon.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    className: 'plane-icon'
});

// Function to fetch flight data from OpenSky Network
async function fetchFlights() {
    try {
        const response = await fetch('https://opensky-network.org/api/states/all');
        const data = await response.json();
        
        if (data && data.states) {
            updateFlights(data.states);
        }
    } catch (error) {
        console.error('Error fetching flight data:', error);
        document.getElementById('flightInfo').innerHTML = '<p>Error loading flight data. Please try again later.</p>';
    }
}

// Function to check if a coordinate is within the current map bounds
function isInViewport(lat, lng) {
    if (!map) return false;
    const bounds = map.getBounds();
    return bounds.contains([lat, lng]);
}

// Function to update flight markers on the map
function updateFlights(flights) {
    allFlights = flights;
    const existingIcao24 = new Set();
    const currentBounds = map.getBounds();
    
    // First pass: Update existing markers and track which ones are still active
    flights.forEach(flight => {
        const icao24 = flight[0];
        const [longitude, latitude, altitude] = flight.slice(5, 8);
        if (!latitude || !longitude) return;
        
        existingIcao24.add(icao24);
        
        // Only process flights in current viewport or that were previously visible
        const inViewport = isInViewport(latitude, longitude);
        
        if (planeMarkers[icao24]) {
            if (inViewport) {
                // Update existing marker
                planeMarkers[icao24].setLatLng([latitude, longitude]);
                planeMarkers[icao24].setRotationAngle(flight[10] || 0);
                if (!map.hasLayer(planeMarkers[icao24])) {
                    planeMarkers[icao24].addTo(map);
                }
            } else if (map.hasLayer(planeMarkers[icao24])) {
                // Remove from map if out of viewport
                map.removeLayer(planeMarkers[icao24]);
            }
        } else if (inViewport) {
            // Only create new markers for flights in viewport
            createFlightMarker(flight);
        }
    });
    
    // Remove markers for flights that are no longer active
    Object.keys(planeMarkers).forEach(icao24 => {
        if (!existingIcao24.has(icao24)) {
            if (map.hasLayer(planeMarkers[icao24])) {
                map.removeLayer(planeMarkers[icao24]);
            }
            delete planeMarkers[icao24];
        }
    });
}

// Function to create a new flight marker
function createFlightMarker(flight) {
    const [icao24, callsign, origin_country, time_position, last_contact, 
           longitude, latitude, altitude, on_ground, velocity, heading] = flight;
    
    if (!latitude || !longitude) return null;
    
    const marker = L.marker([latitude, longitude], {
        icon: planeIcon,
        rotationAngle: heading || 0,
        rotationOrigin: 'center',
        icao24: icao24
    }).addTo(map);
    
    marker.bindPopup(`
        <h3>${callsign?.trim() || 'N/A'}</h3>
        <p><strong>ICAO24:</strong> ${icao24}</p>
        <p><strong>Altitude:</strong> ${Math.round(altitude * 3.28084)} ft</p>
        <p><strong>Speed:</strong> ${Math.round(velocity * 1.94384)} kt</p>
        <p><strong>Heading:</strong> ${Math.round(heading || 0)}°</p>
    `);
    
    marker.on('click', () => showFlightDetails(flight));
    planeMarkers[icao24] = marker;
    return marker;
}

// Function to show flight details in the sidebar
function showFlightDetails(flight) {
    const [
        icao24, callsign, origin_country,
        time_position, last_contact, longitude, latitude, 
        altitude, on_ground, velocity, heading, 
        vertical_rate, sensors
    ] = flight;
    
    const details = document.getElementById('flightDetails');
    details.innerHTML = `
        <div class="flight-detail">
            <h3>${callsign || 'N/A'}</h3>
            <p><strong>ICAO24:</strong> ${icao24}</p>
            <p><strong>Country:</strong> ${origin_country || 'N/A'}</p>
            <p><strong>Altitude:</strong> ${Math.round(altitude * 3.28084)} ft</p>
            <p><strong>Speed:</strong> ${Math.round(velocity * 1.94384)} kt</p>
            <p><strong>Heading:</strong> ${Math.round(heading)}°</p>
            <p><strong>Vertical Rate:</strong> ${Math.round(vertical_rate * 196.85)} ft/min</p>
            <p><strong>On Ground:</strong> ${on_ground ? 'Yes' : 'No'}</p>
        </div>
    `;
}

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.trim().toUpperCase();
    if (!searchTerm) return;
    
    // Find flight by callsign or icao24
    const flight = allFlights.find(f => 
        (f[1] && f[1].trim().toUpperCase() === searchTerm) || 
        f[0].toUpperCase() === searchTerm
    );
    
    if (flight) {
        const [lat, lon] = flight.slice(6, 8);
        map.setView([lat, lon], 8);
        
        // Open popup for the found flight
        if (planeMarkers[flight[0]]) {
            planeMarkers[flight[0]].openPopup();
            showFlightDetails(flight);
        }
    } else {
        alert('Flight not found. Try a different callsign or ICAO24 code.');
    }
});

// Allow search on Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Update flights on map move/zoom
let updateTimeout;
function scheduleUpdate() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateVisibleFlights, 300);
}

function updateVisibleFlights() {
    if (!allFlights.length) return;
    
    const bounds = map.getBounds();
    allFlights.forEach(flight => {
        const icao24 = flight[0];
        const [longitude, latitude] = flight.slice(5, 7);
        
        if (!latitude || !longitude) return;
        
        const inViewport = bounds.contains([latitude, longitude]);
        const marker = planeMarkers[icao24];
        
        if (inViewport) {
            if (marker) {
                if (!map.hasLayer(marker)) {
                    marker.addTo(map);
                }
            } else {
                createFlightMarker(flight);
            }
        } else if (marker && map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
}

// Initial fetch
fetchFlights();

// Update flights every 5 seconds
setInterval(fetchFlights, 5000);

// Update visible flights when map is moved/zoomed
map.on('moveend', scheduleUpdate);
map.on('zoomend', scheduleUpdate);