import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, forgotPassword } from '../services/api';
import '../styles/auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (isForgotPassword) {
                await forgotPassword(formData.email);
                setSuccessMessage('Password reset instructions have been sent to your email.');
                setIsForgotPassword(false);
            } else {
                const response = await login(formData.email, formData.password);
                localStorage.setItem('user', JSON.stringify({
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    role: response.role
                }));
                navigate('/');
                window.location.reload();
            }
        } catch (error) {
            setError(error.response?.data || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isForgotPassword ? 'Reset Password' : 'Welcome Back'}</h2>
                    <p>
                        {isForgotPassword
                            ? 'Enter your email to reset your password'
                            : 'Please sign in to continue'}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    {!isForgotPassword && (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Loading...'
                            : (isForgotPassword ? 'Send Reset Link' : 'Sign In')}
                    </button>

                    <div className="auth-links">
                        <button
                            className="forgot-password-link"
                            onClick={() => navigate('/reset-password')}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="auth-links">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register">Sign Up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
