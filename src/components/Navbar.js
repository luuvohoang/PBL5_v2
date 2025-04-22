import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, searchProducts } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showCategories, setShowCategories] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBasedLinks = () => {
        if (!user) return null;

        switch (user.role) {
            case 'Admin':
            case 'Manager':
                return (
                    <>
                        <Link to="/employees">Employee Management</Link>
                        <Link to="/customers">Customer Management</Link>
                        <Link to="/ProductManagement">Product Management</Link>
                        <Link to="/admin/orders">Order Management</Link>
                        <Link to="/chat">Staff Chat</Link>
                    </>
                );
            case 'Staff':
                return (
                    <>
                        <Link to="/customers">Customer Management</Link>
                        <Link to="/ProductManagement">Product Management</Link>
                        <Link to="/admin/orders">Order Management</Link>
                        <Link to="/chat">Staff Chat</Link>
                    </>
                );
            case 'Customer':
                return <Link to="/customer-chat">Support Chat</Link>;
            default:
                return null;
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            navigate(`/products/search?q=${encodeURIComponent(searchTerm.trim())}`);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <div className="navbar-wrapper">
            {/* Top Contact Bar */}
            <div className="contact-bar">
                <div className="container">
                    <div className="contact-info">
                        <span><i className="fas fa-map-marker-alt"></i> 123 Street, Da Nang, Vietnam</span>
                        <span><i className="fas fa-phone"></i> +84 123 456 789</span>
                        <span><i className="fas fa-envelope"></i> info@pcparts.com</span>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="navbar-main">
                <div className="container">
                    <Link to="/" className="logo">PC Parts Store</Link>
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>
                    <div className="nav-actions">
                        {user ? (
                            <>
                                <span className="user-welcome">Hi, {user.username}</span>
                                <Link to="/profile" className="nav-link">Profile</Link>
                                <Link to="/orders" className="nav-link">Orders</Link>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link>
                            </div>
                        )}
                        <Link to="/cart" className="cart-icon">
                            <i className="fas fa-shopping-cart"></i>
                            <span className="cart-count">0</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Categories Navigation */}
            <nav className="navbar-categories">
                <div className="container">
                    <div className="nav-section">
                        <div className="categories-menu">
                            <button className="categories-toggle">
                                <i className="fas fa-bars"></i> All Categories
                            </button>
                            <div className="categories-dropdown">
                                <Link to="/products?category=cpu">CPUs</Link>
                                <Link to="/products?category=gpu">GPUs</Link>
                                <Link to="/products?category=motherboard">Motherboards</Link>
                                <Link to="/products?category=ram">RAM</Link>
                            </div>
                        </div>
                        <div className="main-menu">
                            {getRoleBasedLinks()}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
