import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Calendar,
    Clock,
    Upload,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Search,
    Plus,
    Trash2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        analyzedDocuments: 0,
        upcomingAppointments: 0,
        completedConsultations: 0
    });
    const [loading, setLoading] = useState(true);

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/documents/${id}`);

            // Remove from state
            setDocuments(prev => prev.filter(doc => doc._id !== id));
            setStats(prev => ({
                ...prev,
                totalDocuments: prev.totalDocuments - 1
            }));

            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [docsResponse, appsResponse] = await Promise.all([
                api.get('/documents?limit=5'),
                api.get('/appointments?upcoming=true&limit=5')
            ]);

            setDocuments(docsResponse.data.data || []);
            setAppointments(appsResponse.data.data || []);

            setStats({
                totalDocuments: docsResponse.data.total || 0,
                analyzedDocuments: docsResponse.data.data?.filter(d => d.status === 'analyzed').length || 0,
                upcomingAppointments: appsResponse.data.data?.length || 0,
                completedConsultations: 0
            });
        } catch (error) {
            // Use mock data
            setDocuments(getMockDocuments());
            setAppointments(getMockAppointments());
            setStats({
                totalDocuments: 5,
                analyzedDocuments: 3,
                upcomingAppointments: 2,
                completedConsultations: 8
            });
        } finally {
            setLoading(false);
        }
    };

    const getMockDocuments = () => [
        { _id: '1', originalName: 'Employment_Contract.pdf', status: 'analyzed', createdAt: new Date().toISOString() },
        { _id: '2', originalName: 'NDA_Agreement.pdf', status: 'analyzed', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', originalName: 'Service_Agreement.pdf', status: 'uploaded', createdAt: new Date(Date.now() - 172800000).toISOString() }
    ];

    const getMockAppointments = () => [
        {
            _id: '1',
            lawyer: { user: { name: 'Adv. Priya Sharma' }, specializations: ['Corporate Law'] },
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            timeSlot: { startTime: '10:00', endTime: '11:00' },
            status: 'confirmed'
        },
        {
            _id: '2',
            lawyer: { user: { name: 'Adv. Rajesh Kumar' }, specializations: ['Criminal Law'] },
            scheduledDate: new Date(Date.now() + 172800000).toISOString(),
            timeSlot: { startTime: '14:00', endTime: '15:00' },
            status: 'pending'
        }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const statCards = [
        { icon: <FileText size={24} />, label: 'Total Documents', value: stats.totalDocuments, color: 'blue' },
        { icon: <CheckCircle size={24} />, label: 'Analyzed', value: stats.analyzedDocuments, color: 'green' },
        { icon: <Calendar size={24} />, label: 'Upcoming', value: stats.upcomingAppointments, color: 'purple' },
        { icon: <TrendingUp size={24} />, label: 'Consultations', value: stats.completedConsultations, color: 'orange' }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Welcome Section */}
                <div className="dashboard-welcome">
                    <div className="welcome-text">
                        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p>Here's an overview of your legal document management</p>
                    </div>
                    <div className="welcome-actions">
                        <Link to="/analyze" className="btn btn-primary">
                            <Upload size={20} />
                            Analyze Document
                        </Link>
                        <Link to="/lawyers" className="btn btn-secondary">
                            <Search size={20} />
                            Find Lawyer
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            className={`stat-card ${stat.color}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    {/* Recent Documents */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>
                                <FileText size={20} />
                                Recent Documents
                            </h3>
                            <Link to="/documents" className="view-all">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="card-content">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner" />
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={32} />
                                    <p>No documents yet</p>
                                    <Link to="/analyze" className="btn btn-primary btn-sm">
                                        <Plus size={16} />
                                        Upload First Document
                                    </Link>
                                </div>
                            ) : (
                                <ul className="document-list">
                                    {documents.map((doc) => (
                                        <li key={doc._id} className="document-item">
                                            <div className="doc-item-content">
                                                <div className="doc-icon">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="doc-info">
                                                    <span className="doc-name">{doc.originalName}</span>
                                                    <span className="doc-date">{formatDate(doc.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="doc-actions">
                                                <span className={`status-badge ${doc.status}`}>
                                                    {doc.status === 'analyzed' ? (
                                                        <><CheckCircle size={14} /> Analyzed</>
                                                    ) : doc.status === 'processing' ? (
                                                        <><Clock size={14} /> Processing</>
                                                    ) : (
                                                        <><AlertCircle size={14} /> Pending</>
                                                    )}
                                                </span>
                                                <button
                                                    className="btn-icon delete-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteDocument(doc._id);
                                                    }}
                                                    title="Delete Document"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>
                                <Calendar size={20} />
                                Upcoming Appointments
                            </h3>
                            <Link to="/appointments" className="view-all">
                                View All <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="card-content">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner" />
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={32} />
                                    <p>No upcoming appointments</p>
                                    <Link to="/lawyers" className="btn btn-primary btn-sm">
                                        <Plus size={16} />
                                        Book Consultation
                                    </Link>
                                </div>
                            ) : (
                                <ul className="appointment-list">
                                    {appointments.map((apt) => (
                                        <li key={apt._id} className="appointment-item">
                                            <div className="apt-date">
                                                <span className="apt-day">{new Date(apt.scheduledDate).getDate()}</span>
                                                <span className="apt-month">{new Date(apt.scheduledDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                            </div>
                                            <div className="apt-info">
                                                <span className="apt-lawyer">{apt.lawyer?.user?.name}</span>
                                                <span className="apt-time">
                                                    <Clock size={14} />
                                                    {apt.timeSlot?.startTime} - {apt.timeSlot?.endTime}
                                                </span>
                                                <span className="apt-spec">{apt.lawyer?.specializations?.[0]}</span>
                                            </div>
                                            <span className={`status-badge ${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <Link to="/analyze" className="action-card">
                            <Upload size={28} />
                            <span>Upload Document</span>
                        </Link>
                        <Link to="/lawyers" className="action-card">
                            <Search size={28} />
                            <span>Find Lawyer</span>
                        </Link>
                        <Link to="/documents" className="action-card">
                            <FileText size={28} />
                            <span>View Documents</span>
                        </Link>
                        <Link to="/appointments" className="action-card">
                            <Calendar size={28} />
                            <span>My Appointments</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
