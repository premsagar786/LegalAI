const axios = require('axios');

class GeoapifyMapsService {
    constructor() {
        this.apiKey = process.env.GEOAPIFY_API_KEY;
        this.geocodingKey = process.env.GEOAPIFY_GEOCODING_KEY || process.env.GEOAPIFY_API_KEY;
        this.baseUrl = 'https://api.geoapify.com/v2/places';
        this.geocodeUrl = 'https://api.geoapify.com/v1/geocode/search';
    }

    async findLawyersNearby(lat, lng, radius = 5000) {
        if (!this.apiKey || this.apiKey === 'YOUR_GEOAPIFY_API_KEY') {
            console.warn('Geoapify API Key is missing');
            return [];
        }

        try {
            // Geoapify Places API for nearby lawyers
            const response = await axios.get(this.baseUrl, {
                params: {
                    categories: 'commercial.lawyer', // Geoapify category for lawyers
                    filter: `circle:${lng},${lat},${radius}`, // lon,lat,radius format
                    limit: 20,
                    apiKey: this.apiKey
                }
            });

            if (!response.data || !response.data.features) {
                console.error('Geoapify API Error: No results found');
                return [];
            }

            // Transform Geoapify data to match our schema
            const places = response.data.features.map((feature) => {
                const props = feature.properties;
                const coords = feature.geometry?.coordinates || [0, 0];

                return {
                    _id: `geoapify_${props.place_id || props.name?.replace(/\s/g, '_')}`,
                    isGeoapifyResult: true,
                    user: {
                        name: props.name || props.address_line1 || 'Unknown Lawyer',
                        avatar: null // Geoapify doesn't provide icons in the same way
                    },
                    rating: {
                        average: 0, // Geoapify doesn't provide ratings in basic plan
                        count: 0
                    },
                    location: {
                        city: this._extractCity(props),
                        address: this._formatAddress(props),
                        coordinates: {
                            type: 'Point',
                            coordinates: coords // [lon, lat]
                        }
                    },
                    specializations: this._extractSpecializations(props),
                    bio: `Verified listing from Geoapify. ${props.categories?.join(', ') || 'Legal services'}.`,
                    experience: 0,
                    hourlyRate: 0,
                    isVerified: true,
                    phone: props.contact?.phone || null,
                    website: props.website || props.contact?.website || null,
                    distance: props.distance || null
                };
            });

            return places;

        } catch (error) {
            console.error('Error fetching from Geoapify:', error.message);
            if (error.response) {
                console.error('Geoapify API Response Error:', error.response.data);
            }
            return [];
        }
    }

    async getPlaceDetails(placeId) {
        try {
            // Geoapify Place Details API
            const response = await axios.get(`${this.baseUrl}/${placeId}`, {
                params: {
                    apiKey: this.apiKey
                }
            });

            if (response.data && response.data.features && response.data.features[0]) {
                const props = response.data.features[0].properties;
                return {
                    phone: props.contact?.phone || null,
                    website: props.website || props.contact?.website || null,
                    openingHours: props.opening_hours || null,
                    email: props.contact?.email || null
                };
            }
            return null;
        } catch (error) {
            console.warn('Error fetching place details:', error.message);
            return null;
        }
    }

    _formatAddress(props) {
        if (!props) return 'Address not available';

        // Geoapify provides formatted addresses
        if (props.formatted) return props.formatted;
        if (props.address_line1 && props.address_line2) {
            return `${props.address_line1}, ${props.address_line2}`;
        }
        if (props.address_line1) return props.address_line1;

        // Build from components
        const parts = [];
        if (props.housenumber) parts.push(props.housenumber);
        if (props.street) parts.push(props.street);
        if (props.city) parts.push(props.city);
        if (props.state) parts.push(props.state);
        if (props.postcode) parts.push(props.postcode);

        return parts.length > 0 ? parts.join(', ') : 'Address not available';
    }

    _extractCity(props) {
        if (!props) return 'Unknown';
        return props.city ||
            props.town ||
            props.village ||
            props.municipality ||
            'Unknown';
    }

    _extractSpecializations(props) {
        if (!props || !props.categories) return ['General Practice'];

        // Map Geoapify categories to legal specializations
        const categories = props.categories.map(cat => {
            const lowerCat = cat.toLowerCase();
            if (lowerCat.includes('criminal')) return 'Criminal Law';
            if (lowerCat.includes('family')) return 'Family Law';
            if (lowerCat.includes('corporate')) return 'Corporate Law';
            if (lowerCat.includes('real estate') || lowerCat.includes('property')) return 'Real Estate Law';
            if (lowerCat.includes('immigration')) return 'Immigration Law';
            if (lowerCat.includes('tax')) return 'Tax Law';
            return 'General Practice';
        });

        return [...new Set(categories)]; // Remove duplicates
    }

    async geocodeCity(cityName) {
        if (!this.geocodingKey || this.geocodingKey === 'YOUR_GEOAPIFY_API_KEY') {
            console.warn('Geoapify Geocoding API Key is missing');
            return null;
        }

        try {
            console.log(`🌍 Geocoding city: ${cityName}`);
            console.log(`🔑 Using geocoding key: ${this.geocodingKey.substring(0, 10)}...`);

            const response = await axios.get(this.geocodeUrl, {
                params: {
                    text: cityName,
                    type: 'city',
                    apiKey: this.geocodingKey,
                    limit: 1
                }
            });

            console.log(`📡 Geocoding API response status: ${response.status}`);

            if (response.data && response.data.features && response.data.features.length > 0) {
                const location = response.data.features[0];
                const coords = location.geometry.coordinates; // [lon, lat]
                const result = {
                    lat: coords[1],
                    lng: coords[0],
                    city: location.properties.city || location.properties.name,
                    country: location.properties.country,
                    formatted: location.properties.formatted
                };
                console.log(`✅ Geocoded to:`, result);
                return result;
            }

            console.warn(`⚠️ No results found for city: ${cityName}`);
            return null;
        } catch (error) {
            console.error('❌ Error geocoding city:', error.message);
            if (error.response) {
                console.error('Geoapify Geocoding API Error:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            }
            return null;
        }
    }
}

module.exports = new GeoapifyMapsService();
