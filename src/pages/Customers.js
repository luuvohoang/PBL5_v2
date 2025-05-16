import React, { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import '../styles/CustomerManagement.css';
import LoadingSpinner from '../components/LoadingSpinner';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

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

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = searchTerm.toLowerCase().trim() === '' || 
            customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (dateRange.startDate || dateRange.endDate) {
            const customerDate = new Date(customer.createdAt);
            const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
            const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

            if (start && end) {
                return matchesSearch && customerDate >= start && customerDate <= end;
            } else if (start) {
                return matchesSearch && customerDate >= start;
            } else if (end) {
                return matchesSearch && customerDate <= end;
            }
        }

        return matchesSearch;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="customer-management">
            <div className="header">
                <h1>Customer Management</h1>
            </div>

            <div className="search-filter">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="date-range-filter">
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                        placeholder="Start Date"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                        placeholder="End Date"
                    />
                    {(dateRange.startDate || dateRange.endDate) && (
                        <button 
                            className="clear-date"
                            onClick={() => setDateRange({startDate: '', endDate: ''})}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="customer-list">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id}>
                                <td>{customer.username}</td>
                                <td>{customer.email}</td>
                                <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Customers;
