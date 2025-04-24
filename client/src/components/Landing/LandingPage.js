import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import './LandingPage.css';
import OrderTrackingModal from '../Tracking/OrderTrackingModal';
import FooterComponent from '../Landing/LandingFooter';
import HeroHeader from './HeroHeader';
import LandingBodyContainer from './LandingBodyContainer';
import PartnershipSection from './PartnershipSection';

const LandingPage = () => {










    return (
        <div className="containerDiv">
            <HeroHeader />
            <LandingBodyContainer />
            <PartnershipSection />
            <FooterComponent />

            {/* <OrderTrackingModal isOpen={isModalOpen} onClose={closeModal} /> */}
        </div>
    );
};

export default LandingPage;