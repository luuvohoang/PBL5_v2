import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const [userId, setUserId] = useState(null);

    // Chỉ lấy userId từ localStorage một lần khi component mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserId(user?.id || null);
    }, []);

    const fetchCart = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await axios.get(`${API_URL}/cart/${userId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    }, [userId]); // Chỉ phụ thuộc vào userId

    // Chỉ fetch cart khi userId thay đổi
    useEffect(() => {
        if (userId) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [userId, fetchCart]);

    // Tính toán cartCount khi cart thay đổi
    useEffect(() => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
    }, [cart]);

    const addToCart = async (product) => {
        if (!userId) {
            alert('Please login to add items to cart');
            return;
        }

        try {
            await axios.post(`${API_URL}/cart/add`, {
                userId: userId,
                productId: product.id,
                quantity: 1
            });
            await fetchCart(); // Fetch lại cart sau khi thêm
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    const removeFromCart = async (cartId, productId) => {
        try {
            await axios.delete(`${API_URL}/cart/${cartId}/products/${productId}`);
            await fetchCart();
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (cartId, quantity) => {
        try {
            await axios.put(`${API_URL}/cart/${cartId}/quantity`, quantity);
            fetchCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            fetchCart // Thêm fetchCart vào context để có thể gọi khi cần
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
