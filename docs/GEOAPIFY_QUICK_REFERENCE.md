# Geoapify API Quick Reference

## 🔑 API Key (Already Configured!)
```env
GEOAPIFY_API_KEY=8a7895a902fc4fc994f19789893e84d9
```
✅ **Your API key is already set in `server/.env`**

---

## 📍 Search Nearby Lawyers

### Endpoint
```
GET https://api.geoapify.com/v2/places
```

### Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `categories` | string | ✅ Yes | Category filter | `commercial.lawyer` |
| `filter` | string | ✅ Yes | Geographic filter | `circle:lon,lat,radius` |
| `limit` | number | ❌ No | Max results (1-100) | `20` |
| `apiKey` | string | ✅ Yes | Your API key | `8a7895a9...` |

### Example Request
```javascript
const response = await axios.get('https://api.geoapify.com/v2/places', {
  params: {
    categories: 'commercial.lawyer',
    filter: 'circle:-74.0060,40.7128,5000', // lon,lat,radius (meters)
    limit: 20,
    apiKey: '8a7895a902fc4fc994f19789893e84d9'
  }
});
```

### Example Response
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "place_id": "51a7d4e0...",
        "name": "Smith & Associates Law Firm",
        "categories": ["commercial.lawyer"],
        "formatted": "123 Broadway, New York, NY 10006",
        "address_line1": "123 Broadway",
        "address_line2": "New York, NY 10006",
        "city": "New York",
        "state": "New York",
        "postcode": "10006",
        "country": "United States",
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

---

## 🏷️ Categories

| Category | Description |
|----------|-------------|
| `commercial.lawyer` | Law firms, attorneys, legal services |
| `commercial.legal` | Broader legal services category |

**Full list**: https://apidocs.geoapify.com/docs/places/#categories

---

## 💻 Code Usage

### In Your Service
```javascript
// server/src/services/googleMapsService.js
const geoapifyMapsService = require('./services/googleMapsService');

// Find lawyers within 5km
const lawyers = await geoapifyMapsService.findLawyersNearby(
  40.7128,  // latitude
  -74.0060, // longitude
  5000      // radius in meters
);
```

### In Your Controller
```javascript
// server/src/controllers/lawyerController.js
const geoapifyMapsService = require('../services/googleMapsService');

exports.getLawyers = async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  // Get Geoapify results
  const geoapifyResults = await geoapifyMapsService.findLawyersNearby(
    lat, 
    lng, 
    parseFloat(radius) * 1000
  );
  
  // Merge with DB results
  const allLawyers = [...dbLawyers, ...geoapifyResults];
  
  res.json({ success: true, data: allLawyers });
};
```

---

## 📊 Rate Limits

### Free Tier
- **Daily**: 3,000 requests
- **Per Second**: 5 requests
- **Cost**: Free

### Paid Tiers
- **Freelancer**: 100K requests/month - $50/month
- **Startup**: 500K requests/month - $200/month
- **Business**: 2M requests/month - $600/month

**Check pricing**: https://www.geoapify.com/pricing

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Check key in `.env` |
| `403 Forbidden` | API key expired/invalid | Verify at myprojects.geoapify.com |
| `429 Too Many Requests` | Rate limit exceeded | Implement caching |
| `400 Bad Request` | Invalid parameters | Validate lat/lng/radius |
| No results | Wrong category/location | Try `commercial.legal` |

---

## 🔍 Testing

### Test in Browser
```
https://api.geoapify.com/v2/places?categories=commercial.lawyer&filter=circle:-74.0060,40.7128,5000&limit=20&apiKey=8a7895a902fc4fc994f19789893e84d9
```

### Test with cURL
```bash
curl "https://api.geoapify.com/v2/places?categories=commercial.lawyer&filter=circle:-74.0060,40.7128,5000&limit=20&apiKey=8a7895a902fc4fc994f19789893e84d9"
```

### Test in Your App
```bash
# Start server
cd server && npm start

# Make request
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"
```

---

## 📱 Response Fields Reference

### Feature Object (GeoJSON)
```javascript
{
  type: "Feature",
  properties: {
    place_id: string,        // Unique place ID
    name: string,            // Business name
    categories: string[],    // Category list
    formatted: string,       // Full formatted address
    address_line1: string,   // Street address
    address_line2: string,   // City, state, zip
    city: string,            // City name
    state: string,           // State/province
    postcode: string,        // Postal code
    country: string,         // Country name
    country_code: string,    // ISO country code
    lon: number,             // Longitude
    lat: number,             // Latitude
    distance: number,        // Distance in meters
    contact: {
      phone: string,         // Phone number
      website: string,       // Website URL
      email: string          // Email address
    },
    opening_hours: object    // Opening hours (if available)
  },
  geometry: {
    type: "Point",
    coordinates: [lon, lat]  // [longitude, latitude]
  }
}
```

---

## 🛠️ Troubleshooting

### API Key Not Working
```bash
# Check if key is set
echo $GEOAPIFY_API_KEY  # Linux/Mac
echo %GEOAPIFY_API_KEY% # Windows

# Restart server after adding key
npm start
```

### No Results Returned
```javascript
// Check console for errors
console.log('Geoapify Results:', geoapifyResults);

// Verify coordinates are valid
console.log('Searching at:', { lat, lng, radius });

// Try broader category
categories: 'commercial.legal' // instead of 'commercial.lawyer'

// Try larger radius
radius = 50000; // 50km instead of 5km
```

### Rate Limit Issues
```javascript
// Implement simple cache
const cache = new Map();

async findLawyersNearby(lat, lng, radius) {
  const key = `${lat},${lng},${radius}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const results = await /* API call */;
  cache.set(key, results);
  
  return results;
}
```

---

## 📚 Resources

- **Documentation**: https://apidocs.geoapify.com/
- **Dashboard**: https://myprojects.geoapify.com/
- **Pricing**: https://www.geoapify.com/pricing
- **Support**: https://www.geoapify.com/support
- **Categories**: https://apidocs.geoapify.com/docs/places/#categories

---

## ⚡ Quick Start Checklist

- [✅] API key configured in `server/.env`
- [✅] Service file updated to use Geoapify
- [✅] Controller updated to use Geoapify
- [ ] Start server: `npm start`
- [ ] Test endpoint: `curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"`
- [ ] Verify results in response
- [ ] Monitor usage at https://myprojects.geoapify.com/

---

## 🎯 Key Differences from Other APIs

| Feature | Google Places | TomTom | Geoapify |
|---------|--------------|--------|----------|
| **Free Tier** | Limited | 2,500/day | **3,000/day** ✅ |
| **Response Format** | JSON | JSON | **GeoJSON** ✅ |
| **Filter Format** | location param | lat/lon params | **circle filter** |
| **Distance** | Not included | Not included | **Included** ✅ |
| **Pricing** | Complex | Moderate | **Simple** ✅ |
| **Documentation** | Good | Good | **Excellent** ✅ |

---

**Your Geoapify integration is ready!** 🚀

API key is configured. Just run `npm start` and test!

For detailed info, see **[GEOAPIFY_API_GUIDE.md](GEOAPIFY_API_GUIDE.md)**.
