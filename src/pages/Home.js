import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import '../styles/Home.css';

const Home = () => {
    const [products, setProducts] = useState({
        CPU: [],
        GPU: [],
        Motherboard: [],
        RAM: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                const allProducts = response.items;

                // Group products by category
                const grouped = allProducts.reduce((acc, product) => {
                    if (acc[product.category]) {
                        if (acc[product.category].length < 10) {
                            acc[product.category].push(product);
                        }
                    }
                    return acc;
                }, {
                    CPU: [],
                    GPU: [],
                    Motherboard: [],
                    RAM: []
                });

                setProducts(grouped);
            } catch (err) {
                setError('Failed to load products');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to PC Parts Store</h1>
                <p>Find the best computer parts for your build</p>
            </div>

            {Object.entries(products).map(([category, items]) => (
                <section key={category} className="category-section">
                    <div className="category-header">
                        <h2>{category}</h2>
                        <Link to={`/products?category=${category.toLowerCase()}`} className="view-all-button">
                            View All {category} Products
                        </Link>
                    </div>
                    <div className="products-grid">
                        {items.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`}>
                                    <img src={product.imageUrl} alt={product.name} />
                                    <h3>{product.name}</h3>
                                    <p className="product-price">
                                        ${product.sale
                                            ? (product.price * (1 - product.sale.discountPercent / 100)).toFixed(2)
                                            : product.price.toFixed(2)}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Home;
