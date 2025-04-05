import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, addProduct, deleteProduct } from '../services/api';
import '../styles/ProductManagement.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const fixedCategories = ['cpu', 'gpu', 'motherboard', 'ram'];
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        imageFile: null,
        manufacturer: '',
        stockQuantity: '',
        status: 'Available'
    });
    const [isAdding, setIsAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

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

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                name: newProduct.name,
                price: Number(newProduct.price),
                description: newProduct.description,
                category: newProduct.category,
                manufacturer: newProduct.manufacturer,
                stockQuantity: Number(newProduct.stockQuantity),
                status: newProduct.status,
                imageFile: newProduct.imageFile,
                imageUrl: newProduct.imageFile ? `/images/${newProduct.imageFile.name}` : null
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
                stockQuantity: '',
                status: 'Available'
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
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="product-management-container">
            <div className="product-management-header">
                <h1>Product Management</h1>
                <button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add New Product'}
                </button>
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
                        {fixedCategories.map((category) => (
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
                    <button type="submit">Add Product</button>
                </form>
            )}

            <div className="products-list">
                {products && products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-item">
                            <img
                                src={`./assets/${product.imageUrl}`}
                                alt={product.name}
                            />
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
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products found</p>
                )}
            </div>
        </div>
    );
};

export default ProductManagement;
