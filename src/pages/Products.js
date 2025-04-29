import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, searchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q');
    const category = searchParams.get('category');
    const [sortType, setSortType] = useState('');
    const [selectedManufacturer, setSelectedManufacturer] = useState('');
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        loadProducts();
        // Reset manufacturer filter when category changes
        setSelectedManufacturer('');
    }, [searchQuery, category, currentPage]);

    useEffect(() => {
        // Extract unique manufacturers from products
        if (products.length > 0) {
            const uniqueManufacturers = [...new Set(products.map(p => p.manufacturer))];
            setManufacturers(uniqueManufacturers);
        }
    }, [products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            let data;

            if (searchQuery) {
                data = await searchProducts(searchQuery);
            } else {
                data = await getProducts(category, currentPage);
            }

            // Thêm kiểm tra data
            if (!data) {
                setProducts([]);
                setError('No products found');
                return;
            }

            setProducts(data.items);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load products');
            console.error('Error:', err);
            setProducts([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const getSortedProducts = () => {
        if (!products) return [];

        let filteredProducts = [...products];

        // Filter by manufacturer if selected
        if (selectedManufacturer) {
            filteredProducts = filteredProducts.filter(
                product => product.manufacturer === selectedManufacturer
            );
        }

        // Sort products
        if (sortType) {
            filteredProducts.sort((a, b) => {
                switch (sortType) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    default:
                        return 0;
                }
            });
        }

        return filteredProducts;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="container">Loading...</div>;

    const sortedProducts = getSortedProducts();

    return (
        <div className="products-container">
            <div className="products-header">
                {searchQuery ? (
                    <>
                        <h1>Search Results for "{searchQuery}"</h1>
                        <div className="search-summary">
                            Found {sortedProducts.length} product(s)
                        </div>
                    </>
                ) : (
                    <h1>{category ? `${category.toUpperCase()}` : 'All Products'}</h1>
                )}

                {sortedProducts.length > 0 && (
                    <div className="products-meta">
                        <div className="filters-container">
                            <div className="manufacturer-filter">
                                <label>Manufacturer:</label>
                                <select
                                    value={selectedManufacturer}
                                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                                >
                                    <option value="">All Manufacturers</option>
                                    {manufacturers.map((manufacturer) => (
                                        <option key={manufacturer} value={manufacturer}>
                                            {manufacturer}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sort-container">
                                <label>Sort by:</label>
                                <select
                                    value={sortType}
                                    onChange={(e) => setSortType(e.target.value)}
                                >
                                    <option value="">Default</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error ? (
                <div className="error-message">{error}</div>
            ) : sortedProducts.length === 0 ? (
                <div className="no-results">
                    No products found {searchQuery ? `for your search "${searchQuery}"` : ''}
                </div>
            ) : (
                <div className="products-grid">
                    {sortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default Products;
