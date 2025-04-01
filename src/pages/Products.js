import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
<<<<<<< HEAD
import DeleteConfirmation from '../components/DeleteConfirmation';
=======
import PriceRangeFilter from '../components/PriceRangeFilter';
>>>>>>> kiet
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
<<<<<<< HEAD
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const user = JSON.parse(localStorage.getItem('user')); // Add this line
=======
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category');
    const userRole = localStorage.getItem('userRole');

    const handlePriceFilter = (range) => {
        if (!range) {
            setFilteredProducts(products);
            return;
        }
        const filtered = products.filter(product => {
            const price = parseFloat(product.price);
            return price >= range.min && price <= range.max;
        });
        setFilteredProducts(filtered);
    };

    const handleSort = (sortType) => {
        const sorted = [...filteredProducts];
        switch (sortType) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }
        setFilteredProducts(sorted);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
                setFilteredProducts(filteredProducts.filter(p => p.id !== productId));
            } catch (err) {
                setError('Failed to delete product');
                console.error('Error:', err);
            }
        }
    };
>>>>>>> kiet

    useEffect(() => {
        loadProducts();
    }, [category]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts(category);
            setProducts(data);
<<<<<<< HEAD
=======
            setFilteredProducts(data);
>>>>>>> kiet
        } catch (err) {
            setError('Failed to load products');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
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

=======
>>>>>>> kiet
    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container">{error}</div>;

    return (
<<<<<<< HEAD
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
=======
        <div className="products-layout">
            <aside className="products-sidebar">
                <PriceRangeFilter onFilterChange={handlePriceFilter} />
            </aside>
            
            <main className="products-main">
                <div className="products-header">
                    <h1>{category ? `${category.toUpperCase()}` : 'All Products'}</h1>
                    <div className="products-meta">
                        <span>{filteredProducts.length} products</span>
                        <select onChange={(e) => handleSort(e.target.value)} className="sort-select">
                            <option value="">Sort by</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                            <option value="name-desc">Name: Z-A</option>
                        </select>
                    </div>
                </div>
                
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-wrapper">
                            <ProductCard product={product} />
                            {(['Admin', 'Manager', 'Staff'].includes(userRole)) && (
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDelete(product.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <aside className="products-banner">
                {/* Add your banner content here */}
            </aside>
>>>>>>> kiet
        </div>
    );
};

export default Products;
