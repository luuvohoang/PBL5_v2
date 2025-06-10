import React, { useState, useEffect } from 'react';
import { getAllPendingExchanges, processExchangeRequest, getAvailableItems } from '../services/api';
import '../styles/ExchangeManagement.css';
import { useNavigate } from 'react-router-dom';

const ExchangeManagement = () => {
    const [exchanges, setExchanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExchange, setSelectedExchange] = useState(null);
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedNewItemId, setSelectedNewItemId] = useState('');
    const [processingNote, setProcessingNote] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadExchanges();
    }, []);

    const loadExchanges = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !['Admin', 'Manager'].includes(user.role)) {
                navigate('/login');
                return;
            }

            setLoading(true);
            const data = await getAllPendingExchanges();
            if (Array.isArray(data)) {
                setExchanges(data);
            } else {
                console.warn('Received unexpected data format:', data);
                setExchanges([]);
            }
        } catch (error) {
            console.error('Error loading exchanges:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectExchange = async (exchange) => {
        setSelectedExchange(exchange);
        setProcessingNote('');
        if (exchange.oldItem) {
            try {
                const items = await getAvailableItems(exchange.oldItem.productId);
                setAvailableItems(items);
            } catch (error) {
                console.error('Error loading available items:', error);
                setAvailableItems([]);
            }
        }
    };

    const handleProcessExchange = async (approved) => {
        try {
            if (approved && !selectedNewItemId) {
                alert('Please select a replacement item');
                return;
            }

            console.log('Processing exchange:', {
                exchangeId: selectedExchange.exchangeId,
                approved,
                newItemId: selectedNewItemId,
                notes: processingNote
            });

            await processExchangeRequest(selectedExchange.exchangeId, {
                isApproved: approved,
                newItemId: approved ? parseInt(selectedNewItemId) : null,
                notes: processingNote || ''
            });

            alert(`Exchange request ${approved ? 'approved' : 'rejected'} successfully`);
            setSelectedExchange(null);
            setSelectedNewItemId('');
            setProcessingNote('');
            await loadExchanges();
        } catch (error) {
            alert('Error processing exchange request: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return <div className="loading">Loading exchange requests...</div>;
    }

    return (
        <div className="exchange-management">
            <h1>Exchange Requests Management</h1>

            <div className="exchange-container">
                <div className="exchanges-list">
                    <h2>Pending Requests</h2>
                    {exchanges.length === 0 ? (
                        <p>No pending exchange requests</p>
                    ) : (
                        exchanges.map(exchange => (
                            <div
                                key={exchange.exchangeId}  // Thay đổi từ id sang exchangeId
                                className={`exchange-item ${selectedExchange?.exchangeId === exchange.exchangeId ? 'selected' : ''}`}
                                onClick={() => handleSelectExchange(exchange)}
                            >
                                <p><strong>Request ID:</strong> #{exchange.exchangeId}</p>
                                <p><strong>Product:</strong> {exchange.oldItem?.product?.name || 'Unknown Product'}</p>
                                <p><strong>Serial Number:</strong> {exchange.oldItem?.serialNumber}</p>
                                <p><strong>Request Date:</strong> {new Date(exchange.requestDate).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                {selectedExchange && (
                    <div className="exchange-details">
                        <h2>Request Details</h2>
                        <div className="details-content">
                            <div className="item-details">
                                <h3>Original Item</h3>
                                <p><strong>Product:</strong> {selectedExchange.oldItem?.product?.name}</p>
                                <p><strong>Serial Number:</strong> {selectedExchange.oldItem?.serialNumber}</p>
                                <p><strong>Order ID:</strong> #{selectedExchange.orderDetailId}</p>
                            </div>

                            <div className="reason-section">
                                <h3>Exchange Reason</h3>
                                <p>{selectedExchange.reasonForExchange}</p>
                            </div>

                            <div className="processing-section">
                                <h3>Process Request</h3>
                                {availableItems.length > 0 && (
                                    <div className="replacement-select">
                                        <label>Select Replacement Item:</label>
                                        <select
                                            value={selectedNewItemId}
                                            onChange={(e) => setSelectedNewItemId(e.target.value)}
                                        >
                                            <option value="">Select an item...</option>
                                            {availableItems.map(item => (
                                                <option key={item.itemId} value={item.itemId}>
                                                    {item.serialNumber}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="notes-section">
                                    <label>Processing Notes:</label>
                                    <textarea
                                        value={processingNote}
                                        onChange={(e) => setProcessingNote(e.target.value)}
                                        placeholder="Add processing notes..."
                                    />
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleProcessExchange(true)}
                                    >
                                        Approve Exchange
                                    </button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleProcessExchange(false)}
                                    >
                                        Reject Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExchangeManagement;
