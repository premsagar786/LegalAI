import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Search,
    Shield,
    Users,
    CheckCircle,
    ArrowRight,
    Upload,
    Brain,
    MessageSquare,
    Star,
    Zap,
    Lock
} from 'lucide-react';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: <Upload size={32} />,
            title: 'Upload Documents',
            description: 'Upload legal documents in any format - PDF, images, or scanned copies.'
        },
        {
            icon: <Brain size={32} />,
            title: 'AI Analysis',
            description: 'Advanced OCR and NLP extract key clauses, risks, and obligations.'
        },
        {
            icon: <MessageSquare size={32} />,
            title: 'Expert Consultation',
            description: 'Connect with verified lawyers for personalized legal advice.'
        }
    ];

    const benefits = [
        { icon: <Zap size={24} />, text: 'Instant document analysis' },
        { icon: <Lock size={24} />, text: 'Secure & confidential' },
        { icon: <CheckCircle size={24} />, text: 'Verified lawyers only' },
        { icon: <Star size={24} />, text: 'Ratings & reviews' }
    ];

    const stats = [
        { value: '10K+', label: 'Documents Analyzed' },
        { value: '500+', label: 'Verified Lawyers' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'Support Available' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient" />
                    <div className="hero-pattern" />
                </div>

                <div className="hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="hero-badge">
                            <Zap size={16} />
                            AI-Powered Legal Tech
                        </span>

                        <h1>
                            Understand Your Legal Documents with{' '}
                            <span className="text-gradient">AI Precision</span>
                        </h1>

                        <p className="hero-description">
                            Upload any legal document and get instant AI-powered analysis.
                            Identify risks, understand clauses, and connect with verified lawyers
                            for expert guidance.
                        </p>

                        <div className="hero-cta">
                            <Link to="/analyze" className="btn btn-primary btn-lg">
                                <Upload size={20} />
                                Analyze Document
                            </Link>
                            <Link to="/lawyers" className="btn btn-outline btn-lg">
                                Find a Lawyer
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="hero-benefits">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="benefit-item">
                                    {benefit.icon}
                                    <span>{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="visual-card">
                            <div className="visual-header">
                                <div className="visual-dots">
                                    <span /><span /><span />
                                </div>
                                <span className="visual-title">Document Analysis</span>
                            </div>
                            <div className="visual-content">
                                <div className="analysis-item">
                                    <div className="analysis-icon risk-high">!</div>
                                    <div className="analysis-text">
                                        <strong>Non-Compete Clause</strong>
                                        <span>High risk - 2 year restriction</span>
                                    </div>
                                </div>
                                <div className="analysis-item">
                                    <div className="analysis-icon risk-medium">~</div>
                                    <div className="analysis-text">
                                        <strong>Liability Limitation</strong>
                                        <span>Medium risk - Review recommended</span>
                                    </div>
                                </div>
                                <div className="analysis-item">
                                    <div className="analysis-icon risk-low">✓</div>
                                    <div className="analysis-text">
                                        <strong>Termination Terms</strong>
                                        <span>Low risk - Standard clause</span>
                                    </div>
                                </div>
                                <div className="risk-score">
                                    <div className="score-label">Overall Risk Score</div>
                                    <div className="score-bar">
                                        <div className="score-fill" style={{ width: '45%' }} />
                                    </div>
                                    <div className="score-value">45/100</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>How It Works</h2>
                        <p>Get legal clarity in three simple steps</p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="feature-number">{index + 1}</div>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="cta-content">
                            <h2>Ready to Understand Your Legal Documents?</h2>
                            <p>
                                Join thousands of users who trust LegalAI for document analysis
                                and lawyer consultations.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started Free
                                </Link>
                                <Link to="/about" className="btn btn-secondary btn-lg">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
