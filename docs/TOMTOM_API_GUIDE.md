# TomTom API Integration Guide

## Overview
This project has been migrated from Google Places API to TomTom Places API for finding nearby lawyers. The TomTom API provides comprehensive location-based services with detailed place information.

## API Documentation
- **TomTom Search API**: https://developer.tomtom.com/search-api/documentation/search-service/search
- **TomTom Place Details API**: https://developer.tomtom.com/search-api/documentation/place-by-id-service/place-by-id

## Getting Your TomTom API Key

1. Visit [TomTom Developer Portal](https://developer.tomtom.com/)
2. Sign up for a free account or log in
3. Navigate to "My Dashboard"
4. Click on "Add a new app" or select an existing app
5. Copy your API key from the app details

## Configuration

### Environment Variables
Add your TomTom API key to the `.env` file in the `server` directory:

```env
TOMTOM_API_KEY=your_tomtom_api_key_here
```

### API Endpoints Used

#### 1. Search API
**Endpoint**: `https://api.tomtom.com/search/2/search/{query}.json`

**Parameters**:
- `key`: Your API key
- `lat`: Latitude for center of search
- `lon`: Longitude for center of search
- `radius`: Search radius in meters
- `limit`: Maximum number of results (max 100)
- `categorySet`: Category filter (7321 for legal services)
- `language`: Response language (e.g., 'en-US')
- `view`: Geopolitical view (e.g., 'Unified')

#### 2. Place Details API
**Endpoint**: `https://api.tomtom.com/search/2/place.json`

**Parameters**:
- `entityId`: Unique identifier for the place
- `key`: Your API key
- `language`: Response language
- `openingHours`: Include opening hours (e.g., 'nextSevenDays')
- `timeZone`: Include timezone information
- `mapcodes`: Include mapcodes
- `relatedPois`: Include related POIs
- `view`: Geopolitical view

## Features

### Current Implementation
The TomTom integration provides:

1. **Nearby Lawyer Search**: Find lawyers within a specified radius
2. **Detailed Place Information**: 
   - Name and address
   - Phone numbers
   - Websites
   - Ratings and reviews
   - Opening hours
   - Geographic coordinates

3. **Category Filtering**: Uses TomTom's category system (7321 for legal services)

4. **Smart Data Transformation**: Automatically maps TomTom data to your application's schema

### Response Data Structure
The service transforms TomTom responses into the following structure:

```javascript
{
  _id: 'tomtom_[place_id]',
  isTomTomResult: true,
  user: {
    name: 'Lawyer/Firm Name',
    avatar: 'icon_url'
  },
  rating: {
    average: 4.5,
    count: 120
  },
  location: {
    city: 'City Name',
    address: 'Full Address',
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  },
  specializations: ['Criminal Law', 'Family Law'],
  bio: 'Description from TomTom',
  experience: 0,
  hourlyRate: 0,
  isVerified: true,
  phone: '+1234567890',
  website: 'https://example.com'
}
```

## Usage in Code

### Finding Nearby Lawyers
```javascript
const tomtomMapsService = require('./services/googleMapsService');

// Search for lawyers within 5km radius
const lawyers = await tomtomMapsService.findLawyersNearby(
  40.7128,  // latitude
  -74.0060, // longitude
  5000      // radius in meters
);
```

### Getting Place Details
```javascript
const details = await tomtomMapsService.getPlaceDetails('entity_id_here');
```

## API Limits

### Free Tier
- 2,500 requests per day
- Rate limit: 5 requests per second

### Paid Tiers
Visit [TomTom Pricing](https://developer.tomtom.com/store/maps-api) for more information.

## Error Handling

The service includes comprehensive error handling:
- Missing API key warnings
- Network error catching
- Graceful fallbacks (returns empty array on error)
- Detailed error logging

## Migration Notes

### Changes from Google Places API

1. **API Endpoint**: Changed from Google Places to TomTom Search/Place APIs
2. **Parameter Names**: 
   - `location` → `lat` and `lon` (separate parameters)
   - `type` → `categorySet`
3. **Response Structure**: Different JSON structure requiring new data transformation
4. **Additional Features**: TomTom provides more detailed address components

### Backward Compatibility
The service maintains the same interface as the previous Google Maps service, so no changes are needed in the controller layer.

## Testing

To test the integration:

1. Ensure your TomTom API key is set in `.env`
2. Start the server: `npm start`
3. Make a request to find lawyers:
   ```
   GET /api/lawyers?lat=40.7128&lng=-74.0060&radius=5
   ```

## Troubleshooting

### Common Issues

1. **"TomTom API Key is missing"**
   - Check that `TOMTOM_API_KEY` is set in your `.env` file
   - Restart the server after adding the key

2. **No results returned**
   - Verify the coordinates are valid
   - Check the radius (in meters)
   - Ensure the category set (7321) is appropriate for your region

3. **Rate limit errors**
   - Monitor your API usage in the TomTom dashboard
   - Consider implementing caching for frequently requested locations

## Additional Resources

- [TomTom Developer Documentation](https://developer.tomtom.com/documentation)
- [TomTom Search API Guide](https://developer.tomtom.com/search-api/documentation/product-information/introduction)
- [TomTom Category Codes](https://developer.tomtom.com/search-api/documentation/supported-categories)

## Support

For issues related to:
- **TomTom API**: Contact TomTom support or check their documentation
- **Integration**: Check the service implementation in `server/src/services/googleMapsService.js`
