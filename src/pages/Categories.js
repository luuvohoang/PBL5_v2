import React, { useState } from 'react';

const Categories = () => {
    const fixedCategories = ['cpu', 'gpu', 'motherboard', 'ram'];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
        <div className="container">
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
