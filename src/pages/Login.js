import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(formData.email, formData.password);
            console.log('Login response:', response); // For debugging

            // Store user data including role
            localStorage.setItem('user', JSON.stringify({
                id: response.id,
                username: response.username,
                email: response.email,
                role: response.role
            }));

            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data || 'Login failed');
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit">Login</button>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
