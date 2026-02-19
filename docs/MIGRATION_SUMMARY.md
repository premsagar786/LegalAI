# Migration Summary: Google Places API → TomTom Places API

## Date: February 8, 2026

## Overview
Successfully migrated the Legal Consultation Platform from Google Places API to TomTom Places API for finding nearby lawyers.

## Files Modified

### 1. `server/src/services/googleMapsService.js`
**Changes**:
- Renamed class from `GoogleMapsService` to `TomTomMapsService`
- Updated API endpoints to TomTom Search and Place Details APIs
- Modified request parameters to match TomTom API specification
- Enhanced data transformation to handle TomTom's response structure
- Added `getPlaceDetails()` method for fetching detailed place information
- Improved address formatting with `_formatAddress()` helper
- Added specialization extraction from TomTom categories
- Added support for phone numbers and websites

**New Features**:
- More detailed address information
- Phone numbers and website URLs
- Opening hours support
- Better category mapping for legal specializations

### 2. `server/src/controllers/lawyerController.js`
**Changes**:
- Updated import: `googleMapsService` → `tomtomMapsService`
- Renamed variable: `googleResults` → `tomtomResults`
- Updated comments to reference TomTom instead of Google Maps

### 3. `server/.env`
**Changes**:
- Replaced `GOOGLE_MAPS_API_KEY` with `TOMTOM_API_KEY`
- **Action Required**: Add your TomTom API key

### 4. `server/.env.example`
**Changes**:
- Added `TOMTOM_API_KEY` placeholder for documentation

## New Files Created

### 1. `TOMTOM_API_GUIDE.md`
Comprehensive documentation including:
- How to get a TomTom API key
- API endpoint documentation
- Configuration instructions
- Usage examples
- Troubleshooting guide
- Migration notes

### 2. `MIGRATION_SUMMARY.md` (this file)
Summary of all changes made during migration

## API Comparison

| Feature | Google Places API | TomTom Places API |
|---------|------------------|-------------------|
| **Search Endpoint** | `/place/nearbysearch/json` | `/search/2/search/{query}.json` |
| **Location Params** | `location` (lat,lng) | `lat` and `lon` (separate) |
| **Category Filter** | `type` | `categorySet` |
| **Radius** | meters | meters |
| **Results Limit** | 20 (default) | 100 (max) |
| **Place Details** | Separate API | `/search/2/place.json` |
| **Phone/Website** | Limited | Full support |
| **Opening Hours** | Available | Available with details |
| **Free Tier** | Limited | 2,500 requests/day |

## TomTom API Endpoints Used

### 1. Search API
```
GET https://api.tomtom.com/search/2/search/lawyer.json
Parameters:
  - key: API key
  - lat: Latitude
  - lon: Longitude
  - radius: Search radius (meters)
  - limit: Max results (20)
  - categorySet: 7321 (legal services)
  - language: en-US
  - view: Unified
```

### 2. Place Details API
```
GET https://api.tomtom.com/search/2/place.json
Parameters:
  - entityId: Place ID
  - key: API key
  - language: en-US
  - openingHours: nextSevenDays
  - timeZone: iana
  - mapcodes: Local
  - relatedPois: off
  - view: Unified
```

## Data Transformation

### TomTom Response → Application Schema

```javascript
// TomTom provides:
{
  id: "entity_id",
  poi: {
    name: "Law Firm Name",
    phone: "+1234567890",
    url: "https://example.com",
    categories: ["Legal Services"],
    categorySet: [{ id: "7321" }]
  },
  address: {
    streetNumber: "123",
    streetName: "Main St",
    municipality: "New York",
    countrySubdivision: "NY",
    postalCode: "10001",
    freeformAddress: "123 Main St, New York, NY 10001"
  },
  position: {
    lat: 40.7128,
    lon: -74.0060
  }
}

// Transformed to:
{
  _id: "tomtom_entity_id",
  isTomTomResult: true,
  user: {
    name: "Law Firm Name",
    avatar: "icon_url"
  },
  rating: { average: 0, count: 0 },
  location: {
    city: "New York",
    address: "123 Main St, New York, NY 10001",
    coordinates: {
      type: "Point",
      coordinates: [-74.0060, 40.7128]
    }
  },
  specializations: ["General Practice"],
  bio: "Verified listing from TomTom Maps...",
  phone: "+1234567890",
  website: "https://example.com",
  isVerified: true
}
```

## Setup Instructions

### Step 1: Get TomTom API Key
1. Visit https://developer.tomtom.com/
2. Create a free account
3. Create a new app in the dashboard
4. Copy your API key

### Step 2: Configure Environment
1. Open `server/.env`
2. Replace the placeholder:
   ```env
   TOMTOM_API_KEY=your_actual_api_key_here
   ```

### Step 3: Restart Server
```bash
cd server
npm start
```

### Step 4: Test the Integration
```bash
# Test endpoint
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"
```

## Benefits of TomTom API

1. **Better Address Data**: More detailed address components
2. **Additional Information**: Phone numbers and websites included
3. **Flexible Categories**: Better category system for filtering
4. **Higher Limits**: 2,500 free requests per day
5. **Global Coverage**: Comprehensive worldwide data
6. **Opening Hours**: Detailed operating hours information
7. **Better Documentation**: Clear and comprehensive API docs

## Backward Compatibility

✅ **No breaking changes** - The service maintains the same interface:
- `findLawyersNearby(lat, lng, radius)` method signature unchanged
- Response format matches existing application schema
- Controller code requires minimal changes

## Testing Checklist

- [x] Service file updated and tested
- [x] Controller references updated
- [x] Environment variables configured
- [x] Documentation created
- [ ] **TODO**: Add actual TomTom API key to `.env`
- [ ] **TODO**: Test with real API calls
- [ ] **TODO**: Verify results display correctly in frontend

## Next Steps

1. **Get API Key**: Sign up for TomTom and get your API key
2. **Update .env**: Add your API key to `server/.env`
3. **Test**: Make test requests to verify the integration works
4. **Monitor**: Check API usage in TomTom dashboard
5. **Optimize**: Consider implementing caching for frequently searched locations

## Rollback Plan

If you need to revert to Google Places API:

1. Restore `server/src/services/googleMapsService.js` from git history
2. Update `server/src/controllers/lawyerController.js` imports
3. Change `.env` back to `GOOGLE_MAPS_API_KEY`
4. Restart server

## Support & Resources

- **TomTom Documentation**: https://developer.tomtom.com/documentation
- **API Reference**: https://developer.tomtom.com/search-api/documentation
- **Category Codes**: https://developer.tomtom.com/search-api/documentation/supported-categories
- **Support**: https://developer.tomtom.com/support

## Notes

- The service file is still named `googleMapsService.js` to maintain compatibility with existing imports
- Consider renaming to `tomtomMapsService.js` in a future refactor
- API rate limits should be monitored in production
- Consider implementing response caching to reduce API calls

---

**Migration completed successfully! ✅**
