import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import '../styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        let isMounted = true;

        const loadOrders = async () => {
            try {
                if (!user?.id) return;

                setLoading(true);
                const response = await getUserOrders(user.id);

                if (isMounted) {
                    if (Array.isArray(response)) {
                        setOrders(response);
                    } else {
                        setOrders([]);
                        setError('Invalid response format');
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching orders:', error);
                    setError(error.message);
                    setOrders([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadOrders();

        return () => {
            isMounted = false;
        };
    }, [user?.id]); // Only depend on user.id

    if (!user) {
        navigate('/login');
        return null;
    }

    if (loading) {
        return <div className="loading-container">Loading orders...</div>;
    }

    if (error) {
        return <div className="error-container">Error: {error}</div>;
    }

    return (
        <div className="orders-page">
            <h1>Order History</h1>
            {orders?.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="orders-list">
                    {orders?.map(order => (
                        <div key={order?.id || Math.random()} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order?.id || 'N/A'}</h3>
                                <span className={`status ${(order?.status || 'pending').toLowerCase()}`}>
                                    {order?.status || 'Pending'}
                                </span>
                            </div>
                            <div className="order-details">
                                <p>Date: {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
                                <p>Email: {order?.email || 'N/A'}</p>
                                <p>Phone: {order?.phoneNumber || 'N/A'}</p>
                                <p>Shipping Address: {order?.shippingAddress || 'N/A'}</p>
                                <p>Payment Method: {order?.paymentMethod || 'COD'}</p>
                                <p>Subtotal: ${Number(order?.subTotal || 0).toFixed(2)}</p>
                                <p>Shipping Fee: ${Number(order?.shippingFee || 0).toFixed(2)}</p>
                                <p>Total Amount: ${Number(order?.totalAmount || 0).toFixed(2)}</p>
                            </div>
                            <div className="order-items">
                                {(order?.items || []).map((item, index) => (
                                    <div key={item?.id || index} className="order-item">
                                        <div className="item-info">
                                            <p>Product: {item?.productName || 'Unknown Product'}</p>
                                            <p>Serial Number: {item?.serialNumber || 'N/A'}</p>
                                            <p>Price: ${Number(item?.unitPrice || 0).toFixed(2)}</p>
                                            <p>Subtotal: ${Number(item?.subtotal || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
