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

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await getProductById(id);
            setProduct(data);
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
            await updateProduct(id, product);
            alert('Product updated successfully!');
            navigate('/products');
        } catch (err) {
            setError('Failed to update product');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stockQuantity'
                ? parseFloat(value)
                : value
        }));
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
                    <label>Image URL:</label>
                    <input
                        type="text"
                        name="imageUrl"
                        value={product.imageUrl}
                        onChange={handleChange}
                        required
                    />
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
                    <select name="status" value={product.status} onChange={handleChange}>
                        <option value="Available">Available</option>
                        <option value="OutOfStock">Out of Stock</option>
                        <option value="Discontinued">Discontinued</option>
                    </select>
                </div>

                <div className="button-group">
                    <button type="submit">Update Product</button>
                    <button type="button" onClick={() => navigate('/products')}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
