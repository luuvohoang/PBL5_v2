import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(true);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        // Basic token validation
        if (!token || token.trim() === '') {
            setIsTokenValid(false);
            setError('Invalid reset token. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Client-side validation
            if (!isTokenValid) {
                setError('Invalid reset token. Please request a new password reset.');
                return;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }

            // Send reset request
            await resetPassword(token, formData.newPassword);

            setSuccess('Password reset successful! Redirecting to login...');

            // Redirect after success
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            if (error.response?.status === 400) {
                setError('The password reset link has expired or is invalid. Please request a new one.');
            } else {
                setError('An error occurred while resetting your password. Please try again.');
            }
            console.error('Reset password error:', error);
        }
    };

    return (
        <div className="container">
            <div className="auth-form">
                <h2>Reset Your Password</h2>

                {error && (
                    <div className="error-message">
                        {error}
                        {error.includes('expired') && (
                            <p>
                                <a href="/login" onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/login');
                                }}>
                                    Return to Login
                                </a>
                            </p>
                        )}
                    </div>
                )}

                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({
                                ...formData,
                                newPassword: e.target.value
                            })}
                            disabled={!isTokenValid}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm New Password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({
                                ...formData,
                                confirmPassword: e.target.value
                            })}
                            disabled={!isTokenValid}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={!isTokenValid}
                    >
                        Reset Password
                    </button>
                </form>

                <div className="mt-3 text-center">
                    <a href="/login" onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }}>
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;