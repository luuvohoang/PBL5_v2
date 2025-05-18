import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails, updateProductItems } from '../services/api';
import '../styles/ProductItemManagement.css';

const ProductItemManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productDetails, setProductDetails] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [newSerialNumber, setNewSerialNumber] = useState('');

    const loadProductAndItems = useCallback(async () => {
        try {
            const details = await getProductDetails(id);
            setProductDetails(details);
            setItems(details.items || []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProductAndItems();
    }, [loadProductAndItems]);

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;

        try {
            await updateProductItems(id, {
                addedSerials: [],
                removedSerials: [],
                updatedItems: [editingItem]
            });
            setEditingItem(null);
            loadProductAndItems();
            alert('Item updated successfully');
        } catch (err) {
            alert('Failed to update item');
            console.error(err);
        }
    };

    const handleDeleteItem = async (serialNumber) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await updateProductItems(id, {
                addedSerials: [],
                removedSerials: [serialNumber],
                updatedItems: []
            });

            if (response.productDeleted) {
                alert('Product has been removed as it has no items left');
                navigate('/ProductManagement');
                return;
            }

            loadProductAndItems();
            alert('Item deleted successfully');
        } catch (err) {
            alert('Failed to delete item');
            console.error(err);
        }
    };

    const handleAddItem = async () => {
        if (!newSerialNumber.trim()) {
            alert('Please enter a serial number');
            return;
        }

        try {
            await updateProductItems(id, {
                addedSerials: [newSerialNumber],
                removedSerials: [],
                updatedItems: []
            });
            setNewSerialNumber('');
            loadProductAndItems();
            alert('Item added successfully');
        } catch (err) {
            alert('Failed to add item');
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!productDetails) return <div>Product not found</div>;

    return (
        <div className="product-items-container">
            <div className="product-header">
                <h2>Item Management for {productDetails.name}</h2>
                <div className="product-summary">
                    <p>Total Items: {items.length}</p>
                    <p>In Stock: {items.filter(i => i.status === 'in_stock').length}</p>
                </div>
            </div>

            <div className="add-item-section">
                <h3>Add New Item</h3>
                <div className="add-item-form">
                    <input
                        type="text"
                        value={newSerialNumber}
                        onChange={(e) => setNewSerialNumber(e.target.value)}
                        placeholder="Enter serial number"
                    />
                    <button onClick={handleAddItem}>Add Item</button>
                </div>
            </div>

            <div className="items-list">
                <h3>Items List</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Status</th>
                            <th>Manufacture Date</th>
                            <th>Purchase Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.itemId}>
                                {editingItem?.itemId === item.itemId ? (
                                    <>
                                        <td>
                                            <input
                                                type="text"
                                                value={editingItem.serialNumber}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    serialNumber: e.target.value
                                                })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={editingItem.status}
                                                onChange={(e) => setEditingItem({
                                                    ...editingItem,
                                                    status: e.target.value
                                                })}
                                            >
                                                <option value="in_stock">In Stock</option>
                                                <option value="sold">Sold</option>
                                                <option value="defective">Defective</option>
                                            </select>
                                        </td>
                                        <td>{new Date(item.manufactureDate).toLocaleDateString()}</td>
                                        <td>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Not sold'}</td>
                                        <td>
                                            <button onClick={handleUpdateItem}>Save</button>
                                            <button onClick={handleCancelEdit}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{item.serialNumber}</td>
                                        <td>{item.status}</td>
                                        <td>{new Date(item.manufactureDate).toLocaleDateString()}</td>
                                        <td>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Not sold'}</td>
                                        <td>
                                            <button onClick={() => handleEditItem(item)}>Edit</button>
                                            <button onClick={() => handleDeleteItem(item.serialNumber)}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="navigation-buttons">
                <button onClick={() => navigate(`/products/edit/${id}`)}>
                    Back to Product Edit
                </button>
                <button onClick={() => navigate('/ProductManagement')}>
                    Back to Product List
                </button>
            </div>
        </div>
    );
};

export default ProductItemManagement;
