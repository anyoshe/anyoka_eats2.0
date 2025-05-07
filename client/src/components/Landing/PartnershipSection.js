import React from 'react';
import vendorImg from '../../assets/images/vendorAdPic.jpg';
import driverImg from '../../assets/images/deliveryMotocycle.jpg';
import './Landing.css';
const PartnershipSection = () => {
  return (
    <section className="partnershipSection">
      <h2 className="sectionTitle">We All Fit Together</h2>
      <div className="puzzleContainer">
        {/* Vendor */}
        <div className="puzzlePiece vendor">
          <img src={vendorImg} alt="" className="promoImg" />
          <div className="pieceContent">
            <h3>Vendor's</h3>
                <p class="sectionIntro">
                    Vendor's Our platform helps you expand your reach without the hassle. 
                    We provide delivery support, and visibility you need to grow — so you can focus on what you do best
                </p>
            <a href="/sign-up-sign-in" className="ctaButton vendorCta">Sign Up Now</a>
          </div>
        </div>

        {/* Platform */}
        <div className="puzzlePiece platform">
          <div className="pieceContent platformPieceContent">
                <p>
                    We bring together local vendors, reliable drivers, and valued customers in one seamless platform — 
                    making buying, selling, and delivering effortless for everyone.
                </p>
            </div>
        </div>

        {/* Driver */}
        <div className="puzzlePiece driver">
          <img src={driverImg} alt="" className="promoImg" />
          <div className="pieceContent">
            <h3>Driver</h3>
                <p> 
                    Want to earn on schedule? Sign up with no upfront costs.We partner with trusted local vendors and provide you with a steady flow of delivery orders.
                </p>
            <a href="/driver-signup" className="ctaButton deliveryCta">Start delivering</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipSection;
