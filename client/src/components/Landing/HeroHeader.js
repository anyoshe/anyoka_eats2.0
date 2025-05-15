import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import logoImg from '../../assets/images/logo_on_white orange.png';
import leftAd from '../../assets/images/adsExample.jpg';
import rightAd from '../../assets/images/adExample.jpg';
import styles from './HeroHeader.module.css';
import InstallPrompt from '../Header/InstallPrompt';


const HeroHeader = () => {
    return (
        <header className={styles.heroHeader}>
            <nav className={styles.landingNav}>
                <a href="/" className={styles.homeLogoPic}>
                    <img src={logoImg} alt="Logo" className={styles.logoImg} />
                </a>

                <div className={styles.installLogIn}>
                    <InstallPrompt />

                    <Link to="/sign-in">
                        <button className={styles.logInButton}>
                            <i className="fas fa-sign-in-alt"></i> LOG IN
                        </button>
                    </Link>
                    <Link to="/customer-dashboard" className="hover:text-blue-600">
                        <User className="w-6 h-6" />
                    </Link>
                </div>
            </nav>

            <div className={styles.heroAdsDiv}>
                <div className={`${styles.leftAd} ${styles.adsDiv}`}>
                    {/* <p className={styles.adtext}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem? Dolore necessitatibus pariatur ipsum qui possimus voluptatibus labore, assumenda recusandae.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem?
                    </p>

                    <img src={leftAd} alt="Left Ad" className={styles.adImage} /> */}
                </div>

                <div className={`${styles.rightAd} ${styles.adsDiv}`}>
                    {/* <img src={rightAd} alt="Right Ad" className={styles.adImage} />

                    <p className={styles.adtext}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro aperiam vitae quibusdam aliquam, numquam officiis. Asperiores deleniti doloremque nisi impedit quasi delectus, enim, nam consequuntur rerum repellat incidunt, sit commodi?Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem?
                    </p> */}
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

                <hr></hr>
            </section>
        </header>
    );
};

export default HeroHeader;
