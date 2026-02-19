import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    Scale,
    Shield,
    Zap,
    Users,
    Target,
    Award,
    Sparkles,
    CheckCircle,
    ArrowRight,
    Cpu,
    Lock,
    TrendingUp,
    Globe,
    Heart,
    Lightbulb
} from 'lucide-react';
import './About.css';

const About = () => {
    const features = [
        {
            icon: <Brain size={32} />,
            title: 'AI-Powered Analysis',
            description: 'Advanced machine learning algorithms analyze legal documents with 95% accuracy, identifying key clauses, risks, and opportunities.',
            color: '#667eea'
        },
        {
            icon: <Shield size={32} />,
            title: 'Data Security',
            description: 'Bank-level encryption ensures your sensitive legal documents are protected with end-to-end security and privacy.',
            color: '#4ade80'
        },
        {
            icon: <Zap size={32} />,
            title: 'Instant Results',
            description: 'Get comprehensive legal analysis in seconds, not hours. Our AI processes documents 100x faster than manual review.',
            color: '#f59e0b'
        },
        {
            icon: <Users size={32} />,
            title: 'Expert Network',
            description: 'Connect with verified lawyers across India. Our platform hosts 1000+ legal professionals ready to assist you.',
            color: '#ec4899'
        }
    ];

    const stats = [
        { value: '50K+', label: 'Documents Analyzed', icon: <Scale size={24} /> },
        { value: '1000+', label: 'Verified Lawyers', icon: <Users size={24} /> },
        { value: '95%', label: 'Accuracy Rate', icon: <Target size={24} /> },
        { value: '24/7', label: 'AI Availability', icon: <Zap size={24} /> }
    ];

    const values = [
        {
            icon: <Lightbulb size={28} />,
            title: 'Innovation',
            description: 'Pioneering AI technology to make legal services accessible to everyone.'
        },
        {
            icon: <Heart size={28} />,
            title: 'Empathy',
            description: 'Understanding the stress of legal matters and providing compassionate support.'
        },
        {
            icon: <Lock size={28} />,
            title: 'Trust',
            description: 'Building confidence through transparency, security, and reliable service.'
        },
        {
            icon: <TrendingUp size={28} />,
            title: 'Excellence',
            description: 'Continuously improving our AI to deliver the best legal insights.'
        }
    ];

    const timeline = [
        {
            year: '2024',
            title: 'Platform Launch',
            description: 'LegalAI goes live, revolutionizing legal document analysis in India.'
        },
        {
            year: '2025',
            title: 'AI Enhancement',
            description: 'Integrated ChatGPT-4 for advanced natural language understanding.'
        },
        {
            year: '2026',
            title: 'Nationwide Expansion',
            description: 'Partnered with 1000+ lawyers across all major Indian cities.'
        },
        {
            year: 'Future',
            title: 'Global Vision',
            description: 'Expanding to international markets with multilingual support.'
        }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>

                <div className="about-container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="hero-badge">
                            <Sparkles size={16} />
                            <span>About LegalAI</span>
                        </div>

                        <h1 className="hero-title">
                            Democratizing Legal Services
                            <br />
                            <span className="gradient-text">Through AI Innovation</span>
                        </h1>

                        <p className="hero-description">
                            We're on a mission to make legal expertise accessible to everyone.
                            Our AI-powered platform combines cutting-edge technology with human
                            expertise to provide instant legal document analysis and connect you
                            with the right legal professionals.
                        </p>

                        <div className="hero-stats">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="stat-item"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    <div className="stat-icon">{stat.icon}</div>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="about-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our Mission</h2>
                        <p>Empowering individuals and businesses with AI-driven legal intelligence</p>
                    </motion.div>

                    <div className="mission-content">
                        <motion.div
                            className="mission-card primary"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="mission-icon">
                                <Globe size={48} />
                            </div>
                            <h3>Accessibility</h3>
                            <p>
                                Legal services shouldn't be a luxury. We're breaking down barriers
                                by providing instant AI-powered legal analysis to anyone, anywhere,
                                at any time.
                            </p>
                        </motion.div>

                        <motion.div
                            className="mission-card secondary"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="mission-icon">
                                <Cpu size={48} />
                            </div>
                            <h3>Innovation</h3>
                            <p>
                                Leveraging state-of-the-art AI and machine learning to transform
                                how people interact with legal documents and find legal representation.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="about-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Why Choose LegalAI?</h2>
                        <p>Cutting-edge technology meets legal expertise</p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}>
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="about-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our Core Values</h2>
                        <p>The principles that guide everything we do</p>
                    </motion.div>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="value-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="timeline-section">
                <div className="about-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our Journey</h2>
                        <p>Building the future of legal technology</p>
                    </motion.div>

                    <div className="timeline">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={index}
                                className="timeline-item"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="timeline-marker">
                                    <div className="timeline-dot"></div>
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-year">{item.year}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="tech-section">
                <div className="about-container">
                    <motion.div
                        className="tech-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="tech-info">
                            <h2>Powered by Advanced AI</h2>
                            <p className="tech-description">
                                Our platform leverages the latest in artificial intelligence and
                                natural language processing to understand and analyze legal documents
                                with unprecedented accuracy.
                            </p>

                            <div className="tech-features">
                                <div className="tech-feature">
                                    <CheckCircle size={20} />
                                    <span>ChatGPT-4 Integration for natural language understanding</span>
                                </div>
                                <div className="tech-feature">
                                    <CheckCircle size={20} />
                                    <span>Machine Learning models trained on millions of legal documents</span>
                                </div>
                                <div className="tech-feature">
                                    <CheckCircle size={20} />
                                    <span>Real-time Socket.IO for instant notifications and updates</span>
                                </div>
                                <div className="tech-feature">
                                    <CheckCircle size={20} />
                                    <span>Secure cloud infrastructure with 99.9% uptime</span>
                                </div>
                            </div>
                        </div>

                        <div className="tech-visual">
                            <div className="tech-circle circle-1">
                                <Brain size={40} />
                            </div>
                            <div className="tech-circle circle-2">
                                <Cpu size={32} />
                            </div>
                            <div className="tech-circle circle-3">
                                <Zap size={28} />
                            </div>
                            <div className="tech-circle circle-4">
                                <Shield size={24} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="about-container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Award size={48} className="cta-icon" />
                        <h2>Ready to Experience the Future of Legal Services?</h2>
                        <p>Join thousands of users who trust LegalAI for their legal needs</p>
                        <div className="cta-buttons">
                            <a href="/analyze" className="btn btn-primary btn-lg">
                                Analyze Document
                                <ArrowRight size={20} />
                            </a>
                            <a href="/lawyers" className="btn btn-secondary btn-lg">
                                Find a Lawyer
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
