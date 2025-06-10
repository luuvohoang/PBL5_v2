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
            const response = await axios.get(`${API_URL}/cart/${userId}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
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
            throw new Error('User not logged in');
        }
        try {
            // Kiểm tra số lượng hiện có trong giỏ hàng
            const existingItem = cart.find(item => item.productId === product.id);
            const currentQuantity = existingItem ? existingItem.quantity : 0;
            const newTotalQuantity = currentQuantity + (product.quantity || 1);

            // Kiểm tra nếu vượt quá stock
            if (newTotalQuantity > product.stockQuantity) {
                throw new Error(`Cannot add more items. Maximum available: ${product.stockQuantity}`);
            }

            // Gọi API để thêm vào giỏ hàng
            const response = await axios.post(`${API_URL}/cart/add`, {
                userId: userId,
                productId: product.id,
                quantity: product.quantity || 1
            });

            if (response.data) {
                await fetchCart(); // Refresh cart after successful add
                return response.data;
            }
            throw new Error('Failed to add to cart');
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

    const updateQuantity = async (cartId, productId, quantity) => {
        try {
            console.log('Updating quantity:', { cartId, productId, quantity });

            // Validate quantity
            if (quantity < 1) {
                throw new Error('Quantity cannot be less than 1');
            }

            // Convert quantity to number and send as JSON
            const response = await axios.put(
                `${API_URL}/cart/${cartId}/products/${productId}/quantity`,
                JSON.stringify(quantity),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                console.log('Update successful:', response.data);
                await fetchCart(); // Refresh cart after successful update
                return response.data;
            }

            throw new Error('Failed to update quantity');
        } catch (error) {
            console.error('Update quantity error:', error);
            throw error;
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
