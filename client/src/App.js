import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import { CartProvider } from './contexts/CartContext';
import SignUpSignIn from './components/Landing/SignUpSignIn';
import AccountPage from './components/User/AccountPage';
import { PartnerProvider } from './contexts/PartnerContext';
import InstallPrompt from './components/Header/InstallPrompt';
import ResetPassword from './components/Landing/ResetPassword';
import ResetPartnerPassword from './components/Landing/ResetPartnerPassword';
import SignupPage from './components/User/SignupPage';
import ProductCard from './components/User/ProductCard';
import Logout from './components/User/UserLogout';
import Login from './components/User/Login';
import OrderSummaryPage from './components/User/OrderSummaryPage';
import StoreMenuPage from './components/Menu/StoreMenuPage';



function App() {
    return (


        <Router>

            <PartnerProvider>
               
                <CartProvider>
    
                    <Routes>

                        <Route path="/" element={<LandingPage />} />
                        <Route path="/sign-up-sign-in" element={<SignUpSignIn />} />
                        <Route path="/sign-in" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/product/:id" element={<ProductCard />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/reset-partner-password" element={<ResetPartnerPassword />} />
                        <Route path="/dashboard" element={<AccountPage />} />
                        
                        <Route path="/menu" element={
                            <CartProvider>
                                <MenuPage />
                            </CartProvider>
                        } />
                        <Route path="/store/:storeId" element={
                            <CartProvider>
                                <StoreMenuPage />
                            </CartProvider>
                        } />

                        <Route path="/orders/:orderId" element={<OrderSummaryPage />} />
                        <Route path="/offers" element={<MenuPage />} />
                        <Route path="/featured" element={<MenuPage />} />
                        <Route path="/user" element={<AccountPage />} />

                    </Routes>

                </CartProvider>

            </PartnerProvider>

        </Router>

    );
}

export default App;