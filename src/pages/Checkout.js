import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, createOrder } from '../services/api';
import '../styles/Checkout.css';

const Checkout = () => {
    const { cart } = useCart();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [formData, setFormData] = useState({
        shippingAddress: '',
        phoneNumber: '',
        paymentMethod: 'cod'
    });

    // Fetch user profile when component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user?.id) {
                try {
                    const data = await getUserProfile(user.id);
                    setFormData(prev => ({
                        ...prev,
                        shippingAddress: data.address || '',
                        phoneNumber: data.phoneNumber || ''
                    }));
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        fetchUserProfile();
    }, [user?.id]);

    const total = cart.reduce((sum, item) => {
        const itemPrice = item.sale ? item.price * (1 - item.sale.discountPercent / 100) : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to checkout');
            navigate('/login');
            return;
        }

        try {
            const orderData = {
                userId: user.id,
                shippingAddress: formData.shippingAddress,
                phoneNumber: formData.phoneNumber,
                paymentMethod: formData.paymentMethod,
                orderDetails: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.sale
                        ? item.price * (1 - item.sale.discountPercent / 100)
                        : item.price
                }))
            };

            const result = await createOrder(orderData);
            alert('Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/products')}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            <div className="checkout-content">
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    {cart.map(item => (
                        <div key={item.productId} className="order-item">
                            <img src={item.imageUrl} alt={item.name} />
                            <div className="item-details">
                                <h3>{item.name}</h3>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: ${(item.sale
                                    ? item.price * (1 - item.sale.discountPercent / 100)
                                    : item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                    <div className="order-total">
                        <h3>Total: ${total.toFixed(2)}</h3>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="checkout-form">
                    <h2>Shipping Information</h2>
                    <div className="form-group">
                        <label>Shipping Address</label>
                        <textarea
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleInputChange}
                        >
                            <option value="cod">Cash on Delivery</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                    </div>
                    <button type="submit" className="place-order-button">
                        Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
