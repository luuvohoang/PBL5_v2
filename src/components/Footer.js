import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaShieldAlt, FaFileContract, FaTools, FaShippingFast, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>About Us</h3>
                    <p>Your trusted partner in computer hardware solutions.</p>
                </div>
                <div className="footer-section">
                    <h3><i className="fas fa-file-alt"></i> Policies</h3>
                    <ul>
                        <li>
                            <Link to="/policies/privacy">
                                <FaShieldAlt className="footer-icon" /> Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies/terms">
                                <FaFileContract className="footer-icon" /> Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies/warranty">
                                <FaTools className="footer-icon" /> Warranty Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies/shipping">
                                <FaShippingFast className="footer-icon" /> Shipping Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3><i className="fas fa-address-card"></i> Contact</h3>
                    <p>
                        <FaEnvelope className="footer-icon" /> Email: support@example.com
                    </p>
                    <p>
                        <FaPhone className="footer-icon" /> Phone: (123) 456-7890
                    </p>
                    <p>
                        <FaMapMarkerAlt className="footer-icon" /> Address: 123 Tech Street, City
                    </p>
                </div>
                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook /> Facebook
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FaTwitter /> Twitter
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram /> Instagram
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                            <FaYoutube /> YouTube
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
