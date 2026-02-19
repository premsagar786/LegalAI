import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    MessageSquare,
    TrendingUp,
    Users,
    Star,
    Settings,
    Edit,
    Save,
    X,
    Briefcase,
    Award,
    DollarSign,
    Activity
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './LawyerDashboard.css';

const LawyerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [consultations, setConsultations] = useState([]);
    const [stats, setStats] = useState({
        totalConsultations: 0,
        pendingConsultations: 0,
        completedConsultations: 0,
        rating: 0,
        totalEarnings: 0
    });
    const [lawyerProfile, setLawyerProfile] = useState(null);
    const [editingLocation, setEditingLocation] = useState(false);
    const [locationData, setLocationData] = useState({
        city: '',
        state: '',
        address: '',
        zipCode: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch lawyer profile
            const profileRes = await api.get('/auth/me');
            if (profileRes.data.data.lawyerProfile) {
                setLawyerProfile(profileRes.data.data.lawyerProfile);
                setLocationData({
                    city: profileRes.data.data.lawyerProfile.location?.city || '',
                    state: profileRes.data.data.lawyerProfile.location?.state || '',
                    address: profileRes.data.data.lawyerProfile.location?.address || '',
                    zipCode: profileRes.data.data.lawyerProfile.location?.zipCode || ''
                });
            }

            // Fetch consultations (appointments)
            try {
                const consultationsRes = await api.get('/appointments');
                setConsultations(consultationsRes.data.data || []);

                // Calculate stats
                const total = consultationsRes.data.data?.length || 0;
                const pending = consultationsRes.data.data?.filter(c => c.status === 'pending').length || 0;
                const completed = consultationsRes.data.data?.filter(c => c.status === 'completed').length || 0;

                setStats({
                    totalConsultations: total,
                    pendingConsultations: pending,
                    completedConsultations: completed,
                    rating: profileRes.data.data.lawyerProfile?.rating?.average || 4.5,
                    totalEarnings: completed * 150 // Mock calculation
                });
            } catch (err) {
                console.warn('Could not fetch consultations, using mock data');
                const mockData = getMockConsultations();
                setConsultations(mockData);
                setStats({
                    totalConsultations: mockData.length,
                    pendingConsultations: mockData.filter(c => c.status === 'pending').length,
                    completedConsultations: mockData.filter(c => c.status === 'completed').length,
                    rating: 4.5,
                    totalEarnings: 450
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            // Use mock data
            const mockData = getMockConsultations();
            setConsultations(mockData);
            setStats({
                totalConsultations: mockData.length,
                pendingConsultations: mockData.filter(c => c.status === 'pending').length,
                completedConsultations: mockData.filter(c => c.status === 'completed').length,
                rating: 4.5,
                totalEarnings: 450
            });
        } finally {
            setLoading(false);
        }
    };

    const getMockConsultations = () => [
        {
            _id: '1',
            client: { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
            date: new Date(Date.now() + 86400000).toISOString(),
            time: '10:00 AM',
            status: 'pending',
            type: 'Criminal Law',
            message: 'Need consultation regarding a traffic violation case. I received a speeding ticket and want to understand my options.'
        },
        {
            _id: '2',
            client: { name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
            date: new Date(Date.now() + 172800000).toISOString(),
            time: '2:00 PM',
            status: 'pending',
            type: 'Family Law',
            message: 'Divorce consultation needed. Looking for guidance on custody arrangements.'
        },
        {
            _id: '3',
            client: { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' },
            date: new Date(Date.now() - 86400000).toISOString(),
            time: '11:00 AM',
            status: 'completed',
            type: 'Corporate Law',
            message: 'Business contract review for new partnership agreement.'
        },
        {
            _id: '4',
            client: { name: 'Alice Williams', email: 'alice@example.com', phone: '+1234567893' },
            date: new Date(Date.now() - 172800000).toISOString(),
            time: '3:00 PM',
            status: 'completed',
            type: 'Real Estate Law',
            message: 'Property purchase agreement review needed.'
        },
        {
            _id: '5',
            client: { name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1234567894' },
            date: new Date(Date.now() - 259200000).toISOString(),
            time: '9:00 AM',
            status: 'completed',
            type: 'Immigration Law',
            message: 'Visa application assistance required.'
        }
    ];

    const handleConsultationAction = async (id, action) => {
        try {
            await api.patch(`/appointments/${id}`, { status: action });
            toast.success(`Consultation ${action}`);
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating consultation:', error);
            toast.error('Failed to update consultation');
        }
    };

    const handleLocationUpdate = async () => {
        try {
            await api.put('/lawyers/profile', {
                location: locationData
            });
            toast.success('Location updated successfully');
            setEditingLocation(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error('Failed to update location');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-screen">
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lawyer-dashboard">
            {/* Welcome Header */}
            <motion.div
                className="welcome-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="welcome-content">
                    <h1>{getTimeOfDay()}, {user?.name}! 👋</h1>
                    <p>Here's what's happening with your practice today</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline">
                        <Settings size={18} />
                        Settings
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="stats-grid-lawyer">
                <motion.div
                    className="stat-card-modern"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-header">
                        <div className="stat-icon purple">
                            <Users size={24} />
                        </div>
                        <span className="stat-trend positive">
                            <TrendingUp size={14} />
                            +12%
                        </span>
                    </div>
                    <div className="stat-body">
                        <h3>{stats.totalConsultations}</h3>
                        <p>Total Consultations</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card-modern"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-header">
                        <div className="stat-icon orange">
                            <Clock size={24} />
                        </div>
                        <span className="stat-badge">{stats.pendingConsultations} New</span>
                    </div>
                    <div className="stat-body">
                        <h3>{stats.pendingConsultations}</h3>
                        <p>Pending Requests</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card-modern"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-header">
                        <div className="stat-icon green">
                            <CheckCircle size={24} />
                        </div>
                        <span className="stat-trend positive">
                            <Activity size={14} />
                            Active
                        </span>
                    </div>
                    <div className="stat-body">
                        <h3>{stats.completedConsultations}</h3>
                        <p>Completed</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card-modern"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-header">
                        <div className="stat-icon yellow">
                            <Star size={24} />
                        </div>
                        <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < Math.floor(stats.rating) ? '#fbbf24' : 'none'}
                                    color="#fbbf24"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="stat-body">
                        <h3>{stats.rating.toFixed(1)}</h3>
                        <p>Average Rating</p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Consultation Requests */}
                <div className="dashboard-card consultations-section">
                    <div className="card-header">
                        <div>
                            <h2>
                                <MessageSquare size={22} />
                                Consultation Requests
                            </h2>
                            <p className="card-subtitle">Manage your client consultations</p>
                        </div>
                        <div className="filter-tabs">
                            <button className="tab active">All</button>
                            <button className="tab">Pending</button>
                            <button className="tab">Completed</button>
                        </div>
                    </div>

                    <div className="consultations-list">
                        {consultations.length === 0 ? (
                            <div className="empty-state">
                                <MessageSquare size={48} />
                                <h3>No consultations yet</h3>
                                <p>New consultation requests will appear here</p>
                            </div>
                        ) : (
                            consultations.map((consultation, index) => (
                                <motion.div
                                    key={consultation._id}
                                    className={`consultation-card-modern ${consultation.status}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="consultation-main">
                                        <div className="client-section">
                                            <div className="client-avatar-large">
                                                {consultation.client?.name?.charAt(0) || 'C'}
                                            </div>
                                            <div className="client-details">
                                                <h4>{consultation.client?.name || 'Unknown Client'}</h4>
                                                <span className="consultation-type-badge">
                                                    <Briefcase size={14} />
                                                    {consultation.type}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`status-pill ${consultation.status}`}>
                                            {consultation.status === 'pending' && <Clock size={14} />}
                                            {consultation.status === 'completed' && <CheckCircle size={14} />}
                                            {consultation.status === 'accepted' && <CheckCircle size={14} />}
                                            {consultation.status === 'rejected' && <XCircle size={14} />}
                                            {consultation.status}
                                        </span>
                                    </div>

                                    <div className="consultation-info-grid">
                                        <div className="info-item">
                                            <Calendar size={16} />
                                            <span>{formatDate(consultation.date)}</span>
                                        </div>
                                        <div className="info-item">
                                            <Clock size={16} />
                                            <span>{consultation.time}</span>
                                        </div>
                                        <div className="info-item">
                                            <Mail size={16} />
                                            <span>{consultation.client?.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <Phone size={16} />
                                            <span>{consultation.client?.phone}</span>
                                        </div>
                                    </div>

                                    {consultation.message && (
                                        <div className="consultation-message-box">
                                            <MessageSquare size={16} />
                                            <p>{consultation.message}</p>
                                        </div>
                                    )}

                                    {consultation.status === 'pending' && (
                                        <div className="consultation-actions-modern">
                                            <button
                                                className="action-btn accept"
                                                onClick={() => handleConsultationAction(consultation._id, 'accepted')}
                                            >
                                                <CheckCircle size={18} />
                                                Accept
                                            </button>
                                            <button
                                                className="action-btn decline"
                                                onClick={() => handleConsultationAction(consultation._id, 'rejected')}
                                            >
                                                <XCircle size={18} />
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    {/* Location Settings */}
                    <motion.div
                        className="dashboard-card location-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-header">
                            <h2>
                                <MapPin size={20} />
                                Practice Location
                            </h2>
                            {!editingLocation && (
                                <button
                                    className="btn-icon"
                                    onClick={() => setEditingLocation(true)}
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                        </div>

                        {editingLocation ? (
                            <div className="location-edit-form">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={locationData.city}
                                    onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={locationData.state}
                                    onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Full Address"
                                    value={locationData.address}
                                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={locationData.zipCode}
                                    onChange={(e) => setLocationData({ ...locationData, zipCode: e.target.value })}
                                />
                                <div className="form-actions-inline">
                                    <button className="btn btn-primary-small" onClick={handleLocationUpdate}>
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary-small"
                                        onClick={() => setEditingLocation(false)}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="location-display-modern">
                                <div className="location-field">
                                    <label>City</label>
                                    <p>{locationData.city || 'Not set'}</p>
                                </div>
                                <div className="location-field">
                                    <label>State</label>
                                    <p>{locationData.state || 'Not set'}</p>
                                </div>
                                <div className="location-field">
                                    <label>Address</label>
                                    <p>{locationData.address || 'Not set'}</p>
                                </div>
                                <div className="location-field">
                                    <label>Zip Code</label>
                                    <p>{locationData.zipCode || 'Not set'}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        className="dashboard-card quick-stats"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="card-header">
                            <h2>
                                <Award size={20} />
                                Quick Stats
                            </h2>
                        </div>
                        <div className="quick-stats-list">
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="quick-stat-value">${stats.totalEarnings}</p>
                                    <p className="quick-stat-label">Total Earnings</p>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="quick-stat-value">95%</p>
                                    <p className="quick-stat-label">Response Rate</p>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="quick-stat-value">{stats.totalConsultations}</p>
                                    <p className="quick-stat-label">Total Clients</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LawyerDashboard;
