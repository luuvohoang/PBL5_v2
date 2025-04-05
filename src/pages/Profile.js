import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, getUserProfile } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        address: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchUserProfile();
        }
    }, [user?.id]);

    const fetchUserProfile = async () => {
        try {
            const data = await getUserProfile(user.id);
            setUserData(data);
            setFormData({
                phoneNumber: data.phoneNumber || '',
                address: data.address || ''
            });
        } catch (error) {
            setMessage('Failed to load user profile');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateUserProfile(user.id, formData);

            if (response.user) {
                // Cập nhật state
                setUserData(response.user);

                // Cập nhật localStorage với tất cả thông tin user
                const updatedUser = {
                    ...user,
                    phoneNumber: response.user.phoneNumber,
                    address: response.user.address
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setMessage('Profile updated successfully!');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage('Failed to update profile');
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>Profile Settings</h1>
                {message && <div className="alert">{message}</div>}

                <div className="profile-info">
                    <h2>Account Information</h2>
                    <p><strong>Username:</strong> {userData?.username}</p>
                    <p><strong>Email:</strong> {userData?.email}</p>
                    <p><strong>Phone Number:</strong> {userData?.phoneNumber || "Not set"}</p>
                    <p><strong>Address:</strong> {userData?.address || "Not set"}</p>

                    {!isEditing && (
                        <button
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditing && (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <h2>Edit Information</h2>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter your address"
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="save-button">Save Changes</button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        phoneNumber: userData?.phoneNumber || '',
                                        address: userData?.address || ''
                                    });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
