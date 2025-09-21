import React from 'react';
import vendorImg from '../../assets/images/vendorAdPic.jpg';
import driverImg from '../../assets/images/deliveryMotocycle.jpg';
import styles from './PartnershipSection.module.css'; 
const PartnershipSection = () => {
  return (
    <section className={styles.partnershipSection}>
      <h2 className={styles.sectionTitle}>We All Fit Together</h2>
      <div className={styles.puzzleContainer}>
        {/* Vendor */}
        <div className={`${styles.puzzlePiece} ${styles.vendor}`}>
          <img src={vendorImg} alt="" className={styles.promoImg} />
          <div className={styles.pieceContent}>
            <h3>Vendor's</h3>
            <p className={styles.sectionIntro}>
              Vendor's Our platform helps you expand your reach without the hassle. 
              We provide delivery support, and visibility you need to grow — so you can focus on what you do best
            </p>
            <a href="/sign-up-sign-in" className={`${styles.ctaButton} ${styles.vendorCta}`}>Sign Up Now</a>
          </div>
        </div>

        {/* Platform */}
        <div className={`${styles.puzzlePiece} ${styles.platform}`}>
          <div className={`${styles.pieceContent} ${styles.platformPieceContent}`}>
            <p>
              We bring together local vendors, reliable drivers, and valued customers in one seamless platform — 
              making buying, selling, and delivering effortless for everyone.
            </p>
          </div>
        </div>

        {/* Driver */}
        <div className={`${styles.puzzlePiece} ${styles.driver}`}>
          <img src={driverImg} alt="" className={styles.promoImg} />
          <div className={styles.pieceContent}>
            <h3>Driver</h3>
            <p> 
              Want to earn on schedule? Sign up with no upfront costs. We partner with trusted local vendors and provide you with a steady flow of delivery orders.
            </p>
            <a href="/driver-signup" className={`${styles.ctaButton} ${styles.deliveryCta}`}>Start delivering</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnershipSection;
