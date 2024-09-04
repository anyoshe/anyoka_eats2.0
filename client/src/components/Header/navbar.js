import React from 'react';
import './navbar.css'; 

const NavBar = () => {
    return (
        // logo
        <div className="logo-CTA">
            <div className="logoDiv">
                <h2 className="logo">Anyoka Eats</h2>
            </div>
            {/* CTA's */}
            <div className="signCta_div">
                <button className="signCta logIn">Log In</button>
                <button className="signCta">Sign Up</button>
            </div>
        </div>
    );
}

export default NavBar;


