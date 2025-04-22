import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="category-list">
            <h2>Categories</h2>
            <div className="grid">
                {categories.map(category => (
                    <Link
                        key={category.id}
                        to={`/products?category=${category.id}`}
                        className="category-card card"
                    >
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                        <span>View Products →</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
