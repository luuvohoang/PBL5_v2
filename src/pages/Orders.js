import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import '../styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const data = await getUserOrders(user.id);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="orders-page">
            <h1>Order History</h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.id}</h3>
                                <span className={`status ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-details">
                                <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                <p>Total: ${order.totalAmount.toFixed(2)}</p>
                                <p>Shipping Address: {order.shippingAddress}</p>
                                <p>Province: {order.province}</p>
                                <p>District: {order.district}</p>
                                <p>Ward: {order.ward}</p>
                                <p>Shipping Method: {order.shippingMethod}</p>
                                <p>Shipping Fee: ${(order.shippingFee).toFixed(2)}</p>
                                <p>Subtotal: ${order.subTotal.toFixed(2)}</p>
                                <p>Total Amount: ${order.totalAmount.toFixed(2)}</p>
                                <p>Payment Method: {order.paymentMethod}</p>
                            </div>
                            <div className="order-items">
                                {order.orderDetails.map(item => (
                                    <div key={item.id} className="order-item">
                                        <img src={`./assets/${item.product.imageUrl}`} alt={item.product.name} />
                                        <div className="item-info">
                                            <p>{item.product.name}</p>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ${item.unitPrice.toFixed(2)}</p>
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
