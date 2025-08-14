// import React from 'react';
// import { Link } from 'react-router-dom';
// import { User } from 'lucide-react';
// import logoImg from '../../assets/images/logo_on_white orange.png';
// import leftAd from '../../assets/images/adsExample.jpg';
// import rightAd from '../../assets/images/adExample.jpg';
// import styles from './HeroHeader.module.css';
// import InstallPrompt from '../Header/InstallPrompt';


// const HeroHeader = () => {
//     return (
//         <header className={styles.heroHeader}>
//             <nav className={styles.landingNav}>
//                 <a href="/" className={styles.homeLogoPic}>
//                     <img src={logoImg} alt="Logo" className={styles.logoImg} />
//                 </a>

//                 <div className={styles.installLogIn}>
//                     <InstallPrompt />

//                     <Link to="/sign-in">
//                         <button className={styles.logInButton}>
                            
//                             LOG IN 
//                         </button>
//                     </Link>
                    
//                     <Link to="/customer-dashboard" className="hover:text-blue-600">
//                         <User className="w-6 h-6" />
//                     </Link>
//                 </div>
//             </nav>

//             <div className={styles.heroAdsDiv}>
//                 <div className={`${styles.leftAd} ${styles.adsDiv}`}>
                    
//                 </div>

//                 <div className={`${styles.rightAd} ${styles.adsDiv}`}>
                    
//                 </div>
//             </div>

//             <section className={styles.categorySection}>
//                 <div className={styles.searchContainer}>
//                     <input type="text" className={styles.searchInput} placeholder="Search Top Categories ..." />
//                     <i className={`fas fa-search ${styles.searchIcon}`}></i>
//                 </div>

//                 <div className={styles.categoryDivs}>
//                     <Link to="/menu?category=Food" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-utensils fa-bounce ${styles.slow1} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Food</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Fashion" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-shirt fa-shake ${styles.slow2} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Fashion</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Pet supplies" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-dog fa-beat ${styles.slow3} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Pet supplies</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Toys & games" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-puzzle-piece fa-bounce ${styles.slow4} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Toys & games</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Electronics" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-microchip fa-spin-pulse ${styles.slow5} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Electronics</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Health" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-heartbeat fa-beat ${styles.slow6} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Health</p>
//                         </div>
//                     </Link>

//                     <Link to="/menu?category=Beauty" className={styles.categoryLinks}>
//                         <div className={styles.categoryDiv}>
//                             <i className={`fas fa-spa fa-flip ${styles.slow7} ${styles.categoryPic}`}></i>
//                             <p className={styles.categoryText}>Beauty</p>
//                         </div>
//                     </Link>
//                 </div>

//                 <hr></hr>
//             </section>
//         </header>
//     );
// };

// export default HeroHeader;






import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import logoImg from '../../assets/images/logo_on_white orange.png';
import leftAd from '../../assets/images/adsExample.jpg';
import rightAd from '../../assets/images/adExample.jpg';
import styles from './HeroHeader.module.css';
import InstallPrompt from '../Header/InstallPrompt';
import { AuthContext } from '../../contexts/AuthContext';

const HeroHeader = () => {
    const { isLoggedIn, logout } = useContext(AuthContext);
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

    return (
        <header className={styles.heroHeader}>
            <nav className={styles.landingNav}>
                <a href="/" className={styles.homeLogoPic}>
                    <img src={logoImg} alt="Logo" className={styles.logoImg} />
                </a>

                <div className={styles.installLogIn}>
                    <InstallPrompt />

                    {!isLoggedIn ? (
                        <Link to="/sign-in">
                            <button className={styles.logInButton}>LOG IN</button>
                        </Link>
                    ) : (
                        <div ref={dropdownRef} className={styles.userDropdown}>
                            <Link to="/customer-dashboard">
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

            <div className={styles.heroAdsDiv}>
                <div className={`${styles.leftAd} ${styles.adsDiv}`}>
                    {/* Left Ad Content */}
                    {/* <img src={leftAd} alt="Left Ad" className={styles.adImage} /> */}
                </div>

                <div className={`${styles.rightAd} ${styles.adsDiv}`}>
                    {/* Right Ad Content */}
                    {/* <img src={rightAd} alt="Right Ad" className={styles.adImage} /> */}
                </div>
            </div>

            <section className={styles.categorySection}>
                <div className={styles.searchContainer}>
                    <input type="text" className={styles.searchInput} placeholder="Search Top Categories ..." />
                    <i className={`fas fa-search ${styles.searchIcon}`}></i>
                </div>

                <div className={styles.categoryDivs}>
                    <Link to="/menu?category=Food" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-utensils fa-bounce ${styles.slow1} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Food</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Fashion" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-shirt fa-shake ${styles.slow2} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Fashion</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Pet supplies" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-dog fa-beat ${styles.slow3} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Pet supplies</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Toys & games" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-puzzle-piece fa-bounce ${styles.slow4} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Toys & games</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Electronics" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-microchip fa-spin-pulse ${styles.slow5} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Electronics</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Health" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-heartbeat fa-beat ${styles.slow6} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Health</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Beauty" className={styles.categoryLinks}>
                        <div className={styles.categoryDiv}>
                            <i className={`fas fa-spa fa-flip ${styles.slow7} ${styles.categoryPic}`}></i>
                            <p className={styles.categoryText}>Beauty</p>
                        </div>
                    </Link>
                </div>

                <hr />
            </section>
        </header>
    );
};

export default HeroHeader;
