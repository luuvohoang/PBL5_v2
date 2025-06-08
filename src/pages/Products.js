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
    const category = searchParams.get('category'); // Get category from URL params
    const [sortType, setSortType] = useState('default');
    const [selectedManufacturer, setSelectedManufacturer] = useState('');
    const [manufacturers, setManufacturers] = useState([]);
    const [groupedProducts, setGroupedProducts] = useState({});
    const itemsPerPage = 10;
    const searchTerm = searchQuery || '';

    useEffect(() => {
        loadProducts();
        // Reset manufacturer filter when category changes
        setSelectedManufacturer('');
    }, [searchQuery, category, currentPage]); // Use category from URL params

    useEffect(() => {
        if (products.length > 0) {
            const uniqueManufacturers = [...new Set(products.map(p => p.manufacturer))];
            setManufacturers(uniqueManufacturers);
        }
    }, [products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            let data;

            if (searchQuery) {
                data = await searchProducts(searchQuery);
                setGroupedProducts(data.groupedItems || {});
            } else {
                data = await getProducts({ 
                    category: category, // Use category from URL params
                    page: currentPage,
                    pageSize: itemsPerPage,
                    sortType: sortType
                });
                setGroupedProducts({});
            }

            if (!data?.items?.length) {
                setError(`No products found ${category ? `in ${category}` : ''}`);
                setProducts([]);
                setTotalPages(0);
                return;
            }

            setProducts(data.items);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load products');
            console.error('Error:', err);
            setProducts([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const getSortedProducts = () => {
        if (!products) return [];

        let filteredProducts = [...products];

        if (selectedManufacturer) {
            filteredProducts = filteredProducts.filter(
                product => product.manufacturer === selectedManufacturer
            );
        }

        switch (sortType) {
            case 'price-asc':
                return filteredProducts.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return filteredProducts.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return filteredProducts;
        }
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
                <div className="header-content">
                    <h1>{category || 'All Products'}</h1>
                    {searchQuery && (
                        <div className="search-results">
                            <p>Found {sortedProducts.length} products for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
                <div className="filters-container">
                    {/* Manufacturer filter */}
                    <div className="manufacturer-filter">
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

                    {/* Sort filter */}
                    <div className="sort-container">
                        <select 
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            className="sort-select"
                        >
                            <option value="default">Sort by</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Active filters display */}
            {(selectedManufacturer || sortType !== 'default') && (
                <div className="active-filters">
                    {selectedManufacturer && (
                        <span className="filter-tag">
                            {selectedManufacturer}
                            <button onClick={() => setSelectedManufacturer('')}>×</button>
                        </span>
                    )}
                    {sortType !== 'default' && (
                        <span className="filter-tag">
                            {sortType.replace('-', ' ').toUpperCase()}
                            <button onClick={() => setSortType('default')}>×</button>
                        </span>
                    )}
                </div>
            )}

            {error ? (
                <div className="error-message">{error}</div>
            ) : searchQuery && Object.keys(groupedProducts).length > 0 ? (
                // Hiển thị kết quả theo nhóm khi có tìm kiếm
                <div className="search-results-grouped">
                    <h2>Kết quả tìm kiếm cho "{searchQuery}"</h2>
                    {Object.entries(groupedProducts).map(([category, products]) => (
                        <div key={category} className="category-group">
                            <h3>{category} ({products.length})</h3>
                            <div className="products-grid">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : sortedProducts.length === 0 ? (
                <div className="no-results">
                    {category 
                        ? `No products found in ${category}`
                        : 'Please select a category to view products'}
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
