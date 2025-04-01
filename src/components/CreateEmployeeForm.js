import React, { useState, useEffect } from 'react';
import { getRoles } from '../services/api';
import '../styles/EmployeeForm.css';

const CreateEmployeeForm = ({ onSubmit, onClose }) => {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        roleId: ''
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await getRoles();
                setRoles(rolesData);
                if (rolesData.length > 0) {
                    setFormData(prev => ({ ...prev, roleId: rolesData[0].id }));
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.email || !formData.password || !formData.roleId) {
                alert('Please fill in all required fields');
                return;
            }
            onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Error creating employee. Please try again.');
        }
    };

    return (
        <div className="employee-form-overlay">
            <div className="employee-form">
                <h2>Add New Employee</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Role:</label>
                        <select
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                            required
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-buttons">
                        <button type="submit" className="btn-save">Create</button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployeeForm;
