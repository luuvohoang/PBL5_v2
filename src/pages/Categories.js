import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const Categories = () => {
    const fixedCategories = ['cpu', 'gpu', 'motherboard', 'ram'];
    /* eslint-disable-next-line */
    const [loading, setLoading] = useState(false);
    /* eslint-disable-next-line */
    const [error, setError] = useState(null);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container">{error}</div>;

    return (
        <div className="categories-container">
            <h1>Categories</h1>
            <div className="grid">
                {fixedCategories.map((category) => (
                    <div key={category} className="card category-card">
                        <h2>{category.toUpperCase()}</h2>
                        <span>View Products →</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;
