import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const total = cart.reduce((sum, item) => {
        const itemPrice = item.sale ? item.price * (1 - item.sale.discountPercent / 100) : item.price;
        return sum + itemPrice * item.quantity;
    }, 0);

    if (cart.length === 0) {
        return <div className="container">Your cart is empty</div>;
    }

    return (
        <div className="container">
            <h1>Shopping Cart</h1>
            <div className="cart-items">
                {cart.map(item => (
                    <div key={`${item.cartId}-${item.productId}`} className="card cart-item">
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100px' }} />
                        <div>
                            <h3>{item.name}</h3>
                            <div className="price-container">
                                {item.sale && (
                                    <span className="original-price">${item.price.toFixed(2)}</span>
                                )}
                                <p className="price">
                                    ${(item.sale
                                        ? item.price * (1 - item.sale.discountPercent / 100)
                                        : item.price).toFixed(2)}
                                </p>
                                {item.sale && (
                                    <span className="discount-badge">-{item.sale.discountPercent}%</span>
                                )}
                            </div>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.cartId, item.productId, parseInt(e.target.value))}
                            />
                            <button onClick={() => removeFromCart(item.cartId, item.productId)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-total">
                <h2>Total: ${total.toFixed(2)}</h2>
            </div>
        </div>
    );
};

export default Cart;
