# 🗺️ TomTom API Integration - Complete Setup

This project has been successfully migrated from **Google Places API** to **TomTom Places API** for finding nearby lawyers.

## 📋 What Changed?

The application now uses TomTom's Search and Place Details APIs instead of Google Places API to find and display information about nearby lawyers.

## 🚀 Quick Start

### 1. Get Your TomTom API Key

1. Visit [TomTom Developer Portal](https://developer.tomtom.com/)
2. Sign up for a free account (or log in)
3. Create a new app in your dashboard
4. Copy your API key

### 2. Configure Your Environment

Open `server/.env` and update the TomTom API key:

```env
TOMTOM_API_KEY=your_actual_api_key_here
```

### 3. Verify Configuration

Run the configuration checker to ensure everything is set up correctly:

```bash
cd server
node check-tomtom-config.js
```

This will verify:
- ✅ API key is set
- ✅ Service files are updated
- ✅ API connection works
- ✅ Controller is configured

### 4. Start the Server

```bash
npm start
```

### 5. Test the API

```bash
# Test finding lawyers in New York
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"
```

## 📚 Documentation

We've created comprehensive documentation for you:

| File | Description |
|------|-------------|
| **[TOMTOM_QUICK_REFERENCE.md](TOMTOM_QUICK_REFERENCE.md)** | Quick reference card with all essential API info |
| **[TOMTOM_API_GUIDE.md](TOMTOM_API_GUIDE.md)** | Detailed setup guide and API documentation |
| **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** | Complete migration details and comparison |
| **[TOMTOM_ARCHITECTURE.md](TOMTOM_ARCHITECTURE.md)** | System architecture and flow diagrams |

## 🔧 What Was Modified?

### Backend Changes

1. **`server/src/services/googleMapsService.js`**
   - Renamed class to `TomTomMapsService`
   - Updated to use TomTom Search API
   - Added Place Details API integration
   - Enhanced data transformation

2. **`server/src/controllers/lawyerController.js`**
   - Updated to use `tomtomMapsService`
   - Changed variable names from `googleResults` to `tomtomResults`

3. **`server/.env`**
   - Replaced `GOOGLE_MAPS_API_KEY` with `TOMTOM_API_KEY`

4. **`server/.env.example`**
   - Added `TOMTOM_API_KEY` placeholder

### New Files

- `server/check-tomtom-config.js` - Configuration verification script
- `TOMTOM_API_GUIDE.md` - Comprehensive API guide
- `TOMTOM_QUICK_REFERENCE.md` - Quick reference card
- `MIGRATION_SUMMARY.md` - Migration documentation
- `TOMTOM_ARCHITECTURE.md` - Architecture diagrams
- `README_TOMTOM.md` - This file

## 🌟 Features

The TomTom integration provides:

- ✅ **Nearby Search** - Find lawyers within a specified radius
- ✅ **Detailed Information** - Name, address, phone, website
- ✅ **Ratings & Reviews** - User ratings and review counts
- ✅ **Opening Hours** - Business hours information
- ✅ **Category Filtering** - Legal services category (7321)
- ✅ **Global Coverage** - Worldwide location data
- ✅ **Better Addresses** - Detailed address components

## 📊 API Limits

### Free Tier
- **2,500 requests per day**
- **5 requests per second**
- Perfect for development and small-scale production

### Paid Tiers
- Pay-as-you-go: $0.50 per 1,000 requests
- Volume discounts available
- [View pricing](https://developer.tomtom.com/store/maps-api)

## 🔍 How It Works

```
User Request
    ↓
Controller (lawyerController.js)
    ↓
TomTom Service (googleMapsService.js)
    ↓
TomTom API
    ↓
Data Transformation
    ↓
Merged Results (DB + TomTom)
    ↓
Response to User
```

## 🧪 Testing

### Automated Configuration Check
```bash
cd server
node check-tomtom-config.js
```

### Manual API Test
```bash
# Start server
npm start

# Test endpoint
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5"
```

### Test Different Locations
```bash
# London, UK
curl "http://localhost:5000/api/lawyers?lat=51.5074&lng=-0.1278&radius=10"

# Los Angeles, USA
curl "http://localhost:5000/api/lawyers?lat=34.0522&lng=-118.2437&radius=10"
```

## ⚠️ Troubleshooting

### "TomTom API Key is missing"
- Check that `TOMTOM_API_KEY` is set in `server/.env`
- Restart the server after adding the key

### "403 Forbidden"
- Your API key is invalid
- Verify the key at [TomTom Dashboard](https://developer.tomtom.com/user/me/apps)

### "429 Too Many Requests"
- You've exceeded your daily quota
- Check usage in your TomTom dashboard
- Consider implementing caching

### No Results Returned
- Verify coordinates are correct
- Try a larger radius
- Check that lawyers exist in that location

## 📱 API Endpoints

### Search Nearby Lawyers
```
GET /api/lawyers?lat={latitude}&lng={longitude}&radius={km}
```

**Parameters:**
- `lat` - Latitude (required if using location search)
- `lng` - Longitude (required if using location search)
- `radius` - Search radius in kilometers (default: 50)
- `specialization` - Filter by specialization
- `city` - Filter by city
- `minRating` - Minimum rating
- `page` - Page number
- `limit` - Results per page

**Example:**
```bash
curl "http://localhost:5000/api/lawyers?lat=40.7128&lng=-74.0060&radius=5&specialization=Criminal%20Law&minRating=4"
```

## 🔐 Security

- ✅ API key stored in `.env` (not in code)
- ✅ `.env` file in `.gitignore`
- ✅ Server-side API calls only (key not exposed to client)
- ✅ Input validation on parameters
- ✅ Error messages don't expose sensitive information

## 📈 Monitoring

Monitor your API usage:
1. Visit [TomTom Dashboard](https://developer.tomtom.com/user/me/apps)
2. Select your app
3. View usage statistics
4. Set up alerts for quota limits

## 🚢 Deployment

Before deploying to production:

1. ✅ Set `TOMTOM_API_KEY` in production environment
2. ✅ Configure CORS for production domain
3. ✅ Set up monitoring for API usage
4. ✅ Implement caching layer (Redis/Memcached)
5. ✅ Configure rate limiting
6. ✅ Test with production API key
7. ✅ Set up error alerting

## 🆘 Support

### TomTom Support
- **Documentation**: https://developer.tomtom.com/documentation
- **Support Portal**: https://developer.tomtom.com/support
- **Status Page**: https://status.tomtom.com/

### Project Documentation
- See the documentation files listed above
- Check server logs for detailed error messages
- Run `check-tomtom-config.js` for configuration issues

## 📝 Next Steps

1. **Get API Key** ✅
2. **Update .env** ✅
3. **Run Config Checker** ✅
4. **Test API** ✅
5. **Deploy to Production** ⏳
6. **Monitor Usage** ⏳

## 🎯 Benefits Over Google Places

- ✅ More generous free tier (2,500 vs 0 requests)
- ✅ Better address data structure
- ✅ Included phone numbers and websites
- ✅ Detailed opening hours
- ✅ Better category system
- ✅ Clearer pricing structure
- ✅ Excellent documentation

## 📞 Contact

For questions about:
- **TomTom API**: Contact TomTom support
- **Integration**: Check the documentation files
- **Bugs**: Check server logs and run config checker

---

**Ready to go!** 🚀

Start by running `node check-tomtom-config.js` to verify your setup, then `npm start` to launch the server.

For detailed information, see **[TOMTOM_QUICK_REFERENCE.md](TOMTOM_QUICK_REFERENCE.md)**.
