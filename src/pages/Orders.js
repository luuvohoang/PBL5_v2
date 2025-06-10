import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, createExchangeRequest, cancelOrder } from '../services/api';
import '../styles/Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [exchangeReason, setExchangeReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        let isMounted = true;

        const loadOrders = async () => {
            try {
                if (!user?.id) return;

                setLoading(true);
                const response = await getUserOrders(user.id);
                console.log('Orders response:', response); // Add this log

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

    const handleExchangeRequest = (item, order) => {
        console.log('Selected item:', item); // For debugging
        setSelectedItem({
            ...item,
            orderDetailId: item.id, // orderDetailId chính là item.id
            itemId: item.itemId, // Lấy itemId từ item
            productName: item.productName,
            serialNumber: item.serialNumber,
            orderDate: order.orderDate
        });
        setShowExchangeModal(true);
    };

    const handleSubmitExchange = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            console.log('Selected item for exchange:', selectedItem); // For debugging
            const exchangeData = {
                OrderDetailId: selectedItem.orderDetailId,
                OldItemId: selectedItem.itemId, // Sử dụng itemId thay vì id
                ReasonForExchange: exchangeReason
            };
            console.log('Submitting exchange request:', exchangeData); // For debugging
            await createExchangeRequest(exchangeData);
            alert('Exchange request submitted successfully');
            setShowExchangeModal(false);
            setExchangeReason('');
            // Refresh orders
            const updatedOrders = await getUserOrders(user.id);
            setOrders(updatedOrders);
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.ReasonForExchange?.[0]
                || error.response?.data?.message
                || error.message
                || 'Failed to submit request';
            alert('Failed to submit exchange request: ' + errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await cancelOrder(orderId);
            // Refresh orders list after cancellation
            const updatedOrders = await getUserOrders(user.id);
            setOrders(updatedOrders);
            alert('Order cancelled successfully');
        } catch (error) {
            alert(error.message);
        }
    };

    const ExchangeModal = () => (
        <div className={`modal ${showExchangeModal ? 'show' : ''}`}>
            <div className="modal-content">
                <h2>Request Exchange</h2>
                <div className="item-details">
                    <p><strong>Product:</strong> {selectedItem?.productName}</p>
                    <p><strong>Serial Number:</strong> {selectedItem?.serialNumber}</p>
                    <p><strong>Order Date:</strong> {new Date(selectedItem?.orderDate).toLocaleDateString()}</p>
                </div>
                <form onSubmit={handleSubmitExchange}>
                    <div className="form-group">
                        <label>Reason for Exchange:</label>
                        <textarea
                            value={exchangeReason}
                            onChange={(e) => setExchangeReason(e.target.value)}
                            required
                            rows="4"
                            placeholder="Please describe why you want to exchange this item..."
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={() => {
                                setShowExchangeModal(false);
                                setExchangeReason('');
                            }}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="submit-btn"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

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
                            <div className="order-actions">
                                {order.status === 'Pending' && (
                                    <button
                                        className="cancel-order-btn"
                                        onClick={() => handleCancelOrder(order.id)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
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
                                {(order?.orderDetails || order?.items || []).map((item, index) => ( // Try both orderDetails and items
                                    <div key={item?.id || index} className="order-item">
                                        <div className="item-info">
                                            <p>Product: {item?.productName || 'Unknown Product'}</p>
                                            <p>Serial Number: {item?.serialNumber || 'N/A'}</p>
                                            <p>Price: ${Number(item?.unitPrice || 0).toFixed(2)}</p>
                                            <p>Subtotal: ${Number(item?.subtotal || 0).toFixed(2)}</p>
                                            {item?.warranty && (
                                                <div className="warranty-info">
                                                    <p>
                                                        <strong>Warranty Status:</strong>
                                                        <span data-status={item.warranty.status.toLowerCase()}>
                                                            {item.warranty.status}
                                                        </span>
                                                    </p>
                                                    <p><strong>Start Date:</strong> {new Date(item.warranty.startDate).toLocaleDateString()}</p>
                                                    <p><strong>End Date:</strong> {new Date(item.warranty.endDate).toLocaleDateString()}</p>
                                                    <p><strong>Duration:</strong> {item.warranty.duration} months</p>
                                                </div>
                                            )}
                                            <button
                                                className="exchange-btn"
                                                onClick={() => handleExchangeRequest(item, order)}
                                                disabled={
                                                    order.status !== 'Delivered' ||
                                                    !item.warranty?.status === 'active'
                                                }
                                            >
                                                Request Exchange
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ExchangeModal />
        </div>
    );
};

export default Orders;
