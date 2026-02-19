import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Star,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle,
    ChevronDown,
    User,
    Crosshair
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Lawyers.css';

const Lawyers = () => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        specialization: '',
        city: '',
        minRating: '',
        maxRate: '',
        lat: null,
        lng: null,
        radius: 50
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const specializations = [
        'Corporate Law',
        'Criminal Law',
        'Family Law',
        'Real Estate',
        'Intellectual Property',
        'Tax Law',
        'Employment Law',
        'Immigration Law',
        'Civil Litigation',
        'Contract Law'
    ];

    useEffect(() => {
        fetchLawyers();
    }, [filters]);

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.specialization) params.append('specialization', filters.specialization);
            if (filters.city) params.append('city', filters.city);
            if (filters.minRating) params.append('minRating', filters.minRating);
            if (filters.maxRate) params.append('maxRate', filters.maxRate);
            if (filters.lat && filters.lng) {
                params.append('lat', filters.lat);
                params.append('lng', filters.lng);
                params.append('radius', filters.radius);
                console.log('🔍 Searching with location:', { lat: filters.lat, lng: filters.lng, radius: filters.radius });
            }

            console.log('📡 Fetching lawyers:', `/lawyers?${params}`);
            const response = await api.get(`/lawyers?${params}`);
            console.log('✅ API Response:', response.data);

            const lawyersData = response.data.data || [];
            const geoapifyResults = lawyersData.filter(l => l.isGeoapifyResult);
            const dbResults = lawyersData.filter(l => !l.isGeoapifyResult);

            console.log(`📊 Found ${lawyersData.length} lawyers total`);
            console.log(`   - ${dbResults.length} from database`);
            console.log(`   - ${geoapifyResults.length} from Geoapify`);

            setLawyers(lawyersData);

            // Show appropriate feedback
            if (lawyersData.length === 0) {
                if (filters.city) {
                    toast.error(`No lawyers found in ${filters.city}. Try a different city or increase the radius.`);
                } else if (filters.lat) {
                    toast.error('No lawyers found nearby. Try increasing the radius.');
                }
            } else if (filters.city && geoapifyResults.length > 0) {
                toast.success(`Found ${geoapifyResults.length} lawyers in ${filters.city} from Geoapify`);
            }
        } catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
            toast.error(`Failed to fetch lawyers: ${error.message}`);
            setLawyers(getMockLawyers());
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSearch = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFilters(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    city: '' // Clear city when using precise location
                }));
                setLocationLoading(false);
                toast.success('Location found! Searching for nearby lawyers...');
            },
            (error) => {
                console.error(error);
                toast.error('Unable to retrieve your location');
                setLocationLoading(false);
            }
        );
    };

    const clearLocation = () => {
        setFilters(prev => ({
            ...prev,
            lat: null,
            lng: null
        }));
    };

    const getMockLawyers = () => [
        {
            _id: '1',
            user: { name: 'Adv. Priya Sharma', avatar: null },
            specializations: ['Corporate Law', 'Contract Law'],
            experience: 12,
            hourlyRate: 3000,
            location: { city: 'New Delhi', state: 'Delhi' },
            rating: { average: 4.8, count: 156 },
            bio: 'Senior corporate lawyer with expertise in mergers, acquisitions, and commercial contracts.',
            isVerified: true
        },
        {
            _id: '2',
            user: { name: 'Adv. Rajesh Kumar', avatar: null },
            specializations: ['Criminal Law', 'Civil Litigation'],
            experience: 15,
            hourlyRate: 2500,
            location: { city: 'Mumbai', state: 'Maharashtra' },
            rating: { average: 4.6, count: 89 },
            bio: 'Experienced criminal defense attorney handling complex cases across India.',
            isVerified: true
        },
        {
            _id: '3',
            user: { name: 'Adv. Ananya Gupta', avatar: null },
            specializations: ['Family Law', 'Real Estate'],
            experience: 8,
            hourlyRate: 2000,
            location: { city: 'Bangalore', state: 'Karnataka' },
            rating: { average: 4.9, count: 203 },
            bio: 'Compassionate family lawyer specializing in divorce, custody, and property disputes.',
            isVerified: true
        },
        {
            _id: '4',
            user: { name: 'Adv. Vikram Singh', avatar: null },
            specializations: ['Intellectual Property', 'Tax Law'],
            experience: 10,
            hourlyRate: 3500,
            location: { city: 'New Delhi', state: 'Delhi' },
            rating: { average: 4.7, count: 124 },
            bio: 'IP specialist with experience in patents, trademarks, and copyright litigation.',
            isVerified: true
        },
        {
            _id: '5',
            user: { name: 'Adv. Meera Patel', avatar: null },
            specializations: ['Employment Law', 'Corporate Law'],
            experience: 7,
            hourlyRate: 1800,
            location: { city: 'Ahmedabad', state: 'Gujarat' },
            rating: { average: 4.5, count: 67 },
            bio: 'Employment law expert helping businesses and employees resolve workplace disputes.',
            isVerified: true
        },
        {
            _id: '6',
            user: { name: 'Adv. Arjun Reddy', avatar: null },
            specializations: ['Immigration Law'],
            experience: 9,
            hourlyRate: 2200,
            location: { city: 'Hyderabad', state: 'Telangana' },
            rating: { average: 4.8, count: 145 },
            bio: 'Immigration attorney assisting with visas, green cards, and citizenship applications.',
            isVerified: true
        }
    ];

    const filteredLawyers = lawyers.filter(lawyer => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            lawyer.user?.name?.toLowerCase().includes(searchLower) ||
            lawyer.specializations?.some(s => s.toLowerCase().includes(searchLower)) ||
            lawyer.location?.city?.toLowerCase().includes(searchLower)
        );
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="lawyers-page">
            <div className="lawyers-header">
                <div className="container">
                    <h1>Find Verified Lawyers</h1>
                    <p>Connect with experienced legal professionals for your consultation needs</p>

                    {/* Search Bar */}
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, specialization, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            className={`location-btn ${filters.lat ? 'active' : ''}`}
                            onClick={filters.lat ? clearLocation : handleLocationSearch}
                            title={filters.lat ? "Clear location" : "Use my location"}
                        >
                            {locationLoading ? (
                                <div className="spinner-sm" />
                            ) : (
                                <Crosshair size={20} />
                            )}
                        </button>
                        <button
                            className="filter-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={20} />
                            Filters
                            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
                        </button>
                    </div>

                    {filters.lat && (
                        <div className="active-filters">
                            <span className="filter-badge">
                                <MapPin size={12} />
                                Nearby (within {filters.radius}km)
                                <button onClick={clearLocation}>×</button>
                            </span>
                        </div>
                    )}

                    {/* Filters */}
                    {showFilters && (
                        <motion.div
                            className="filters-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filter-group">
                                <label>Specialization</label>
                                <select
                                    value={filters.specialization}
                                    onChange={(e) => handleFilterChange('specialization', e.target.value)}
                                >
                                    <option value="">All Specializations</option>
                                    {specializations.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    placeholder="e.g., New York, London, Mumbai..."
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    disabled={!!filters.lat}
                                />
                                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                    {filters.lat ? 'Clear location to search by city' : 'Enter a city name to find nearby lawyers'}
                                </small>
                            </div>

                            <div className="filter-group">
                                <label>Min Rating</label>
                                <select
                                    value={filters.minRating}
                                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                >
                                    <option value="">Any Rating</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="4.5">4.5+ Stars</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Max Rate (₹/hr)</label>
                                <input
                                    type="number"
                                    placeholder="Max hourly rate..."
                                    value={filters.maxRate}
                                    onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                                />
                            </div>

                            {filters.lat && (
                                <div className="filter-group">
                                    <label>Search Radius (km)</label>
                                    <input
                                        type="number"
                                        value={filters.radius}
                                        onChange={(e) => handleFilterChange('radius', e.target.value)}
                                        min="1"
                                        max="500"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="lawyers-content">
                <div className="container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner" />
                            <p>Loading lawyers...</p>
                        </div>
                    ) : filteredLawyers.length === 0 ? (
                        <div className="empty-state">
                            <User size={48} />
                            <h3>No lawyers found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-info">
                                <span>Showing {filteredLawyers.length} verified lawyers</span>
                            </div>

                            <div className="lawyers-grid">
                                {filteredLawyers.map((lawyer, index) => (
                                    <motion.div
                                        key={lawyer._id}
                                        className="lawyer-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="lawyer-header">
                                            <div className="lawyer-avatar">
                                                {lawyer.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="lawyer-info">
                                                <h3>{lawyer.user?.name}</h3>
                                                <div className="lawyer-meta">
                                                    <span className="rating">
                                                        <Star size={14} fill="currentColor" />
                                                        {lawyer.rating?.average?.toFixed(1)}
                                                        <small>({lawyer.rating?.count})</small>
                                                    </span>
                                                    {lawyer.isVerified && (
                                                        <span className="verified">
                                                            <CheckCircle size={14} />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="lawyer-bio">{lawyer.bio}</p>

                                        <div className="lawyer-tags">
                                            {lawyer.specializations?.slice(0, 3).map((spec, i) => (
                                                <span key={i} className="spec-tag">{spec}</span>
                                            ))}
                                        </div>

                                        <div className="lawyer-details">
                                            <div className="detail-item">
                                                <Briefcase size={16} />
                                                <span>{lawyer.experience} years</span>
                                            </div>
                                            <div className="detail-item">
                                                <MapPin size={16} />
                                                <span>{lawyer.location?.city}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>₹{lawyer.hourlyRate}/hr</span>
                                            </div>
                                        </div>

                                        <div className="lawyer-actions">
                                            <Link to={`/lawyers/${lawyer._id}`} className="btn btn-secondary btn-sm">
                                                View Profile
                                            </Link>
                                            <Link to={`/book/${lawyer._id}`} className="btn btn-primary btn-sm">
                                                Book Consultation
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lawyers;
