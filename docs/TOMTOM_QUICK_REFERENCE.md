# TomTom API Quick Reference Card

## 🔑 API Key Setup
```env
# Add to server/.env
TOMTOM_API_KEY=your_api_key_here
```

**Get your key**: https://developer.tomtom.com/

---

## 📍 Search Nearby Lawyers

### Endpoint
```
GET https://api.tomtom.com/search/2/search/lawyer.json
```

### Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `key` | string | ✅ Yes | Your API key | `abc123...` |
| `lat` | number | ✅ Yes | Latitude | `40.7128` |
| `lon` | number | ✅ Yes | Longitude | `-74.0060` |
| `radius` | number | ❌ No | Search radius (meters) | `5000` |
| `limit` | number | ❌ No | Max results (1-100) | `20` |
| `categorySet` | string | ❌ No | Category filter | `7321` (legal) |
| `language` | string | ❌ No | Response language | `en-US` |
| `view` | string | ❌ No | Geopolitical view | `Unified` |

### Example Request
```javascript
const response = await axios.get(
  'https://api.tomtom.com/search/2/search/lawyer.json',
  {
    params: {
      key: process.env.TOMTOM_API_KEY,
      lat: 40.7128,
      lon: -74.0060,
      radius: 5000,
      limit: 20,
      categorySet: '7321',
      language: 'en-US',
      view: 'Unified'
    }
  }
);
```

### Example Response
```json
{
  "summary": {
    "query": "lawyer",
    "queryType": "NON_NEAR",
    "numResults": 10
  },
  "results": [
    {
      "id": "entity_id_123",
      "type": "POI",
      "poi": {
        "name": "Smith & Associates Law Firm",
        "phone": "+1-212-555-0100",
        "url": "https://smithlaw.com",
        "categories": ["Legal Services"],
        "categorySet": [
          { "id": "7321" }
        ]
      },
      "address": {
        "streetNumber": "123",
        "streetName": "Broadway",
        "municipality": "New York",
        "countrySubdivision": "NY",
        "postalCode": "10006",
        "freeformAddress": "123 Broadway, New York, NY 10006"
      },
      "position": {
        "lat": 40.7128,
        "lon": -74.0060
      },
      "dist": 245.67
    }
  ]
}
```

---

## 📋 Get Place Details

### Endpoint
```
GET https://api.tomtom.com/search/2/place.json
```

### Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `entityId` | string | ✅ Yes | Place ID from search | `entity_id_123` |
| `key` | string | ✅ Yes | Your API key | `abc123...` |
| `language` | string | ❌ No | Response language | `en-US` |
| `openingHours` | string | ❌ No | Include hours | `nextSevenDays` |
| `timeZone` | string | ❌ No | Include timezone | `iana` |
| `mapcodes` | string | ❌ No | Include mapcodes | `Local` |
| `relatedPois` | string | ❌ No | Include related | `off` |
| `view` | string | ❌ No | Geopolitical view | `Unified` |

### Example Request
```javascript
const details = await axios.get(
  'https://api.tomtom.com/search/2/place.json',
  {
    params: {
      entityId: 'entity_id_123',
      key: process.env.TOMTOM_API_KEY,
      language: 'en-US',
      openingHours: 'nextSevenDays',
      timeZone: 'iana'
    }
  }
);
```

### Example Response
```json
{
  "result": {
    "id": "entity_id_123",
    "poi": {
      "name": "Smith & Associates Law Firm",
      "phone": "+1-212-555-0100",
      "url": "https://smithlaw.com"
    },
    "rating": {
      "value": 4.5,
      "totalRatings": 127
    },
    "openingHours": {
      "mode": "nextSevenDays",
      "timeRanges": [
        {
          "startTime": {
            "date": "2026-02-08",
            "hour": 9,
            "minute": 0
          },
          "endTime": {
            "date": "2026-02-08",
            "hour": 17,
            "minute": 0
          }
        }
      ]
    }
  }
}
```

---

## 🏷️ Category Codes

| Category | Code | Description |
|----------|------|-------------|
| Legal Services | `7321` | Law firms, attorneys, legal aid |
| Government | `7367` | Government legal offices |
| Court House | `9211` | Courts and judicial buildings |

**Full list**: https://developer.tomtom.com/search-api/documentation/supported-categories

---

## 💻 Code Usage

### In Your Service
```javascript
// server/src/services/googleMapsService.js
const tomtomMapsService = require('./services/googleMapsService');

// Find lawyers within 5km
const lawyers = await tomtomMapsService.findLawyersNearby(
  40.7128,  // latitude
  -74.0060, // longitude
  5000      // radius in meters
);

// Get detailed info
const details = await tomtomMapsService.getPlaceDetails('entity_id');
```

### In Your Controller
```javascript
// server/src/controllers/lawyerController.js
const tomtomMapsService = require('../services/googleMapsService');

exports.getLawyers = async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  // Get TomTom results
  const tomtomResults = await tomtomMapsService.findLawyersNearby(
    lat, 
    lng, 
    parseFloat(radius) * 1000
  );
  
  // Merge with DB results
  const allLawyers = [...dbLawyers, ...tomtomResults];
  
  res.json({ success: true, data: allLawyers });
};
```

---

## 📊 Rate Limits

### Free Tier
- **Daily**: 2,500 requests
- **Per Second**: 5 requests
- **Cost**: Free

### Paid Tiers
- **Pay as you go**: $0.50 per 1,000 requests
- **Volume discounts**: Available
- **Enterprise**: Custom pricing

**Check pricing**: https://developer.tomtom.com/store/maps-api

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `403 Forbidden` | Invalid API key | Check key in `.env` |
| `429 Too Many Requests` | Rate limit exceeded | Implement caching |
| `400 Bad Request` | Invalid parameters | Validate lat/lng/radius |
| `404 Not Found` | Invalid endpoint | Check URL format |
| No results | Wrong category/location | Verify coordinates & category |

---

## 🔍 Testing

### Test in Browser
```
https://api.tomtom.com/search/2/search/lawyer.json?key=YOUR_KEY&lat=40.7128&lon=-74.0060&radius=5000
```

### Test with cURL
```bash
curl "https://api.tomtom.com/search/2/search/lawyer.json?key=YOUR_KEY&lat=40.7128&lon=-74.0060&radius=5000"
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

### Search Result Object
```javascript
{
  id: string,              // Unique place ID
  type: string,            // "POI"
  score: number,           // Relevance score
  dist: number,            // Distance in meters
  poi: {
    name: string,          // Business name
    phone: string,         // Phone number
    url: string,           // Website URL
    categories: string[],  // Category names
    categorySet: [{        // Category codes
      id: string
    }]
  },
  address: {
    streetNumber: string,
    streetName: string,
    municipality: string,  // City
    countrySubdivision: string, // State
    postalCode: string,
    country: string,
    freeformAddress: string
  },
  position: {
    lat: number,
    lon: number
  }
}
```

### Place Details Object
```javascript
{
  result: {
    id: string,
    poi: { /* same as search */ },
    address: { /* same as search */ },
    position: { /* same as search */ },
    rating: {
      value: number,       // 0-5 rating
      totalRatings: number // Review count
    },
    openingHours: {
      mode: string,
      timeRanges: [{
        startTime: { date, hour, minute },
        endTime: { date, hour, minute }
      }]
    },
    timeZone: {
      ianaId: string       // e.g., "America/New_York"
    }
  }
}
```

---

## 🛠️ Troubleshooting

### API Key Not Working
```bash
# Check if key is set
echo $TOMTOM_API_KEY  # Linux/Mac
echo %TOMTOM_API_KEY% # Windows

# Restart server after adding key
npm start
```

### No Results Returned
```javascript
// Check console for errors
console.log('TomTom Results:', tomtomResults);

// Verify coordinates are valid
console.log('Searching at:', { lat, lng, radius });

// Try broader search
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

- **Documentation**: https://developer.tomtom.com/search-api/documentation
- **Dashboard**: https://developer.tomtom.com/user/me/apps
- **Support**: https://developer.tomtom.com/support
- **Status**: https://status.tomtom.com/

---

## ✅ Quick Checklist

- [ ] Sign up at developer.tomtom.com
- [ ] Create an app and get API key
- [ ] Add `TOMTOM_API_KEY` to `server/.env`
- [ ] Restart server
- [ ] Test with: `curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"`
- [ ] Check server logs for errors
- [ ] Verify results in response
- [ ] Monitor usage in TomTom dashboard

---

**Need help?** Check `TOMTOM_API_GUIDE.md` for detailed documentation.
