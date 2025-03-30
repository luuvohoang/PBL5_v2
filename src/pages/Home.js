import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container">
            <h1>Welcome to PC Parts Store</h1>
            <div className="grid">
                <div className="card">
                    <h2>CPUs</h2>
                    <Link to="/products?category=cpu">Shop CPUs</Link>
                </div>
                <div className="card">
                    <h2>GPUs</h2>
                    <Link to="/products?category=gpu">Shop GPUs</Link>
                </div>
                <div className="card">
                    <h2>Motherboards</h2>
                    <Link to="/products?category=motherboard">Shop Motherboards</Link>
                </div>
                <div className="card">
                    <h2>RAM</h2>
                    <Link to="/products?category=ram">Shop RAM</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
