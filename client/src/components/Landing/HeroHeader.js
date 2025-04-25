import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/images/logo_on_white orange.png';
import leftAd from '../../assets/images/adsExample.jpg';
import rightAd from '../../assets/images/adExample.jpg';
import './Landing.css';
import InstallPrompt from '../Header/InstallPrompt';
const HeroHeader = () => {
    return (
        <header className="heroHeader">
            <nav className="landingNav">
                <a href="/" className="homeLogoPic">
                    <img src={logoImg} alt="Logo" className="logoImg" />
                </a>
                <Link to="/sign-in">
                    <button className="logInButton">
                        <i className="fas fa-sign-in-alt"></i> LOG IN
                    </button></Link>
            </nav>

            <div className="heroAdsDiv">
                <div className="leftAd adsDiv">
                    <p className="adtext">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem? Dolore necessitatibus pariatur ipsum qui possimus voluptatibus labore, assumenda recusandae.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem?</p>

                    <img src={leftAd} alt="Left Ad" className="adImage" />

                </div>

                <div className="rightAd adsDiv">
                    <img src={rightAd} alt="Right Ad" className="adImage" />

                    <p className="adtext">Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro aperiam vitae quibusdam aliquam, numquam officiis. Asperiores deleniti doloremque nisi impedit quasi delectus, enim, nam consequuntur rerum repellat incidunt, sit commodi?Lorem ipsum dolor sit, amet consectetur adipisicing elit. Placeat iure suscipit neque assumenda quis quo iste atque recusandae odit quidem?</p>
                </div>
            </div>

            <section className="categorySection">

                {/* <h2 className="categoryListH2">Top Categories</h2> */}

                <div className="searchContainer">
                    <input type="text" className="searchInput" placeholder="Search Top Categories ..." />
                    <i className="fas fa-search searchIcon"></i>
                </div>
                <InstallPrompt />

                <div className="categoryDivs">
                    <Link to="/menu?category=Food">
                        <div className="categoryDiv">
                            <i className="fas fa-utensils fa-bounce slow1 categoryPic"></i>
                            <p className="categoryText">Food</p>
                        </div>
                    </Link>
                    <Link to="/menu?category=Fashion">
                        <div class="categoryDiv">
                            <i class="fas fa-shirt fa-shake slow2 categoryPic"></i>
                            <p class="categoryText">Fashion</p>
                        </div>
                    </Link>
                    <Link to="/menu?category=Pet supplies">
                        <div class="categoryDiv">
                            <i class="fas fa-dog fa-beat slow3 categoryPic"></i>
                            <p class="categoryText">Pet supplies</p>
                        </div>
                    </Link>
                    <Link to="/menu?category=Toys & games">
                        <div class="categoryDiv">
                            <i class="fas fa-puzzle-piece fa-bounce slow4 categoryPic"></i>
                            <p class="categoryText">Toys & games</p>
                        </div>
                    </Link>
                    <Link to="/menu?category=Electronics">
                        <div class="categoryDiv">
                            <i class="fas fa-microchip fa-spin-pulse slow5 categoryPic"></i>
                            <p class="categoryText">Electronics</p>
                        </div>
                    </Link>

                    <Link to="/menu?category=Health">
                        <div class="categoryDiv">
                            <i class="fas fa-heartbeat fa-beat slow6 categoryPic"></i>
                            <p class="categoryText">Health</p>
                        </div>
                    </Link>
                    <Link to="/menu?category=Beauty">
                        <div class="categoryDiv">
                            <i className="fas fa-spa fa-flip slow7 categoryPic"></i>
                            <p class="categoryText">Beauty</p>
                        </div>
                    </Link>
                </div>

            </section>
        </header>
    );
};

export default HeroHeader;
