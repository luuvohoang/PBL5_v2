import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PC Parts Store</Link>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/">Home</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/cart">Cart</Link>
                        {user && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Staff') && (
                            <>
                                <Link to="/employees">Employees</Link>
                                <Link to="/customers">Customers</Link>
                                <Link to="/chat">Chat</Link>
                            </>
                        )}
                        {user && user.role === 'Customer' && (
                            <Link to="/customer-chat">Support Chat</Link>
                        )}
                        {user ? (
                            <>
                                <span>Welcome, {user.username} ({user.role})</span>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
