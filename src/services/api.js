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

export const getProducts = async (category) => {
    const response = await axios.get(`${API_URL}/products${category ? `?category=${category}` : ''}`);
    return response.data;
};

export const getProduct = async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
};

export const getProductById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
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
        // Convert FormData to plain object for debugging
        const formDataObject = {};
        for (let pair of productData.entries()) {
            formDataObject[pair[0]] = pair[1];
        }
        console.log('Sending data:', formDataObject);

        const response = await axios.put(`${API_URL}/products/${id}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Full error details:', error.response?.data);
        throw error;
    }
};

export const addProduct = async (productData) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const formData = new FormData();

        // Add all basic fields
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('category', productData.category);
        formData.append('stockQuantity', productData.stockQuantity);
        formData.append('status', productData.status);
        formData.append('manufacturer', productData.manufacturer);

        // Add image file if exists
        if (productData.imageFile) {
            formData.append('imageFile', productData.imageFile);
            formData.append('imageUrl', `/images/${productData.imageFile.name}`);
        }

        // Add user information
        if (user?.id) {
            formData.append('createdById', user.id);
            formData.append('updatedById', user.id);
        }

        const response = await axios.post(`${API_URL}/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('AddProduct API error:', error);
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
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/orders`, orderData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.response?.data || error.message);
        throw error;
    }
};
