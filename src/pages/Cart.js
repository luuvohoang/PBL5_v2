import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Cart.css'; 

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, []);

    const clearCart = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
            cart.forEach(item => removeFromCart(item.cartId, item.productId));
        }
    };

    const handleQuantityChange = async (cartId, productId, newQuantity) => {
        try {
            // Kiểm tra số lượng tối thiểu
            if (newQuantity < 1) {
                return;
            }
            
            // Tìm sản phẩm trong giỏ hàng
            const cartItem = cart.find(item => item.cartId === cartId && item.productId === productId);
            if (!cartItem) return;

            // Kiểm tra số lượng tối đa
            if (newQuantity > cartItem.stockQuantity) {
                alert(`Chỉ còn ${cartItem.stockQuantity} sản phẩm có sẵn`);
                return;
            }

            await updateQuantity(cartId, productId, newQuantity);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Không thể cập nhật số lượng');
        }
    };

    const total = cart.reduce((sum, item) => {
        const itemPrice = item.sale ? item.price * (1 - item.sale.discountPercent / 100) : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="cart-wrapper">
            <div className="cart-container">
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <i className="fas fa-shopping-cart empty-cart-icon"></i>
                        <h2>Giỏ hàng của bạn còn trống</h2>
                        <p>Hãy mua sắm để thêm sản phẩm vào giỏ hàng</p>
                        <button onClick={() => navigate('/products')}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-left">
                            <div className="cart-items-header">
                                <h1>Giỏ hàng của bạn</h1>
                                <p>{cart.length} sản phẩm</p>
                            </div>
                            <div className="cart-items-list">
                                {cart.map(item => {
                                    const itemPrice = item.sale
                                        ? item.price * (1 - item.sale.discountPercent / 100)
                                        : item.price;
                                    const totalItemPrice = itemPrice * item.quantity;

                                    return (
                                        <div key={`${item.cartId}-${item.productId}`} className="cart-item">
                                            <button 
                                                className="remove-item-button"
                                                onClick={() => removeFromCart(item.cartId, item.productId)}
                                            >
                                                ×
                                            </button>
                                            <div className="item-image">
                                                <img 
                                                    src={`./assets/${item.imageUrl}`} 
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = './assets/images/default.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="item-details">
                                                <h3>{item.name}</h3>
                                                <div className="price-info">
                                                    <span className="current-price">${itemPrice.toLocaleString()}</span>
                                                    {item.sale && (
                                                        <span className="original-price">${item.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="item-actions">
                                                    <div className="quantity-controls">
                                                        <button 
                                                            className="quantity-btn"
                                                            onClick={() => handleQuantityChange(item.cartId, item.productId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            −
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button 
                                                            className="quantity-btn"
                                                            onClick={() => handleQuantityChange(item.cartId, item.productId, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stockQuantity}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="item-total">
                                                        <span>Thành tiền: </span>
                                                        <span className="total-price">${totalItemPrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="cart-items-footer">
                                <button className="clear-cart-button" onClick={clearCart}>
                                    Xóa tất cả giỏ hàng
                                </button>
                            </div>
                        </div>

                        <div className="cart-right">
                            <h2>Thông tin đơn hàng</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Tổng tiền:</span>
                                    <span className="total-amount">${total.toLocaleString()}</span>
                                </div>
                            </div>
                            <button className="checkout-button" onClick={() => navigate('/checkout')}>
                                Tiến hành thanh toán
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
