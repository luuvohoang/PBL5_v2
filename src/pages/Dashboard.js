import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRevenueByPeriod, getTopProducts } from '../services/api';
import '../styles/Dashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeCustomers: 0,
        revenueChange: 0,
        ordersChange: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, revenue, products] = await Promise.all([
                getDashboardStats(),
                getRevenueByPeriod(period),
                getTopProducts()
            ]);
            
            setStats(statsData);
            setRevenueData(revenue);
            setTopProducts(products);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading dashboard data...</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">${stats?.totalRevenue.toFixed(2)}</p>
                    <p className="stat-change">
                        <span className={stats?.revenueChange >= 0 ? 'positive' : 'negative'}>
                            {stats?.revenueChange}%
                        </span>
                        vs last period
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats?.totalOrders}</p>
                    <p className="stat-change">
                        <span className={stats?.ordersChange >= 0 ? 'positive' : 'negative'}>
                            {stats?.ordersChange}%
                        </span>
                        vs last period
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Average Order Value</h3>
                    <p className="stat-value">${stats?.averageOrderValue.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Customers</h3>
                    <p className="stat-value">{stats?.activeCustomers}</p>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-container">
                <div className="chart-header">
                    <h2>Revenue Trend</h2>
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        className="period-select"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
                        <Line type="monotone" dataKey="orders" stroke="#16a34a" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="top-products">
                <h2>Top Selling Products</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#2563eb" />
                        <Bar dataKey="revenue" fill="#16a34a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
