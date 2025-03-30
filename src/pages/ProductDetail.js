import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductById(id);
                setProduct(data);
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }
        try {
            await addToCart(product);
            alert('Product added to cart successfully!');
        } catch (error) {
            alert(error.response?.data || 'Failed to add product to cart');
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;
    if (!product) return <div className="container">Product not found</div>;

    const displayPrice = product.sale
        ? product.price * (1 - product.sale.discountPercent / 100)
        : product.price;

    return (
        <div className="container">
            <div className="product-detail">
                <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-info">
                    <h1>{product.name}</h1>
                    <p className="description">{product.description}</p>
                    <p className="manufacturer">Manufacturer: {product.manufacturer}</p>
                    <div className="price-container">
                        {product.sale && (
                            <span className="original-price">${product.price.toFixed(2)}</span>
                        )}
                        <p className="price">${displayPrice.toFixed(2)}</p>
                        {product.sale && (
                            <span className="discount-badge">-{product.sale.discountPercent}%</span>
                        )}
                    </div>
                    <p className="stock">Stock: {product.stockQuantity}</p>
                    <p className="sold">Sold: {product.soldQuantity}</p>
                    <p className="status">Status: {product.status}</p>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.status !== 'Available'}
                    >
                        {product.status === 'Available' ? 'Add to Cart' : product.status}
                    </button>
                </div>
                {product.createdBy && (
                    <div className="product-meta">
                        <p>Created by: {product.createdBy.firstName} {product.createdBy.lastName}</p>
                        {product.updatedBy && (
                            <p>Last updated by: {product.updatedBy.firstName} {product.updatedBy.lastName}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
