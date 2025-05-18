import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../services/api';
import '../styles/EditProduct.css';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const validStatuses = ['Available', 'OutOfStock', 'Discontinued'];
    const displayStatuses = {
        'Available': 'Available',
        'OutOfStock': 'Out of Stock',
        'Discontinued': 'Discontinued'
    };

    useEffect(() => {
        loadProductAndItems();
    }, [loadProductAndItems]);

    const loadProductAndItems = async () => {
        try {
            const productData = await getProductById(id);
            setProduct(productData);
        } catch (err) {
            setError('Failed to load product');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!product.name || !product.description || !product.category || !product.manufacturer) {
                throw new Error('Please fill in all required fields');
            }

            const productData = {
                name: product.name.trim(),
                description: product.description.trim(),
                price: Number(product.price),
                category: product.category.toLowerCase(),
                manufacturer: product.manufacturer.trim(),
                stockQuantity: Number(product.stockQuantity),
                status: product.status || 'Available',
                warrantyDuration: Number(product.warrantyDuration || 0)
            };

            // Add image data if exists
            if (product.imageFile) {
                productData.imageFile = product.imageFile;
            } else if (product.imageUrl) {
                productData.imageUrl = product.imageUrl;
            }

            await updateProduct(id, productData);
            alert('Product updated successfully!');
            navigate('/ProductManagement');
        } catch (err) {
            console.error('Update failed:', err);
            alert(err.message || 'Failed to update product');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'status') {
            const dbStatus = Object.keys(displayStatuses).find(key =>
                displayStatuses[key] === value || key === value
            ) || 'Available';

            setProduct(prev => ({
                ...prev,
                status: dbStatus
            }));
            return;
        }

        setProduct(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stockQuantity'
                ? parseFloat(value)
                : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                alert('File is too large. Please choose an image under 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // For preview only
                setProduct(prev => ({
                    ...prev,
                    imageFile: file // Store the actual file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="edit-product-container">
            <h2>Edit Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        step="0.01"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Image:</label>
                    <div className="image-upload-container">
                        <label htmlFor="imageUpload" className="image-upload-label">
                            Change Product Image
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <div className="image-preview">
                            <img
                                src={selectedImage || `./assets/${product.imageUrl}`}
                                alt={product.name}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Category:</label>
                    <select name="category" value={product.category} onChange={handleChange}>
                        <option value="cpu">CPU</option>
                        <option value="gpu">GPU</option>
                        <option value="motherboard">Motherboard</option>
                        <option value="ram">RAM</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Stock Quantity:</label>
                    <input
                        type="number"
                        name="stockQuantity"
                        value={product.stockQuantity}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Manufacturer:</label>
                    <input
                        type="text"
                        name="manufacturer"
                        value={product.manufacturer}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Status:</label>
                    <select
                        name="status"
                        value={displayStatuses[product.status] || product.status}
                        onChange={handleChange}
                        required
                    >
                        {validStatuses.map(status => (
                            <option key={status} value={displayStatuses[status] || status}>
                                {displayStatuses[status] || status}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="button-group">
                    <button
                        type="submit"
                        className="update-product-button"
                    >
                        Update Product Only
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/products/${id}/items`)}
                        className="manage-items-button"
                    >
                        Manage Items
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/ProductManagement')}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
