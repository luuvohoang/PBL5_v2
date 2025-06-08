import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [categories] = useState(['CPU', 'GPU', 'Motherboard', 'RAM']);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategoryChange = async (category) => {
        try {
            setSelectedCategory(category);
            const response = await getProducts({
                category: category,
                page: 1,
                pageSize: 4
            });
            
            if (response?.items) {
                const filtered = response.items
                    .filter(item => item.id !== parseInt(id))
                    .slice(0, 4);
                setRelatedProducts(filtered);
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
            setRelatedProducts([]);
        }
    };

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            try {
                setLoading(true);
                const data = await getProductById(id);
                
                if (!data) {
                    setError('Product not found');
                    return;
                }

                setProduct(data);
                setSelectedCategory(data.category);
                
                if (data.category) {
                    await handleCategoryChange(data.category);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductAndRelated();
        }
    }, [id]);

    const handleQuantityChange = (value) => {
        console.log('Current quantity:', quantity);
        console.log('Stock quantity:', product?.stockQuantity);
        const newQuantity = quantity + value;
        
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }
        try {
            console.log('Adding to cart:', {
                productId: product.id,
                quantity: quantity,
                stockQuantity: product.stockQuantity
            });

            const productWithQuantity = {
                ...product,
                quantity: quantity
            };
            await addToCart(productWithQuantity);
            alert('Product added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.message || 'Failed to add product to cart');
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            alert('Please login to continue');
            navigate('/login');
            return;
        }
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">Error: {error}</div>;
    if (!product) return <div className="container">Product not found</div>;

    // Add debug log for product data
    console.log('Current product state:', product);

    const displayPrice = product.sale
        ? product.price * (1 - product.sale.discountPercent / 100)
        : product.price;

    return (
        <div className="container">
            {/* Main product section */}
            <div className="product-detail">
                <div className="product-image">
                    <img 
                        src={product.imageUrl ? `/assets/${product.imageUrl}` : '/assets/images/default.jpg'}
                        alt={product.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/default.jpg';
                        }}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '600px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                        loading="lazy"
                    />
                </div>
                
                <div className="product-info">
                    <h1>{product.name}</h1>
                    <div className="product-meta">
                        <span className="status">Status: {product.status}</span>
                        <span className="separator">|</span>
                        <span className="manufacturer">Brand: {product.manufacturer}</span>
                    </div>
                    <div className="price-container">
                        {product.sale && (
                            <span className="original-price">${product.price.toFixed(2)}</span>
                        )}
                        <p className="price">${displayPrice.toFixed(2)}</p>
                        {product.sale && (
                            <span className="discount-badge">-{product.sale.discountPercent}%</span>
                        )}
                    </div>
                    <div className="quantity-selector">
                        <span className="quantity-label">Quantity:</span>
                        <div className="quantity-controls">
                            <button 
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.stockQuantity}
                            >
                                +
                            </button>
                        </div>
                        <span className="stock-info">({product.stockQuantity} available)</span>
                    </div>
                    <div className="product-actions">
                        <button 
                            className="add-to-cart"
                            onClick={handleAddToCart}
                            disabled={product.status !== 'Available'}
                        >
                            Add to Cart
                        </button>
                        <button 
                            className="buy-now"
                            onClick={handleBuyNow}
                            disabled={product.status !== 'Available'}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Product details section */}
            <div className="product-details-section">
                <h2>Product Description</h2>
                <p>{product.description}</p>
                <h3>Warranty</h3>
                <p>12 months warranty</p>
            </div>

            {/* Category filter section */}
            <div className="category-filter">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Related products section */}
            <div className="related-products">
                <h2>{selectedCategory ? `${selectedCategory} Products` : 'Related Products'}</h2>
                <div className="related-products-grid">
                    {relatedProducts.length > 0 ? (
                        relatedProducts.map(relatedProduct => (
                            <div 
                                key={relatedProduct.id} 
                                className="related-product-card" 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    navigate(`/products/${relatedProduct.id}`);
                                }}
                            >
                                <img 
                                    src={`/assets/${relatedProduct.imageUrl}`} 
                                    alt={relatedProduct.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/images/default.jpg';
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'contain',
                                        background: '#fff',
                                        padding: '10px'
                                    }}
                                    loading="lazy"
                                />
                                <h3>{relatedProduct.name}</h3>
                                <p>${relatedProduct.price.toFixed(2)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-products-message">No products found in this category</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
