import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchCart = useCallback(async () => {
        if (!user) return;
        try {
            const response = await axios.get(`${API_URL}/cart/${user.id}`);
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

    const addToCart = async (product) => {
        if (!user) {
            alert('Please login to add items to cart');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/cart/add`, {
                userId: user.id,
                productId: product.id,
                quantity: 1
            });
            await fetchCart();
            return response.data;
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
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
