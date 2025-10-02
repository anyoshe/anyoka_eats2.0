import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import logoImg from '../../assets/images/logo_on_white orange.png';
// import ADS from '../../assets/images/Ecommerce_ADs.png';
import leftAd from '../../assets/Ecommerce_ADs.png';
import rightAd from '../../assets/Ecommerce_ADs 2.png';
import styles from './HeroHeader.module.css';
import InstallPrompt from '../Header/InstallPrompt';
import { AuthContext } from '../../contexts/AuthContext';
import { PartnerContext } from '../../contexts/PartnerContext';
import { DriverContext } from '../../contexts/DriverContext';
import HeroHeaderSearch from './HeroHeaderSearch';

const HeroHeader = () => {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const { partner, token: partnerToken } = useContext(PartnerContext);
    const { driver, token: driverToken } = useContext(DriverContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Custom logout handler
    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const userLoggedIn = !!isLoggedIn;
    const vendorLoggedIn = !!partner || !!partnerToken || !!localStorage.getItem('partnerToken');
    const driverLoggedIn = !!driver || !!driverToken || !!localStorage.getItem('driverToken');
    const isAnyLoggedIn = userLoggedIn || vendorLoggedIn || driverLoggedIn;

    const dashboardPath = driverLoggedIn
        ? '/driver/dashboard'
        : vendorLoggedIn
            ? '/dashboard'
            : '/customer-dashboard';

    return (
        <header className={styles.heroHeader}>
            <nav className={styles.landingNav}>
                <a href="/" className={styles.homeLogoPic}>
                    <img src={logoImg} alt="Anyoka Eats" className={styles.logoImg} />
                    <span className={styles.brandText}>Anyoka Eats</span>
                </a>

                {/* Center Ad Slot */}
                <div className={styles.adSlot} aria-label="Promotional banner">
                    <div className={styles.marquee}>
                        <div className={styles.marqueeContent}>
                            <span>Fast local delivery</span>
                            <span>Trusted vendors</span>
                            <span>Great offers every day</span>
                            <span>Secure checkout</span>
                        </div>
                    </div>
                </div>

                <div className={styles.installLogIn}>
                    <InstallPrompt />

                    {!isAnyLoggedIn ? (
                        <Link to="/account-type-selection">
                            <button className={styles.logInButton}>LOG IN</button>
                        </Link>
                    ) : (
                        <div ref={dropdownRef} className={styles.userDropdown}>
                            <Link to={dashboardPath} className={styles.userLinkToDashboard}>
                                <button
                                    className={styles.userIconButton}
                                    onClick={() => setDropdownOpen((open) => !open)}
                                >
                                    <User className={styles.userIcon} />
                                </button>
                            </Link>

                            {/* {dropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            )} */}
                        </div>
                    )}
                </div>
            </nav>

            {/* Compact ad bar for small screens */}
            <div className={styles.adBar} aria-hidden>
                <div className={styles.marqueeSmall}>
                    <div className={styles.marqueeContentSmall}>
                        <span>Fast local delivery</span>
                        <span>Trusted vendors</span>
                        <span>Great offers every day</span>
                        <span>Secure checkout</span>
                    </div>
                </div>
            </div>

            <div className={styles.heroAdsDiv}>
                <div className={`${styles.leftAd} ${styles.adsDiv}`}>
                    {/* Left Ad Content */}
                    <img src={leftAd} alt="Left Ad" className={styles.adImage} />
                </div>

                <div className={`${styles.rightAd} ${styles.adsDiv}`}>
                    {/* Right Ad Content */}
                    <img src={rightAd} alt="Right Ad" className={styles.adImage} />
                </div>
            </div>

            <section className={styles.categorySection}>
                <HeroHeaderSearch />
                <div className={styles.chipRow}>
                    <Link to="/menu?category=Food" className={styles.chip}>
                        <i className={`fas fa-utensils ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Food</span>
                    </Link>
                    <Link to="/menu?category=Fashion" className={styles.chip}>
                        <i className={`fas fa-shirt ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Fashion</span>
                    </Link>
                    <Link to="/menu?category=Pet Supplies" className={styles.chip}>
                        <i className={`fas fa-dog ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Pet supplies</span>
                    </Link>
                    <Link to="/menu?category=Toys & games" className={styles.chip}>
                        <i className={`fas fa-puzzle-piece ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Toys & games</span>
                    </Link>
                    <Link to="/menu?category=Electronics" className={styles.chip}>
                        <i className={`fas fa-microchip ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Electronics</span>
                    </Link>
                    <Link to="/menu?category=Health" className={styles.chip}>
                        <i className={`fas fa-heartbeat ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Health</span>
                    </Link>
                    <Link to="/menu?category=Beauty & Personal Care" className={styles.chip}>
                        <i className={`fas fa-spa ${styles.chipIcon}`}></i>
                        <span className={styles.chipLabel}>Beauty</span>
                    </Link>
                </div>

                <hr />
            </section>
        </header>
    );
};

export default HeroHeader;
