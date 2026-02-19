# Geoapify API Integration Guide

## Overview
This project uses **Geoapify Places API** for finding nearby lawyers. Geoapify provides comprehensive location-based services with detailed place information.

## ✅ Your API Key is Already Configured!
Your Geoapify API key (`8a7895a902fc4fc994f19789893e84d9`) is already set in the `.env` file and ready to use.

## API Documentation
- **Geoapify Places API**: https://apidocs.geoapify.com/docs/places/
- **Categories**: https://apidocs.geoapify.com/docs/places/#categories
- **Dashboard**: https://myprojects.geoapify.com/

## API Endpoints Used

### 1. Places API
**Endpoint**: `https://api.geoapify.com/v2/places`

**Parameters**:
- `categories`: Category filter (e.g., `commercial.lawyer`)
- `filter`: Geographic filter (e.g., `circle:lon,lat,radius`)
- `limit`: Maximum number of results (default: 20)
- `apiKey`: Your API key

**Example Request**:
```javascript
const response = await axios.get('https://api.geoapify.com/v2/places', {
    params: {
        categories: 'commercial.lawyer',
        filter: 'circle:-74.0060,40.7128,5000', // lon,lat,radius in meters
        limit: 20,
        apiKey: '8a7895a902fc4fc994f19789893e84d9'
    }
});
```

**Example Response**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "place_id": "51a7d4e0b2d2c34940597e0c0b6c5c2e4940f00103f9011c8e6c0100000000c00208",
        "name": "Smith & Associates Law Firm",
        "categories": ["commercial.lawyer"],
        "address_line1": "123 Broadway",
        "address_line2": "New York, NY 10006",
        "formatted": "123 Broadway, New York, NY 10006, United States",
        "city": "New York",
        "state": "New York",
        "postcode": "10006",
        "country": "United States",
        "country_code": "us",
        "lon": -74.0060,
        "lat": 40.7128,
        "distance": 245,
        "contact": {
          "phone": "+1-212-555-0100",
          "website": "https://smithlaw.com"
        }
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128]
      }
    }
  ]
}
```

## Features

### Current Implementation
The Geoapify integration provides:

1. **Nearby Lawyer Search**: Find lawyers within a specified radius
2. **Detailed Place Information**: 
   - Name and formatted address
   - Phone numbers
   - Websites
   - Geographic coordinates
   - Distance from search point

3. **Category Filtering**: Uses Geoapify's category system (`commercial.lawyer`)

4. **Smart Data Transformation**: Automatically maps Geoapify data to your application's schema

### Response Data Structure
The service transforms Geoapify responses into the following structure:

```javascript
{
  _id: 'geoapify_[place_id]',
  isGeoapifyResult: true,
  user: {
    name: 'Lawyer/Firm Name',
    avatar: null
  },
  rating: {
    average: 0,
    count: 0
  },
  location: {
    city: 'City Name',
    address: 'Full Address',
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  },
  specializations: ['General Practice'],
  bio: 'Description from Geoapify',
  experience: 0,
  hourlyRate: 0,
  isVerified: true,
  phone: '+1234567890',
  website: 'https://example.com',
  distance: 245 // meters from search point
}
```

## Usage in Code

### Finding Nearby Lawyers
```javascript
const geoapifyMapsService = require('./services/googleMapsService');

// Search for lawyers within 5km radius
const lawyers = await geoapifyMapsService.findLawyersNearby(
  40.7128,  // latitude
  -74.0060, // longitude
  5000      // radius in meters
);
```

### Getting Place Details
```javascript
const details = await geoapifyMapsService.getPlaceDetails('place_id_here');
```

## API Limits

### Free Tier
- **3,000 requests per day**
- **5 requests per second**
- Perfect for development and small-scale production

### Paid Tiers
- **Freelancer**: 100,000 requests/month - $50/month
- **Startup**: 500,000 requests/month - $200/month
- **Business**: 2,000,000 requests/month - $600/month
- Visit [Geoapify Pricing](https://www.geoapify.com/pricing) for more information

## Categories

Geoapify uses a hierarchical category system. For lawyers:

- `commercial.lawyer` - Law firms and legal services
- `commercial.legal` - Legal services (broader category)

**Full category list**: https://apidocs.geoapify.com/docs/places/#categories

## Error Handling

The service includes comprehensive error handling:
- Missing API key warnings
- Network error catching
- Graceful fallbacks (returns empty array on error)
- Detailed error logging

## Testing

To test the integration:

1. Your API key is already configured in `.env`
2. Start the server: `npm start`
3. Make a request to find lawyers:
   ```bash
   curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"
   ```

## Troubleshooting

### Common Issues

1. **"Geoapify API Key is missing"**
   - Check that `GEOAPIFY_API_KEY` is set in your `.env` file
   - Restart the server after adding the key

2. **No results returned**
   - Verify the coordinates are valid
   - Check the radius (in meters)
   - Ensure lawyers exist in that location
   - Try the category `commercial.legal` for broader results

3. **Rate limit errors**
   - Monitor your API usage in the Geoapify dashboard
   - Consider implementing caching for frequently requested locations

4. **403 Forbidden**
   - Your API key may be invalid or expired
   - Check your key at https://myprojects.geoapify.com/

## Advantages of Geoapify

1. **Generous Free Tier**: 3,000 requests/day
2. **Simple API**: Clean, RESTful design
3. **Rich Data**: Detailed address components
4. **GeoJSON Format**: Standard geographic data format
5. **Distance Information**: Includes distance from search point
6. **Global Coverage**: Worldwide location data
7. **Fast Response**: Optimized for performance
8. **Great Documentation**: Clear and comprehensive

## Migration Notes

### Changes from TomTom API

1. **API Endpoint**: Changed from TomTom to Geoapify Places API
2. **Parameter Format**: 
   - Filter format: `circle:lon,lat,radius` (note: lon comes first!)
   - Category: `commercial.lawyer` instead of category code
3. **Response Format**: GeoJSON FeatureCollection
4. **Data Structure**: Different property names requiring new transformation

### Backward Compatibility
The service maintains the same interface as previous implementations, so no changes are needed in the controller layer.

## Monitoring Your Usage

1. Visit [Geoapify Dashboard](https://myprojects.geoapify.com/)
2. Log in with your account
3. View your API usage statistics
4. Monitor remaining quota
5. Set up alerts if needed

## Additional Resources

- [Geoapify Documentation](https://apidocs.geoapify.com/)
- [Places API Guide](https://apidocs.geoapify.com/docs/places/)
- [Category Reference](https://apidocs.geoapify.com/docs/places/#categories)
- [Dashboard](https://myprojects.geoapify.com/)
- [Support](https://www.geoapify.com/support)

## Support

For issues related to:
- **Geoapify API**: Contact Geoapify support or check their documentation
- **Integration**: Check the service implementation in `server/src/services/googleMapsService.js`

---

**Your integration is ready to use!** 🚀

The API key is already configured, so you can start the server and begin testing immediately.
