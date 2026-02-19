# TomTom API Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│                     (React Frontend - Port 5173)                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP Request
                                │ GET /api/lawyers?lat=X&lng=Y&radius=Z
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server (Port 5000)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           lawyerController.getLawyers()                   │  │
│  │                                                           │  │
│  │  1. Parse query parameters (lat, lng, radius)            │  │
│  │  2. Build MongoDB query for local lawyers                │  │
│  │  3. Call TomTom service for external results             │  │
│  │  4. Merge and return combined results                    │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                         │
│                        ▼                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         tomtomMapsService (googleMapsService.js)          │  │
│  │                                                           │  │
│  │  Methods:                                                 │  │
│  │  • findLawyersNearby(lat, lng, radius)                   │  │
│  │  • getPlaceDetails(entityId)                             │  │
│  │  • _formatAddress(address)                               │  │
│  │  • _extractCity(address)                                 │  │
│  │  • _extractSpecializations(poi)                          │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐
│   TomTom Search API  │      │ TomTom Place Details │
│                      │      │        API           │
│ /search/2/search/    │      │ /search/2/place.json │
│   lawyer.json        │      │                      │
│                      │      │ Parameters:          │
│ Parameters:          │      │ • entityId           │
│ • key (API key)      │      │ • key                │
│ • lat, lon           │      │ • language           │
│ • radius             │      │ • openingHours       │
│ • limit: 20          │      │ • timeZone           │
│ • categorySet: 7321  │      │ • mapcodes           │
│ • language: en-US    │      │ • relatedPois        │
│ • view: Unified      │      │ • view               │
└──────────────────────┘      └──────────────────────┘
         │                                │
         │ JSON Response                  │ JSON Response
         │                                │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   Data Transformation Layer    │
         │                                │
         │  TomTom Format → App Schema    │
         │                                │
         │  • Map poi.name → user.name    │
         │  • Extract address components  │
         │  • Format coordinates          │
         │  • Map categories → specs      │
         │  • Add phone & website         │
         └────────────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │    Merged Results Array        │
         │                                │
         │  [DB Lawyers] + [TomTom POIs]  │
         └────────────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │    JSON Response to Client     │
         │                                │
         │  {                             │
         │    success: true,              │
         │    count: X,                   │
         │    data: [...lawyers]          │
         │  }                             │
         └────────────────────────────────┘
```

## Request Flow

### 1. Client Request
```javascript
// Frontend makes API call
fetch('/api/lawyers?lat=40.7128&lng=-74.0060&radius=5')
```

### 2. Controller Processing
```javascript
// lawyerController.js
exports.getLawyers = async (req, res) => {
  // Extract parameters
  const { lat, lng, radius } = req.query;
  
  // Query local database
  const dbLawyers = await Lawyer.find(query);
  
  // Query TomTom API
  const tomtomResults = await tomtomMapsService.findLawyersNearby(
    lat, lng, radius * 1000
  );
  
  // Merge results
  const allLawyers = [...dbLawyers, ...tomtomResults];
  
  // Return response
  res.json({ success: true, data: allLawyers });
}
```

### 3. TomTom Service Call
```javascript
// googleMapsService.js (TomTomMapsService)
async findLawyersNearby(lat, lng, radius) {
  // Call TomTom Search API
  const response = await axios.get(
    `${this.baseUrl}/lawyer.json`,
    { params: { key, lat, lon, radius, ... } }
  );
  
  // For each result, optionally get details
  const places = await Promise.all(
    response.data.results.map(async (place) => {
      const details = await this.getPlaceDetails(place.id);
      return transformedData;
    })
  );
  
  return places;
}
```

### 4. Data Transformation
```javascript
// Transform TomTom data to app schema
{
  _id: `tomtom_${place.id}`,
  isTomTomResult: true,
  user: {
    name: place.poi?.name,
    avatar: iconUrl
  },
  location: {
    city: this._extractCity(place.address),
    address: this._formatAddress(place.address),
    coordinates: {
      type: 'Point',
      coordinates: [place.position.lon, place.position.lat]
    }
  },
  // ... more fields
}
```

## Environment Configuration

```
┌─────────────────────────────────────┐
│         .env File                   │
│                                     │
│  PORT=5000                          │
│  MONGODB_URI=mongodb://...          │
│  JWT_SECRET=...                     │
│  JWT_EXPIRE=7d                      │
│  AI_SERVICE_URL=http://...          │
│  NODE_ENV=development               │
│  TOMTOM_API_KEY=your_key_here  ◄─── Required!
└─────────────────────────────────────┘
```

## API Rate Limits

```
TomTom Free Tier
├── Daily Limit: 2,500 requests
├── Rate Limit: 5 requests/second
└── Overage: Requests blocked

Optimization Strategies
├── Cache frequent searches
├── Implement request debouncing
├── Use larger radius to reduce calls
└── Monitor usage in dashboard
```

## Error Handling Flow

```
Client Request
     │
     ▼
Controller
     │
     ├─► MongoDB Query ──► Success ──┐
     │                                │
     └─► TomTom Service               │
            │                         │
            ├─► API Key Missing ──────┼─► Return DB results only
            │                         │
            ├─► Network Error ────────┼─► Return DB results only
            │                         │
            ├─► Rate Limit ───────────┼─► Return DB results only
            │                         │
            └─► Success ──────────────┘
                                      │
                                      ▼
                              Merge Results
                                      │
                                      ▼
                              Return to Client
```

## Security Considerations

```
✓ API Key stored in .env (not in code)
✓ .env file in .gitignore
✓ Server-side API calls only (key not exposed to client)
✓ Input validation on lat/lng/radius
✓ Error messages don't expose sensitive info
✓ Rate limiting to prevent abuse
```

## Deployment Checklist

```
□ Set TOMTOM_API_KEY in production environment
□ Configure CORS for production domain
□ Set up monitoring for API usage
□ Implement caching layer (Redis/Memcached)
□ Set up error alerting
□ Configure rate limiting
□ Test with production API key
□ Monitor API quota usage
```

## File Structure

```
PRANTI 2026/
├── server/
│   ├── .env                          ◄─── TomTom API key here
│   ├── .env.example                  ◄─── Template with TOMTOM_API_KEY
│   └── src/
│       ├── controllers/
│       │   └── lawyerController.js   ◄─── Uses tomtomMapsService
│       └── services/
│           └── googleMapsService.js  ◄─── TomTomMapsService class
├── TOMTOM_API_GUIDE.md              ◄─── Setup & usage guide
└── MIGRATION_SUMMARY.md             ◄─── Migration documentation
```

## Testing Commands

```bash
# 1. Start the server
cd server
npm start

# 2. Test the API endpoint
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"

# 3. Check server logs for TomTom API calls
# Look for:
# - "TomTom API Key is missing" (if key not set)
# - "Error fetching from TomTom Maps" (if API error)
# - Successful responses with lawyer data

# 4. Test with different locations
curl "http://localhost:5000/api/lawyers?lat=51.5074&lng=-0.1278&radius=10"
```

## Monitoring & Debugging

```javascript
// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('TomTom API Request:', {
    url: requestUrl,
    params: requestParams
  });
  
  console.log('TomTom API Response:', {
    resultCount: response.data.results.length,
    results: response.data.results
  });
}
```

---

**For more information, see:**
- `TOMTOM_API_GUIDE.md` - Detailed API documentation
- `MIGRATION_SUMMARY.md` - Migration details and comparison
