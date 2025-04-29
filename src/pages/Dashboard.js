import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRevenueByPeriod, getTopProducts, getOrderStats } from '../services/api';
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

    const [orderStats, setOrderStats] = useState({
        pendingOrders: 0,
        processingOrders: 0,
        shippingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const statsData = await getDashboardStats();

                setStats({
                    totalRevenue: statsData.totalRevenue || 0,
                    totalOrders: statsData.totalOrders || 0,
                    averageOrderValue: statsData.averageOrderValue || 0,
                    activeCustomers: statsData.activeCustomers || 0,
                    revenueChange: parseFloat(statsData.revenueChange?.toFixed(2)) || 0,
                    ordersChange: parseFloat(statsData.ordersChange?.toFixed(2)) || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    useEffect(() => {
        const fetchOrderStats = async () => {
            const stats = await getOrderStats();
            setOrderStats(stats);
        };
        fetchOrderStats();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Lấy thống kê tổng quan
            const statsData = await getDashboardStats();
            setStats({
                totalRevenue: statsData.totalRevenue || 0,
                totalOrders: statsData.totalOrders || 0,
                averageOrderValue: statsData.averageOrderValue || 0,
                activeCustomers: statsData.activeCustomers || 0,
                revenueChange: statsData.revenueChange || 0,
                ordersChange: statsData.ordersChange || 0
            });

            // Lấy dữ liệu doanh thu theo kỳ
            const revenueData = await getRevenueByPeriod(period);
            setRevenueData(revenueData);

            // Lấy top sản phẩm bán chạy
            const topProductsData = await getTopProducts();
            setTopProducts(topProductsData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [revenueData, topProductsData] = await Promise.all([
                    getRevenueByPeriod(period),
                    getTopProducts()
                ]);

                setRevenueData(revenueData);
                setTopProducts(topProductsData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const data = await getRevenueByPeriod(period);
                setRevenueData(data);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
                setRevenueData([]);
            }
        };

        fetchRevenueData();
    }, [period]);

    const PeriodSelector = () => (
        <div className="period-selector">
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
    );

    const RevenueChart = () => {
        if (!revenueData.length) return <div>No revenue data available</div>;

        const chartData = {
            labels: revenueData.map(item => item.date),
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData.map(item => item.revenue),
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Orders',
                    data: revenueData.map(item => item.orders),
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        };

        return (
            <div className="revenue-chart">
                <h2>Revenue Trends</h2>
                <Line data={chartData} options={{
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }} />
            </div>
        );
    };

    if (loading) return <div className="loading">Loading dashboard data...</div>;

    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tổng Doanh Thu</h3>
                    <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="stat-change">
                        {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%
                    </p>
                </div>

                <div className="stat-card">
                    <h3>Tổng Đơn Hàng</h3>
                    <p className="stat-value">{stats.totalOrders}</p>
                    <p className="stat-change">
                        {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}%
                    </p>
                </div>

                <div className="stat-card">
                    <h3>Giá Trị Trung Bình</h3>
                    <p className="stat-value">${stats.averageOrderValue.toLocaleString()}</p>
                </div>

                <div className="stat-card">
                    <h3>Khách Hàng Hoạt Động</h3>
                    <p className="stat-value">{stats.activeCustomers}</p>
                </div>
            </div>

            <div className="order-stats-container">
                <h2>Thống Kê Đơn Hàng</h2>
                <div className="order-stats-grid">
                    <div className="stat-card">
                        <h3>Đơn Chờ Xử Lý</h3>
                        <p className="stat-value">{orderStats.pendingOrders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đang Xử Lý</h3>
                        <p className="stat-value">{orderStats.processingOrders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đang Giao</h3>
                        <p className="stat-value">{orderStats.shippingOrders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đã Giao</h3>
                        <p className="stat-value">{orderStats.deliveredOrders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Đã Hủy</h3>
                        <p className="stat-value">{orderStats.cancelledOrders}</p>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-container">
                <div className="chart-header">
                    <h2>Revenue Trend</h2>
                    <PeriodSelector />
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
