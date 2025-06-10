import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, addProduct, deleteProduct } from '../services/api';
import '../styles/ProductManagement.css';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories] = useState(['CPU', 'GPU', 'Motherboard', 'RAM']);
    const [currentCategory, setCurrentCategory] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        imageFile: null,
        manufacturer: '',
        stockQuantity: '',
        status: 'Available',
        serialNumbersText: '',
        warrantyDuration: 0
    });
    const [isAdding, setIsAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [initialLoad, setInitialLoad] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortType, setSortType] = useState('name-asc');
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getProducts({
                category: currentCategory,
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortType: sortType,
                searchTerm: searchTerm
            });
            setProducts(response.items || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
            setInitialLoad(false);
        }
    }, [currentCategory, currentPage, sortType, searchTerm]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        setCurrentPage(1);
    }, [currentCategory, sortType, searchTerm]);

    const handleInputChange = (e) => {
        setNewProduct({
            ...newProduct,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                alert('File is too large. Please choose an image under 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // For preview only
                setNewProduct(prev => ({
                    ...prev,
                    imageFile: file // Store the actual file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSerialNumbersChange = (e) => {
        const text = e.target.value;
        setNewProduct(prev => ({
            ...prev,
            serialNumbersText: text
        }));
    };

    const validateSerialNumbers = (text, stockQuantity) => {
        if (!text.trim()) return { isValid: false, message: 'Serial numbers cannot be empty' };

        const serialNumbers = text.trim().split('\n').filter(line => line.trim());

        if (serialNumbers.length !== parseInt(stockQuantity)) {
            return {
                isValid: false,
                message: `Number of serial numbers (${serialNumbers.length}) does not match stock quantity (${stockQuantity})`
            };
        }

        const hasDuplicates = new Set(serialNumbers).size !== serialNumbers.length;
        if (hasDuplicates) {
            return { isValid: false, message: 'Duplicate serial numbers found' };
        }

        return { isValid: true, serialNumbers };
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        // Validate serial numbers
        const validation = validateSerialNumbers(newProduct.serialNumbersText, newProduct.stockQuantity);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        try {
            const productData = {
                name: newProduct.name,
                price: Number(newProduct.price),
                description: newProduct.description,
                category: newProduct.category,
                manufacturer: newProduct.manufacturer,
                status: newProduct.status,
                imageFile: newProduct.imageFile,
                warrantyDuration: Number(newProduct.warrantyDuration),
                serialNumbers: validation.serialNumbers
            };

            await addProduct(productData);

            // Reset form and refresh list
            setNewProduct({
                name: '',
                price: '',
                description: '',
                category: '',
                imageFile: null,
                manufacturer: '',
                status: 'Available',
                serialNumbersText: '',
                warrantyDuration: 0
            });
            setSelectedImage(null);
            setIsAdding(false);
            fetchProducts();
            alert('Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert(`Failed to add product: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts(); // Direct call instead of handleRefresh
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (event) => {
        setSortType(event.target.value);
        setCurrentPage(1);
    };

    const sortProducts = (products, sortType) => {
        const sorted = [...products];
        switch (sortType) {
            case 'name-asc':
                return sorted.sort((a, b) => 
                    (a.name?.toLowerCase() || '').localeCompare(b.name?.toLowerCase() || ''));
            case 'name-desc':
                return sorted.sort((a, b) => 
                    (b.name?.toLowerCase() || '').localeCompare(a.name?.toLowerCase() || ''));
            case 'price-asc':
                return sorted.sort((a, b) => 
                    (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
            case 'price-desc':
                return sorted.sort((a, b) => 
                    (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            default:
                return sorted;
        }
    };

    const ProductItem = React.memo(({ product, onDelete }) => {
        const [imageError, setImageError] = useState(false);

        const imageUrl = imageError || !product.imageUrl ? 
            '/assets/images/default.jpg' : 
            `/assets/${product.imageUrl}`;

        return (
            <div className="product-item">
                <div className="image-container">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/default.jpg';
                            setImageError(true);
                        }}
                        loading="lazy"
                    />
                </div>
                <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>${product.price}</p>
                    <p>Category: {product.category}</p>
                    <p>Stock: {product.stockQuantity}</p>
                    <p>Status: {product.status}</p>
                    <div className="product-actions">
                        <Link to={`/products/edit/${product.id}`}>
                            <button className="edit-button">Edit</button>
                        </Link>
                        <button
                            className="delete-button"
                            onClick={() => onDelete(product.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    });

    const renderProducts = useMemo(() => {
        const sortedProducts = sortProducts(products, sortType);
        return sortedProducts.map((product) => (
            <ProductItem
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
            />
        ));
    }, [products, sortType, handleDeleteProduct]);

    if (initialLoad) {
        return <div className="loading-container"><LoadingSpinner /></div>;
    }

    return (
        <div className="product-management-container">
            <div className="product-management-header">
                <h1>Product Management</h1>
                <button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <button
                    className={currentCategory === '' ? 'active' : ''}
                    onClick={() => handleCategoryChange('')}
                >
                    All
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        className={currentCategory === category ? 'active' : ''}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="search-sort-container">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <select
                    value={sortType}
                    onChange={handleSortChange}
                    className="sort-select"
                >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                </select>
            </div>

            {isAdding && (
                <form onSubmit={handleAddProduct} className="add-product-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        name="manufacturer"
                        placeholder="Manufacturer"
                        value={newProduct.manufacturer}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="stockQuantity"
                        placeholder="Stock Quantity"
                        value={newProduct.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        required
                    />
                    <select
                        name="status"
                        value={newProduct.status}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Available">Available</option>
                        <option value="OutOfStock">Out of Stock</option>
                        <option value="Discontinued">Discontinued</option>
                    </select>
                    <div className="image-upload-container">
                        <label htmlFor="imageUpload" className="image-upload-label">
                            Choose Product Image
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                        />
                        {selectedImage && (
                            <div className="image-preview">
                                <img src={selectedImage} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="warranty-section">
                        <label>Warranty Duration (months):</label>
                        <input
                            type="number"
                            name="warrantyDuration"
                            value={newProduct.warrantyDuration}
                            onChange={handleInputChange}
                            min="0"
                        />
                    </div>

                    <div className="serial-numbers-section">
                        <label>Serial Numbers (one per line):</label>
                        <textarea
                            value={newProduct.serialNumbersText}
                            onChange={handleSerialNumbersChange}
                            placeholder={`Enter serial numbers (${newProduct.stockQuantity || 0} required)\nExample:\nRTX4080-1234ABCD\nRTX4080-5678EFGH`}
                            rows={10}
                            required
                        />
                        <small className="help-text">
                            Number of serial numbers must match stock quantity ({newProduct.stockQuantity || 0})
                        </small>
                    </div>

                    <button type="submit">Add Product</button>
                </form>
            )}

            {!initialLoad && (
                <div className="products-wrapper">
                    <div className="products-list">
                        {renderProducts}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="page-button"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="page-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="loading-indicator">
                    <LoadingSpinner />
                </div>
            )}

            {!isLoading && products.length === 0 && (
                <div className="no-products">
                    <p>No products found</p>
                </div>
            )}
        </div>
    );
};

export default React.memo(ProductManagement, (prevProps, nextProps) => {
    return true;
});
