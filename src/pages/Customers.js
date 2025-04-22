import React, { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import '../styles/Customers.css';
import LoadingSpinner from '../components/LoadingSpinner';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="customer-container">
            <div className="customer-header">
                <h1>Customers List</h1>
            </div>
            <table className="customer-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Created Date</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id}>
                            <td>{customer.username}</td>
                            <td>{customer.email}</td>
                            <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Customers;
