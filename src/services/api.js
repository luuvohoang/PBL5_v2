import axios from 'axios';

axios.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.role) {
            config.headers['UserRole'] = user.role;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const API_URL = 'http://localhost:5000/api';  // Make sure this matches your backend URL

export const getProducts = async (params = {}) => {
    try {
        console.log('Fetching products with params:', params);
        const response = await axios.get(`${API_URL}/products`, {
            params: {
                category: params.category,
                page: params.page || 1,
                pageSize: params.pageSize || 8,
                sortType: params.sortType || 'name-asc',
                searchTerm: params.searchTerm || '',
                minPrice: params.minPrice,
                maxPrice: params.maxPrice
            }
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            items: [],
            totalPages: 0
        };
    }
};

export const getProduct = async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
};

export const getProductById = async (id) => {
    try {
        console.log('Fetching product with ID:', id);
        const response = await axios.get(`${API_URL}/products/${id}`);
        const productData = response.data;
        
        if (!productData) {
            throw new Error('Product not found');
        }

        // Log raw response data
        console.log('Raw API response:', response.data);

        // Return product with stockQuantity
        const product = {
            ...productData,
            stockQuantity: productData.stockQuantity
        };

        console.log('Processed product data:', product);
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
};

export const getProductDetails = async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}/details`);
    return response.data;
};

export const updateProductItems = async (id, updateData) => {
    try {
        // Log data being sent
        console.log('Sending update data:', updateData);

        const response = await axios.put(`${API_URL}/productitems/${id}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Update items error:', error.response?.data);
        throw error;
    }
};

export const testConnection = async () => {
    try {
        const response = await axios.get(`${API_URL}/products/test-connection`);
        console.log('Database connection test:', response.data);
        return response.data;
    } catch (error) {
        console.error('Connection test failed:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            username: userData.username,
            email: userData.email,
            password: userData.password
        });
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};

export const getCategoryProducts = async (categoryId) => {
    const response = await axios.get(`${API_URL}/categories/${categoryId}/products`);
    return response.data;
};

export const getSales = async () => {
    const response = await axios.get(`${API_URL}/sales`);
    return response.data;
};

export const getSale = async (id) => {
    const response = await axios.get(`${API_URL}/sales/${id}`);
    return response.data;
};

export const createSale = async (saleData) => {
    const response = await axios.post(`${API_URL}/sales`, saleData);
    return response.data;
};

export const updateSaleProducts = async (saleId, productIds) => {
    const response = await axios.put(`${API_URL}/sales/${saleId}/products`, productIds);
    return response.data;
};

export const getEmployees = async () => {
    const response = await axios.get(`${API_URL}/employees`);
    return response.data;
};

export const getEmployee = async (id) => {
    const response = await axios.get(`${API_URL}/employees/${id}`);
    return response.data;
};

export const createEmployee = async (employeeData) => {
    try {
        const response = await axios.post(`${API_URL}/employees`, employeeData);
        return response.data;
    } catch (error) {
        console.error('CreateEmployee API error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateEmployee = async (id, employeeData) => {
    try {
        const response = await axios.put(`${API_URL}/employees/${id}`, {
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            phoneNumber: employeeData.phoneNumber,
            address: employeeData.address,
            salary: employeeData.salary
        });
        return response.data;
    } catch (error) {
        console.error('UpdateEmployee API error:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    const response = await axios.delete(`${API_URL}/employees/${id}`);
    return response.data;
};

export const getRoles = async () => {
    const response = await axios.get(`${API_URL}/roles`);
    return response.data;
};

export const getRole = async (id) => {
    const response = await axios.get(`${API_URL}/roles/${id}`);
    return response.data;
};

export const getCustomers = async () => {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
};

export const getConversation = async (userId) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`${API_URL}/messages/conversation/${userId}`, {
            headers: {
                'UserId': user.id.toString()
            }
        });
        return response.data;
    } catch (error) {
        console.error('GetConversation API error:', error.response?.data || error.message);
        throw error;
    }
};

export const sendMessage = async (messageData) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.post(`${API_URL}/messages`, messageData, {
            headers: {
                'Content-Type': 'application/json',
                'UserId': user.id.toString()
            }
        });
        return response.data;
    } catch (error) {
        console.error('SendMessage API error:', error.response?.data || error.message);
        throw error;
    }
};

export const markMessageAsRead = async (messageId) => {
    const response = await axios.put(`${API_URL}/messages/${messageId}/read`);
    return response.data;
};

export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const formData = new FormData();

        // Basic fields
        const fieldsToSend = [
            'Name', 'Description', 'Price', 'Category',
            'Manufacturer', 'Status', 'WarrantyDuration'
        ];

        fieldsToSend.forEach(field => {
            const value = productData[field.toLowerCase()];
            if (value !== null && value !== undefined) {
                formData.append(field, String(value));
            }
        });

        // Handle image separately
        if (productData.imageFile instanceof File) {
            formData.append('ImageFile', productData.imageFile);
        }
        if (productData.imageUrl) {
            formData.append('ImageUrl', productData.imageUrl);
        }

        const response = await axios({
            method: 'PUT',
            url: `${API_URL}/products/${id}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Update product error details:', error.response?.data);
        throw error;
    }
};

export const addProduct = async (productData) => {
    try {
        const formData = new FormData();

        // Add basic fields
        formData.append('Name', productData.name);
        formData.append('Description', productData.description);
        formData.append('Price', productData.price);
        formData.append('Category', productData.category);
        formData.append('Status', productData.status);
        formData.append('Manufacturer', productData.manufacturer);
        formData.append('WarrantyDuration', productData.warrantyDuration);
        // Set default ImageUrl
        formData.append('ImageUrl', '/images/default.jpg');

        // Add serial numbers
        const serialNumbers = productData.serialNumbers;
        if (serialNumbers && serialNumbers.length > 0) {
            serialNumbers.forEach((serial) => {
                formData.append('SerialNumbers', serial.trim());
            });
        }

        // Add image file and update ImageUrl if file exists
        if (productData.imageFile) {
            formData.append('ImageFile', productData.imageFile);
            formData.append('ImageUrl', `/images/${productData.imageFile.name}`);
        }

        // Log formData for debugging
        for (let [key, value] of formData.entries()) {
            console.log('FormData:', key, value);
        }

        const response = await axios.post(`${API_URL}/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('AddProduct API error:', error.response?.data || error);
        throw error;
    }
};

export const updateUserProfile = async (userId, profileData) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.put(`${API_URL}/users/${userId}/profile`, profileData, {
            headers: {
                'Content-Type': 'application/json',
                'UserRole': user?.role
            }
        });

        if (response.data && response.data.user) {
            // Trả về dữ liệu mới từ server
            return response.data;
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const getUserOrders = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/orders/user/${userId}`);
        return response?.data || [];
    } catch (error) {
        console.error('Error fetching user orders:', error.response?.data || error.message);
        return [];
    }
};

export const getAvailableItems = async (productId) => {
    try {
        if (!productId) {
            throw new Error('ProductId is required');
        }
        console.log('Fetching available items for product:', productId); // Debug log
        const response = await axios.get(`${API_URL}/productitems/product/${productId}/available`);
        return response.data;
    } catch (error) {
        console.error('Error getting available items:', error);
        if (error.response?.status === 404) {
            return []; // Return empty array if no items found
        }
        throw error;
    }
};

export const getItemProduct = async (itemId) => {
    try {
        if (!itemId) {
            throw new Error('ItemId is required');
        }
        const response = await axios.get(`${API_URL}/productitems/${itemId}/product`);
        return response.data;
    } catch (error) {
        console.error('Error getting item product:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const orderDetails = [];

        // Lấy các items có sẵn cho từng sản phẩm trong cart
        for (const item of orderData.orderDetails) {
            const availableItems = await getAvailableItems(item.productId);

            if (!availableItems || availableItems.length === 0) {
                throw new Error(`No available items for product ${item.productName}`);
            }

            // Lấy số lượng items cần thiết từ available items
            const selectedItems = availableItems.slice(0, item.quantity);

            // Thêm vào orderDetails
            selectedItems.forEach(availableItem => {
                orderDetails.push({
                    itemId: availableItem.itemId,
                    quantity: 1,
                    unitPrice: item.unitPrice
                });
            });
        }

        // Tạo order data với items đã chọn
        const transformedOrderData = {
            ...orderData,
            orderDetails: orderDetails
        };

        const response = await axios.post(`${API_URL}/orders`, transformedOrderData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const searchProducts = async (searchTerm) => {
    try {
        // Get products with search parameters
        const response = await axios.get(`${API_URL}/products`, {
            params: {
                pageSize: 1000 // Lấy tất cả sản phẩm
            }
        });
        const products = response.data?.items || [];
        
        // Convert search term to lowercase for case-insensitive comparison
        const term = searchTerm.toLowerCase().trim();
        
        // Filter products based only on Name and Category
        const filteredProducts = products.filter(product => 
            product.name?.toLowerCase().includes(term) ||
            product.category?.toLowerCase().includes(term)
        );

        return {
            items: filteredProducts,
            totalPages: Math.ceil(filteredProducts.length / 10),
            totalResults: filteredProducts.length
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return {
            items: [],
            totalPages: 0,
            totalResults: 0
        };
    }
};

export const getAllOrders = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'Admin') {
            throw new Error('User not authenticated');
        }

        const response = await axios.get(`${API_URL}/orders/admin/all`);
        return response.data;
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status, note) => {
    try {
        const response = await axios({
            method: 'put',
            url: `${API_URL}/orders/${orderId}/status`,
            data: {
                status: status,
                note: note || ''
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.data) {
            throw new Error('No response from server');
        }

        return response.data;
    } catch (error) {
        console.error('Update order status error:', {
            message: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/dashboard-stats`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            activeCustomers: 0,
            revenueChange: 0,
            ordersChange: 0
        };
    }
};

export const getRevenueByPeriod = async (period) => {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/revenue/${period}`);
        console.log('Revenue data:', response.data); // For debugging
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return [];
    }
};

export const getTopProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/top-products`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top products:', error);
        return [];
    }
};

export const getOrderStats = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`${API_URL}/orders/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`,
                'UserRole': user?.role
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return {
            pendingOrders: 0,
            processingOrders: 0,
            shippingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0
        };
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        return response.data;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
            token: token.trim(), // Remove any whitespace
            newPassword
        });
        return response.data;
    } catch (error) {
        // Enhanced error handling
        if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid or expired reset token');
        }
        if (error.response?.status === 404) {
            throw new Error('Reset token not found');
        }
        throw new Error('An error occurred while resetting the password');
    }
};

export const getWarrantyInfo = async (itemId) => {
    try {
        const response = await axios.get(`${API_URL}/warranties/item/${itemId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching warranty info:', error);
        return null;
    }
};

export const removeFromCart = async (userId, itemId) => {
    try {
        const response = await axios.delete(`${API_URL}/cart/${userId}/item/${itemId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to remove from cart:', error);
        throw error;
    }
};
