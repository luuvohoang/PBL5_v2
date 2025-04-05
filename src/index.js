import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Set public URL for assets
window.PUBLIC_URL = process.env.PUBLIC_URL || '';
window.IMAGES_PATH = `${window.PUBLIC_URL}/assets/images`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
