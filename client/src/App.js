import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import { CartProvider } from './contexts/CartContext';
import ConferenceList from './components/Conferences/ConferenceList';
import LandingFreshFood from './components/FreshFood/LandingFreshFood';
import { FreshFoodCartProvider } from './components/FreshFood/FreshFoodCartContext';
// import NavBar from './components/Header/Navbar';
import SignUpSignIn from './components/Landing/SignUpSignIn';
import DriverDashboard from './components/Landing/DriverDashboard';
import DriverCreateAccount from './components/Landing/DriverCreateAccount';
import ConferenceLandingPage from './components/Conferences/ConferenceLandingPage';
import OutsideCateringLandingPage from './components/OutsideCatering/OutsideCateringLandingPage';
import AccountPage from './components/User/AccountPage';
import QuoteForm from './components/FreshFood/Getquote';
import { PartnerProvider } from './contexts/PartnerContext';
import DishCategories from './components/Menu/DishCategories';
import InstallPrompt from './components/Header/InstallPrompt';
import { DriverProvider } from './contexts/DriverContext';
import ResetPassword from './components/Landing/ResetPassword';
import ResetPartnerPassword from './components/Landing/ResetPartnerPassword';
import UserPage from './components/User/UserPage';
import SignupPage from './components/User/SignupPage';
import ProductCard from './components/User/ProductCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logout from './components/User/UserLogout';
import Login from './components/User/Login';
import OrderSummaryPage from './components/User/OrderSummaryPage';
function App() {
    return (


        <Router>
            <Logout />
            <PartnerProvider>
                <CartProvider>
                    <FreshFoodCartProvider>
                        {/* <NavBar /> */}
                        <ToastContainer />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/sign-up-sign-in" element={<SignUpSignIn />} />
                            <Route path="/sign-in" element={<Login />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/product/:id" element={<ProductCard />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/reset-partner-password" element={<ResetPartnerPassword />} />
                            {/* Move the DriverProvider inside the Route elements */}
                            <Route path="/DriverDashboard" element={
                                <DriverProvider>
                                    <DriverDashboard />
                                </DriverProvider>
                            } />
                            <Route path="/driverCreateAccount" element={
                                <DriverProvider>
                                    <DriverCreateAccount />
                                </DriverProvider>
                            } />
                            <Route path="/dashboard" element={<AccountPage />} />
                            <Route path="/menu" element={
                                <CartProvider>
                                    <MenuPage />
                                </CartProvider>
                            } />
                            <Route path="/orders/:orderId" element={<OrderSummaryPage />} />
                            <Route path="/offers" element={<MenuPage />} />
                            <Route path="/featured" element={<MenuPage />} />
                            <Route path="/superuserdashboard" element={<UserPage />} />
                            <Route path='/outside-catering' element={<OutsideCateringLandingPage />} />
                            <Route path="/user" element={<AccountPage />} />
                            <Route path="/conferences" element={<ConferenceLandingPage />} />
                            <Route path="/conferenceList" element={<ConferenceList />} />
                            <Route path="/freshfood" element={
                                <FreshFoodCartProvider>
                                    <LandingFreshFood />
                                </FreshFoodCartProvider>
                            } />
                            <Route path="/discounts" element={<LandingFreshFood />} />

                        </Routes>
                    </FreshFoodCartProvider>
                </CartProvider>
            </PartnerProvider>
        </Router>

    );
}

export default App;
