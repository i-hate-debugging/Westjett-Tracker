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
const planeIcon = L.divIcon({
    className: 'plane-icon',
    iconSize: [24, 24],
    popupAnchor: [0, -12]
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

// Function to update flight markers on the map
function updateFlights(flights) {
    allFlights = flights;
    const existingIcao24 = new Set();
    
    flights.forEach(flight => {
        const icao24 = flight[0];
        const callsign = flight[1]?.trim() || 'N/A';
        const [longitude, latitude, altitude] = flight.slice(5, 8);
        const heading = flight[10] || 0;
        
        if (!latitude || !longitude) return;
        
        existingIcao24.add(icao24);
        
        // Create or update marker
        if (!planeMarkers[icao24]) {
            planeMarkers[icao24] = L.marker([latitude, longitude], {
                icon: planeIcon,
                rotationAngle: heading,
                rotationOrigin: 'center',
                icao24: icao24
            }).addTo(map);
            
            // Add popup with flight info
            planeMarkers[icao24].bindPopup(`
                <h3>${callsign}</h3>
                <p><strong>ICAO24:</strong> ${icao24}</p>
                <p><strong>Altitude:</strong> ${Math.round(altitude * 3.28084)} ft</p>
                <p><strong>Speed:</strong> ${Math.round(flight[9] * 1.94384)} kt</p>
                <p><strong>Heading:</strong> ${Math.round(heading)}°</p>
            `);
            
            // Add click event to show flight details
            planeMarkers[icao24].on('click', () => showFlightDetails(flight));
        } else {
            // Update existing marker position and rotation
            planeMarkers[icao24].setLatLng([latitude, longitude]);
            planeMarkers[icao24].setRotationAngle(heading);
        }
    });
    
    // Remove markers for flights that are no longer active
    Object.keys(planeMarkers).forEach(icao24 => {
        if (!existingIcao24.has(icao24)) {
            map.removeLayer(planeMarkers[icao24]);
            delete planeMarkers[icao24];
        }
    });
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

// Fetch flight data every 5 seconds
fetchFlights();
setInterval(fetchFlights, 5000);