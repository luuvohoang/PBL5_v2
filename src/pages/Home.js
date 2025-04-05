import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const products = await getProducts();
                // Get unique categories from products
                const uniqueCategories = [...new Set(products.map(product => product.category))];
                setCategories(uniqueCategories);
            } catch (err) {
                setError('Failed to load categories');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
        <div className="container">
            <h1>Welcome to PC Parts Store</h1>
            <div className="grid">
                {categories.map((category) => (
                    <div key={category} className="card">
                        <h2>{category}</h2>
                        <Link to={`/products?category=${category.toLowerCase()}`}>
                            Shop {category}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
