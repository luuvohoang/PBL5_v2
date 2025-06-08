import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, searchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showCategories, setShowCategories] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { cartCount } = useCart();

    const categoryLinks = [
        { name: 'CPUs', path: '/products?category=CPU', icon: 'fas fa-microchip' },
        { name: 'GPUs', path: '/products?category=GPU', icon: 'fas fa-tv' },
        { name: 'Motherboards', path: '/products?category=Motherboard', icon: 'fas fa-server' },
        { name: 'RAM', path: '/products?category=RAM', icon: 'fas fa-memory' }
    ];

    const handleCategoryClick = (categoryPath) => {
        console.log('Navigating to:', categoryPath);
        navigate(categoryPath);
    };

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
                        <Link to="/dashboard"><i className="fas fa-chart-line"></i> Dashboard</Link>
                        <Link to="/employees"><i className="fas fa-users"></i> Employee Management</Link>
                        <Link to="/customers"><i className="fas fa-user-friends"></i> Customer Management</Link>
                        <Link to="/ProductManagement"><i className="fas fa-box"></i> Product Management</Link>
                        <Link to="/admin/orders"><i className="fas fa-shopping-bag"></i> Order Management</Link>
                        <Link to="/chat"><i className="fas fa-comments"></i> Staff Chat</Link>
                    </>
                );
            case 'Staff':
                return (
                    <>
                        <Link to="/dashboard"><i className="fas fa-chart-line"></i> Dashboard</Link>
                        <Link to="/customers"><i className="fas fa-user-friends"></i> Customer Management</Link>
                        <Link to="/ProductManagement"><i className="fas fa-box"></i> Product Management</Link>
                        <Link to="/admin/orders"><i className="fas fa-shopping-bag"></i> Order Management</Link>
                        <Link to="/chat"><i className="fas fa-comments"></i> Staff Chat</Link>
                    </>
                );
            case 'Customer':
                return <Link to="/customer-chat"><i className="fas fa-headset"></i> Support Chat</Link>;
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
                    <Link to="/" className="logo"><i className="fas fa-desktop"></i> PC Parts Store</Link>
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
                                <span className="user-welcome"><i className="fas fa-user"></i> Hi, {user.username}</span>
                                <Link to="/profile" className="nav-link"><i className="fas fa-user-circle"></i> Profile</Link>
                                <Link to="/orders" className="nav-link"><i className="fas fa-receipt"></i> Orders</Link>
                                <button onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                            </>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login"><i className="fas fa-sign-in-alt"></i> Login</Link>
                                <Link to="/register"><i className="fas fa-user-plus"></i> Register</Link>
                            </div>
                        )}
                        <Link to="/cart" className="cart-icon">
                            <i className="fas fa-shopping-cart"></i>
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
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
                                {categoryLinks.map(category => (
                                    <Link 
                                        key={category.name}
                                        to={category.path}
                                        className="category-link"
                                        onClick={() => handleCategoryClick(category.path)}
                                    >
                                        <i className={category.icon}></i>
                                        {category.name}
                                    </Link>
                                ))}
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
