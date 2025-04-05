import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, createOrder } from '../services/api';
import { getProvinces, getDistricts, getWards, calculateShippingFee } from '../services/shippingService';
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

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [shippingMethod, setShippingMethod] = useState('2'); // Default to Standard shipping
    const [shippingFee, setShippingFee] = useState(0);

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
        loadProvinces();
    }, [user?.id]);

    const loadProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setSelectedDistrict('');
        setSelectedWard('');
        try {
            const data = await getDistricts(provinceId);
            setDistricts(data);
        } catch (error) {
            console.error('Error loading districts:', error);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        setSelectedWard('');
        try {
            const data = await getWards(districtId);
            setWards(data);
        } catch (error) {
            console.error('Error loading wards:', error);
        }
    };

    const handleWardChange = async (e) => {
        const wardCode = e.target.value;
        setSelectedWard(wardCode);
        calculateShippingCost(wardCode);
    };

    const calculateShippingCost = async (wardCode) => {
        if (!selectedDistrict || !wardCode) return;

        try {
            const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 500) * item.quantity, 0);
            const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const params = {
                serviceTypeId: parseInt(shippingMethod),
                insuranceValue: Math.floor(totalValue * 23000), // Convert to VND
                toWardCode: wardCode,
                toDistrictId: parseInt(selectedDistrict),
                fromDistrictId: 1530, // Example: District ID of shop location
                weight: totalWeight
            };

            const feeData = await calculateShippingFee(params);
            setShippingFee(feeData.total);
        } catch (error) {
            console.error('Error calculating shipping fee:', error);
        }
    };

    const total = cart.reduce((sum, item) => {
        const itemPrice = item.sale ? item.price * (1 - item.sale.discountPercent / 100) : item.price;
        return sum + itemPrice * item.quantity;
    }, 0) + (shippingFee / 23000); // Convert shipping fee from VND to USD

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to checkout');
            navigate('/login');
            return;
        }

        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            alert('Please select complete shipping address');
            return;
        }

        try {
            const selectedProvinceName = provinces.find(p => p.ProvinceID.toString() === selectedProvince)?.ProvinceName;
            const selectedDistrictName = districts.find(d => d.DistrictID.toString() === selectedDistrict)?.DistrictName;
            const selectedWardName = wards.find(w => w.WardCode === selectedWard)?.WardName;

            const shippingAddress = `${formData.shippingAddress}, ${selectedWardName}, ${selectedDistrictName}, ${selectedProvinceName}`;

            const subtotal = cart.reduce((sum, item) => {
                const itemPrice = item.sale ? item.price * (1 - item.sale.discountPercent / 100) : item.price;
                return sum + itemPrice * item.quantity;
            }, 0);

            const orderData = {
                userId: user.id,
                shippingAddress: shippingAddress,
                phoneNumber: formData.phoneNumber,
                paymentMethod: formData.paymentMethod,
                province: selectedProvinceName,
                district: selectedDistrictName,
                ward: selectedWardName,
                shippingMethod: shippingMethod === '1' ? 'Express' : shippingMethod === '2' ? 'Standard' : 'Saving',
                shippingFee: shippingFee,
                orderDetails: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.sale
                        ? item.price * (1 - item.sale.discountPercent / 100)
                        : item.price
                }))
            };

            const result = await createOrder(orderData);
            if (result) {
                alert('Order placed successfully!');
                navigate('/orders');
            }
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
                        <label>Province/City</label>
                        <select value={selectedProvince} onChange={handleProvinceChange} required>
                            <option value="">Select Province/City</option>
                            {provinces.map(province => (
                                <option key={province.ProvinceID} value={province.ProvinceID}>
                                    {province.ProvinceName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>District</label>
                        <select value={selectedDistrict} onChange={handleDistrictChange} required disabled={!selectedProvince}>
                            <option value="">Select District</option>
                            {districts.map(district => (
                                <option key={district.DistrictID} value={district.DistrictID}>
                                    {district.DistrictName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Ward</label>
                        <select value={selectedWard} onChange={handleWardChange} required disabled={!selectedDistrict}>
                            <option value="">Select Ward</option>
                            {wards.map(ward => (
                                <option key={ward.WardCode} value={ward.WardCode}>
                                    {ward.WardName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Shipping Method</label>
                        <select
                            value={shippingMethod}
                            onChange={(e) => {
                                setShippingMethod(e.target.value);
                                if (selectedWard) {
                                    calculateShippingCost(selectedWard);
                                }
                            }}
                        >
                            <option value="1">Express</option>
                            <option value="2">Standard</option>
                            <option value="3">Saving</option>
                        </select>
                    </div>

                    <div className="shipping-fee">
                        <p>Shipping Fee: ${(shippingFee / 23000).toFixed(2)}</p>
                    </div>

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

                    <div className="order-total">
                        <h3>Total (including shipping): ${total.toFixed(2)}</h3>
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
