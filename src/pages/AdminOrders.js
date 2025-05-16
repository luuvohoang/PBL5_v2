import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/AdminOrders.css';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            if (!user || user.role !== 'Admin') {
                console.log('Insufficient permissions - Admin access required');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            fetchOrders();
        } catch (error) {
            console.error('Error checking authentication:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            if (!data) {
                throw new Error('No data received');
            }
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.message.includes('User not authenticated')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus, statusNote);

            if (!updatedOrder) {
                throw new Error('Failed to update order status');
            }

            setOrders(prevOrders => prevOrders.map(order =>
                order.id === orderId
                    ? {
                        ...order,
                        status: updatedOrder.status,
                        statusNote: updatedOrder.statusNote,
                        updatedAt: updatedOrder.updatedAt
                    }
                    : order
            ));

            setStatusNote('');
            alert(updatedOrder.message || 'Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="admin-orders-container">
            <h1>Order Management</h1>

            <div className="order-filters">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                >
                    <option value="all">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="orders-grid">
                <div className="orders-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} onClick={() => handleViewDetails(order)}>
                                    <td>{order.id}</td>
                                    <td>{order.userName || order.userId}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>${order.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipping">Shipping</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedOrder && (
                    <div className="order-details">
                        <h2>Order Details #{selectedOrder.id}</h2>
                        <div className="details-section">
                            <h3>Customer Information</h3>
                            <p><strong>Name:</strong> {selectedOrder.userName || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedOrder.userEmail || 'N/A'}</p>
                            <p><strong>Phone:</strong> {selectedOrder.phoneNumber || 'N/A'}</p>
                        </div>

                        <div className="details-section">
                            <h3>Shipping Information</h3>
                            <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
                        </div>

                        <div className="details-section">
                            <h3>Order Items</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.orderItems?.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div>
                                                    <p>{item.productName}</p>
                                                    <small>SN: {item.serialNumber}</small>
                                                    {item.warranty && (
                                                        <div className="warranty-details">
                                                            <small className={`warranty-status ${item.warranty.status}`}>
                                                                Warranty: {item.warranty.status}
                                                            </small>
                                                            <br />
                                                            <small>
                                                                {new Date(item.warranty.startDate).toLocaleDateString()}
                                                                -
                                                                {new Date(item.warranty.endDate).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>${item.price.toFixed(2)}</td>
                                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="status-update-section">
                            <h3>Update Status</h3>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note about this status update..."
                                rows="3"
                            />
                            <div className="status-actions">
                                <button onClick={() => handleStatusUpdate(selectedOrder.id, 'Processing')}>
                                    Process Order
                                </button>
                                <button onClick={() => handleStatusUpdate(selectedOrder.id, 'Shipping')}>
                                    Mark as Shipping
                                </button>
                                <button onClick={() => handleStatusUpdate(selectedOrder.id, 'Delivered')}>
                                    Mark as Delivered
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
