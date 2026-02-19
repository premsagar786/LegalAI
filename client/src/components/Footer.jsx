import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="logo-icon">
                                <Scale size={24} />
                            </div>
                            <span>LegalAI</span>
                        </Link>
                        <p className="footer-description">
                            AI-powered legal document analysis platform connecting you with verified lawyers
                            for expert consultation.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><Facebook size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                            <a href="#" className="social-link"><Linkedin size={20} /></a>
                            <a href="#" className="social-link"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/lawyers">Find Lawyers</Link></li>
                            <li><Link to="/analyze">Analyze Document</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="footer-section">
                        <h4>Services</h4>
                        <ul>
                            <li><Link to="/analyze">Document Analysis</Link></li>
                            <li><Link to="/lawyers">Lawyer Consultation</Link></li>
                            <li><a href="#">Contract Review</a></li>
                            <li><a href="#">Legal Advice</a></li>
                            <li><a href="#">Agreement Drafting</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <ul className="contact-list">
                            <li>
                                <Mail size={16} />
                                <span>support@legalai.com</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+91 1800-XXX-XXXX</span>
                            </li>
                            <li>
                                <MapPin size={16} />
                                <span>New Delhi, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} LegalAI. All rights reserved.</p>
                    <div className="footer-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/cookies">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
