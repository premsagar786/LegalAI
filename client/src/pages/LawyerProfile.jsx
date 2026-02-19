import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Star,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle,
    Phone,
    Mail,
    Globe,
    Calendar,
    Award,
    BookOpen,
    MessageSquare
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './LawyerProfile.css';

const LawyerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLawyerProfile();
    }, [id]);

    const fetchLawyerProfile = async () => {
        setLoading(true);
        try {
            console.log('📡 Fetching lawyer profile:', id);
            const response = await api.get(`/lawyers/${id}`);
            console.log('✅ Lawyer profile:', response.data);
            setLawyer(response.data.data);
        } catch (error) {
            console.error('❌ Error fetching lawyer:', error);
            toast.error('Failed to load lawyer profile');
            // Use mock data for Geoapify results
            if (id.startsWith('geoapify_')) {
                setLawyer(getMockGeoapifyLawyer(id));
            }
        } finally {
            setLoading(false);
        }
    };

    const getMockGeoapifyLawyer = (lawyerId) => ({
        _id: lawyerId,
        isGeoapifyResult: true,
        user: {
            name: 'Legal Services Provider',
            email: 'contact@example.com',
            phone: '+1-234-567-8900'
        },
        specializations: ['General Practice'],
        experience: 0,
        hourlyRate: 0,
        location: {
            city: 'Unknown',
            address: 'Address from Geoapify',
            coordinates: { type: 'Point', coordinates: [0, 0] }
        },
        rating: { average: 0, count: 0 },
        bio: 'This is a verified listing from Geoapify Places API. Contact for more information.',
        isVerified: true,
        education: [],
        languages: ['English'],
        availability: {}
    });

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Loading lawyer profile...</p>
            </div>
        );
    }

    if (!lawyer) {
        return (
            <div className="error-screen">
                <h2>Lawyer Not Found</h2>
                <p>The lawyer profile you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/lawyers')} className="btn btn-primary">
                    Back to Lawyers
                </button>
            </div>
        );
    }

    return (
        <div className="lawyer-profile-page">
            {/* Header */}
            <div className="profile-header">
                <div className="container">
                    <button onClick={() => navigate('/lawyers')} className="back-btn">
                        <ArrowLeft size={20} />
                        Back to Lawyers
                    </button>

                    <motion.div
                        className="profile-hero"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="lawyer-avatar-large">
                            {lawyer.user?.avatar ? (
                                <img src={lawyer.user.avatar} alt={lawyer.user.name} />
                            ) : (
                                <span>{lawyer.user?.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        <div className="lawyer-header-info">
                            <div className="name-section">
                                <h1>{lawyer.user?.name}</h1>
                                {lawyer.isVerified && (
                                    <span className="verified-badge">
                                        <CheckCircle size={20} />
                                        Verified
                                    </span>
                                )}
                                {lawyer.isGeoapifyResult && (
                                    <span className="source-badge">
                                        <MapPin size={16} />
                                        Geoapify
                                    </span>
                                )}
                            </div>

                            <div className="rating-section">
                                <div className="rating-stars">
                                    <Star size={24} fill="currentColor" />
                                    <span className="rating-value">{lawyer.rating?.average?.toFixed(1) || 'N/A'}</span>
                                    <span className="rating-count">({lawyer.rating?.count || 0} reviews)</span>
                                </div>
                            </div>

                            <div className="specializations-tags">
                                {lawyer.specializations?.map((spec, i) => (
                                    <span key={i} className="spec-tag">{spec}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-content">
                <div className="container">
                    <div className="profile-grid">
                        {/* Left Column */}
                        <div className="profile-main">
                            {/* About */}
                            <motion.section
                                className="profile-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2>About</h2>
                                <p>{lawyer.bio || 'No bio available.'}</p>
                            </motion.section>

                            {/* Education */}
                            {lawyer.education && lawyer.education.length > 0 && (
                                <motion.section
                                    className="profile-section"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2><BookOpen size={20} /> Education</h2>
                                    <div className="education-list">
                                        {lawyer.education.map((edu, i) => (
                                            <div key={i} className="education-item">
                                                <h4>{edu.degree}</h4>
                                                <p>{edu.institution}</p>
                                                <span className="year">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Contact Info */}
                            <motion.section
                                className="profile-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2>Contact Information</h2>
                                <div className="contact-info">
                                    {lawyer.phone && (
                                        <div className="contact-item">
                                            <Phone size={18} />
                                            <a href={`tel:${lawyer.phone}`}>{lawyer.phone}</a>
                                        </div>
                                    )}
                                    {lawyer.user?.email && (
                                        <div className="contact-item">
                                            <Mail size={18} />
                                            <a href={`mailto:${lawyer.user.email}`}>{lawyer.user.email}</a>
                                        </div>
                                    )}
                                    {lawyer.website && (
                                        <div className="contact-item">
                                            <Globe size={18} />
                                            <a href={lawyer.website} target="_blank" rel="noopener noreferrer">
                                                Visit Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="profile-sidebar">
                            {/* Quick Stats */}
                            <motion.div
                                className="stats-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3>Quick Stats</h3>
                                <div className="stat-item">
                                    <Briefcase size={20} />
                                    <div>
                                        <span className="stat-value">{lawyer.experience || 0} years</span>
                                        <span className="stat-label">Experience</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Clock size={20} />
                                    <div>
                                        <span className="stat-value">₹{lawyer.hourlyRate || 'N/A'}/hr</span>
                                        <span className="stat-label">Hourly Rate</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <MapPin size={20} />
                                    <div>
                                        <span className="stat-value">{lawyer.location?.city || 'Unknown'}</span>
                                        <span className="stat-label">Location</span>
                                    </div>
                                </div>
                                {lawyer.distance && (
                                    <div className="stat-item">
                                        <MapPin size={20} />
                                        <div>
                                            <span className="stat-value">{(lawyer.distance / 1000).toFixed(1)} km</span>
                                            <span className="stat-label">Distance</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Languages */}
                            {lawyer.languages && lawyer.languages.length > 0 && (
                                <motion.div
                                    className="info-card"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3>Languages</h3>
                                    <div className="tags-list">
                                        {lawyer.languages.map((lang, i) => (
                                            <span key={i} className="tag">{lang}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div
                                className="action-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link to={`/book/${lawyer._id}`} className="btn btn-primary btn-block">
                                    <Calendar size={20} />
                                    Book Consultation
                                </Link>
                                <button className="btn btn-secondary btn-block">
                                    <MessageSquare size={20} />
                                    Send Message
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerProfile;
