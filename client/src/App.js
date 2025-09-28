import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import { CartProvider } from './contexts/CartContext';
import SignUpSignIn from './components/Landing/SignUpSignIn';
import AccountPage from './components/User/AccountPage';
import { PartnerProvider } from './contexts/PartnerContext';
import InstallPrompt from './components/Header/InstallPrompt';
import SignupPage from './components/User/SignupPage';
import ProductCard from './components/User/ProductCard';
import Logout from './components/User/UserLogout';
import Login from './components/User/Login';
import OrderSummaryPage from './components/User/OrderSummaryPage';
import StoreMenuPage from './components/Menu/StoreMenuPage';
import DriverSignup from './components/Menu/DriverDashboard/DriverSignup';
import DriverLogin from './components/Menu/DriverDashboard/DriverLogin';
import { DriverProvider } from './contexts/DriverContext';
import ProfileSetupPage from './components/Menu/DriverDashboard/ProfileSetupPage';
import DriverDashboard from './components/Menu/DriverDashboard/DriverDashboard';
import AccountTypeSelection from './components/Landing/AccountTypeSelection';
import CustomerProfileDisplay from './components/Customer/CustomerProfileDisplay';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import AppFooter from './components/AppFooter';
import AppHeader from './components/AppHeader';
import PasswordReset from './components/User/PasswordReset';
import DriverPasswordReset from './components/Menu/DriverDashboard/DriverPasswordReset';


function App() {
    return (


        <Router>
            
            <DriverProvider>

            
            <PartnerProvider>
               
                <CartProvider>
    
                    {/* Shared header on all routes except Landing */}
                    <Routes>

                        <Route path="/" element={<LandingPage />} />
                        <Route path="/account-type-selection" element={<AccountTypeSelection />} />
                        <Route path="/sign-up-sign-in" element={<SignUpSignIn />} />
                        <Route path="/sign-in" element={<Login />} />
                        <Route path="/product/:id" element={<ProductCard />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/driver-signup" element={<DriverSignup />} />
                        <Route path="/driver-login" element={<DriverLogin />} />
                        <Route path="/driver/profile-setup" element={<ProfileSetupPage />} />
                        <Route path="/driver/dashboard" element={<DriverDashboard />} />
                        <Route path="/dashboard" element={<AccountPage />} />
                        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                        <Route path="/password-reset" element={<PasswordReset />} />
                        <Route path="/driver/reset-password" element={<DriverPasswordReset />} />
                        
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

                    <AppFooter />

                </CartProvider>

            </PartnerProvider>

            </DriverProvider>

        </Router>

    );
}

export default App;