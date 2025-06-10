import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Employees from './pages/Employees';
import Customers from './pages/Customers';
import PrivateRoute from './components/PrivateRoute';
import Chat from './pages/Chat';
import CustomerChat from './pages/CustomerChat';
import EditProduct from './pages/EditProduct';
import Categories from './pages/Categories';
import ProductManagement from './pages/ProductManagement';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminOrders from './pages/AdminOrders';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ResetPassword from './pages/ResetPassword';
import ProductItemManagement from './pages/ProductItemManagement';
import Policies from './pages/Policies';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import './styles/common-animations.css';
import './styles/auth.css';
import ExchangeManagement from './pages/ExchangeManagement';

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="app-container">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/search" element={<Products />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/products/:id" element={<ProductDetail />} />
                            <Route
                                path="/employees"
                                element={
                                    <PrivateRoute
                                        element={<Employees />}
                                        allowedRoles={['Admin', 'Manager']}
                                    />
                                }
                            />
                            <Route
                                path="/customers"
                                element={
                                    <PrivateRoute
                                        element={<Customers />}
                                        allowedRoles={['Admin', 'Manager', 'Staff']}
                                    />
                                }
                            />
                            <Route
                                path="/chat"
                                element={
                                    <PrivateRoute
                                        element={<Chat />}
                                        allowedRoles={['Admin', 'Manager', 'Staff']}
                                    />
                                }
                            />
                            <Route
                                path="/customer-chat"
                                element={
                                    <PrivateRoute
                                        element={<CustomerChat />}
                                        allowedRoles={['Customer']}
                                    />
                                }
                            />
                            <Route path="/products/edit/:id" element={<EditProduct />} />
                            <Route
                                path="/categories"
                                element={
                                    <PrivateRoute
                                        element={<Categories />}
                                        allowedRoles={['Admin', 'Manager']}
                                    />
                                }
                            />
                            <Route
                                path="/ProductManagement"
                                element={
                                    <PrivateRoute
                                        element={<ProductManagement />}
                                        allowedRoles={['Admin', 'Manager', 'Staff']}
                                    />
                                }
                            />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route
                                path="/admin/orders"
                                element={
                                    <PrivateRoute
                                        element={
                                            <ErrorBoundary>
                                                <AdminOrders />
                                            </ErrorBoundary>
                                        }
                                        allowedRoles={['Admin', 'Manager', 'Staff']}
                                    />
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute
                                        element={
                                            <ErrorBoundary>
                                                <Dashboard />
                                            </ErrorBoundary>
                                        }
                                        allowedRoles={['Admin', 'Manager', 'Staff']}
                                    />
                                }
                            />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/products/:id/items" element={<ProductItemManagement />} />
                            <Route
                                path="/exchange-management"
                                element={
                                    <PrivateRoute
                                        element={<ExchangeManagement />}
                                        allowedRoles={['Admin', 'Manager']}
                                    />
                                }
                            />
                    </Routes>
                    </main>
                    <Chatbot />
                    <Footer />
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;
