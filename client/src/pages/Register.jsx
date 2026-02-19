import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Scale,
    ArrowRight,
    User,
    Phone,
    Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const user = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role
            });

            toast.success('Account created successfully!');

            if (user.role === 'lawyer') {
                navigate('/lawyer-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <Scale size={32} />
                            <span>LegalAI</span>
                        </Link>
                        <h1>Create Account</h1>
                        <p>Join thousands of users on our platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone size={20} className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">I am a</label>
                            <div className="role-selector">
                                <button
                                    type="button"
                                    className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, role: 'user' })}
                                >
                                    <User size={20} />
                                    <span>User</span>
                                    <small>Looking for legal help</small>
                                </button>
                                <button
                                    type="button"
                                    className={`role-option ${formData.role === 'lawyer' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, role: 'lawyer' })}
                                >
                                    <Briefcase size={20} />
                                    <span>Lawyer</span>
                                    <small>Offering legal services</small>
                                </button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Create password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <label className="checkbox-label terms">
                            <input type="checkbox" required />
                            <span>
                                I agree to the{' '}
                                <Link to="/terms">Terms of Service</Link> and{' '}
                                <Link to="/privacy">Privacy Policy</Link>
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </motion.div>

                <div className="auth-visual">
                    <div className="visual-content">
                        <h2>Join Our Legal Platform</h2>
                        <p>
                            Whether you're seeking legal guidance or a lawyer looking to
                            connect with clients, LegalAI has you covered.
                        </p>
                        <div className="visual-features">
                            <div className="visual-feature">
                                <span className="check">✓</span>
                                Free document analysis
                            </div>
                            <div className="visual-feature">
                                <span className="check">✓</span>
                                Connect with lawyers
                            </div>
                            <div className="visual-feature">
                                <span className="check">✓</span>
                                Track your consultations
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
