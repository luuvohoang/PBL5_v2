import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import DeleteConfirmation from '../components/DeleteConfirmation';
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const user = JSON.parse(localStorage.getItem('user')); // Add this line

    useEffect(() => {
        loadProducts();
    }, [category]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts(category);
            setProducts(data);
        } catch (err) {
            setError('Failed to load products');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteProduct(selectedProduct.id);
            setDeleteDialogOpen(false);
            setSelectedProduct(null);
            // Reload products after deletion
            await loadProducts();
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    const handleProductDelete = (deletedProductId) => {
        setProducts(prevProducts =>
            prevProducts.filter(product => product.id !== deletedProductId)
        );
    };

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
        <div className="products-container">
            <h1 className="products-title">
                {category ? `${category.toUpperCase()} Products` : 'All Products'}
            </h1>
            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        <ProductCard
                            product={product}
                            onDelete={handleProductDelete}
                        />
                    </div>
                ))}
            </div>
            <DeleteConfirmation
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={selectedProduct?.name || ''}
            />
        </div>
    );
};

export default Products;
