# WestJet Flight Tracker

A mobile-responsive web application for tracking WestJet airline flights with real-time status updates, beautiful UI, and intuitive user experience.

## Features

- ✈️ **Flight Search**: Search by flight number or route (origin/destination)
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🔄 **Real-time Updates**: Refresh flight status with one click
- 📚 **Recent Searches**: Keep track of your last 5 flight searches
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 💾 **Local Storage**: Saves recent searches locally
- 🔑 **API Ready**: Configured for real flight tracking APIs

## Screenshots

The application features a clean, modern interface with:
- Gradient header with WestJet branding
- Intuitive search form
- Visual flight path representation
- Status indicators with color coding
- Responsive design for mobile devices

## Setup Instructions

### 1. Clone or Download
Download the project files to your local machine.

### 2. Configure API Key
1. Open `config.js`
2. Replace `'YOUR_API_KEY_HERE'` with your actual API key
3. Update the endpoints if using a different API service

### 3. Choose Your Flight API
The application is designed to work with various flight tracking APIs:

#### Aviation Stack (Recommended for beginners)
- Sign up at [aviationstack.com](https://aviationstack.com/)
- Get your free API key
- Update endpoints in `config.js`

#### FlightAware
- Sign up at [flightaware.com](https://flightaware.com/)
- Get your API key
- Update endpoints in `config.js`

#### FlightStats
- Sign up at [flightstats.com](https://www.flightstats.com/)
- Get your API key
- Update endpoints in `config.js`

### 4. Run the Application
1. Open `index.html` in your web browser
2. Or serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## File Structure

```
Westjett-Tracker/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── config.js           # API configuration (add your key here)
├── .gitignore          # Git ignore file for sensitive data
└── README.md           # This file
```

## Usage

### Search by Flight Number
1. Enter the flight number (e.g., WS123)
2. Click "Search" or press Enter
3. View real-time flight status

### Search by Route
1. Enter origin airport code (e.g., YYC for Calgary)
2. Enter destination airport code (e.g., YYZ for Toronto)
3. Click "Search" or press Enter

### Refresh Flight Data
- Use the "Refresh" button to get updated flight information
- Recent searches are automatically saved and can be clicked to reload

## API Integration

To integrate with real flight APIs, modify the `searchByFlightNumber` and `searchByRoute` methods in `script.js`:

```javascript
async searchByFlightNumber(flightNumber) {
    try {
        const response = await fetch(`${config.endpoints.flightStatus}?flight_number=${flightNumber}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return this.parseFlightData(data);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

## Customization

### Colors and Branding
- Update CSS variables in `styles.css` for custom colors
- Modify the header gradient and logo colors
- Adjust the color scheme to match your preferences

### Additional Features
- Add more flight details (baggage info, aircraft type)
- Implement push notifications for flight updates
- Add weather information for departure/arrival cities
- Include airport terminal and gate maps

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized for mobile devices
- Efficient DOM manipulation
- Local storage for offline capability
- Responsive images and icons
- Minimal external dependencies

## Security Notes

- Never commit your API key to version control
- The `.gitignore` file is configured to exclude sensitive files
- Consider using environment variables for production deployments
- Implement rate limiting to prevent API abuse

## Troubleshooting

### Search Not Working
- Check that your API key is correctly set in `config.js`
- Verify your API service is active and accessible
- Check browser console for error messages

### Mobile Display Issues
- Ensure viewport meta tag is present
- Test on different device sizes
- Check CSS media queries

### API Rate Limiting
- Adjust refresh intervals in `config.js`
- Implement exponential backoff for failed requests
- Monitor API usage limits

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is open source and available under the MIT License.

## Support

For support or questions:
- Check the troubleshooting section above
- Review the API documentation for your chosen service
- Ensure all files are properly loaded in your browser

---

**Note**: This application currently uses mock data for demonstration. To track real flights, you'll need to integrate with an actual flight tracking API service. 