import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import { CartProvider } from './components/Menu/CartContext';
import ConferenceList from './components/Conferences/ConferenceList';
import LandingFreshFood from './components/FreshFood/LandingFreshFood';
import { FreshFoodCartProvider } from './components/FreshFood/FreshFoodCartContext';
// import NavBar from './components/Header/Navbar';
import SignUpSignIn from './components/Landing/SignUpSignIn';
import ConferenceLandingPage from './components/Conferences/ConferenceLandingPage';
import OutsideCateringLandingPage from './components/OutsideCatering/OutsideCateringLandingPage';
import UserProfileDashBoard from './components/User/UserProfileDashBoard';
import { PartnerProvider } from './contexts/PartnerContext';
import DishCategories from './components/Menu/DishCategories';
import InstallPrompt from './components/Header/InstallPrompt';

function App() {
    return (
        
       
        <Router>
            <PartnerProvider>
                <CartProvider>
                <FreshFoodCartProvider>
                {/* <NavBar /> */}
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/sign-up-sign-in" element={<SignUpSignIn />} />
                    <Route path="/dashboard" element={<UserProfileDashBoard />} />
                    <Route path="/menu" element={
                        <CartProvider>
                            <MenuPage />
                        </CartProvider>
                    } />
                    <Route path="/offers" element={<MenuPage />} />
                    <Route path="/featured" element={<MenuPage />} />
                    <Route path='/outside-catering' element={<OutsideCateringLandingPage />} />
                    <Route path="/user" element={<UserProfileDashBoard />} />
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
