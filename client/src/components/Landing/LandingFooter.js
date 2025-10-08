import React, {useState} from 'react';
import './LandingFooter.css'; 
import config from '../../config';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = {
    email: email,
    message: message,
  };

  try {
    const response = await fetch(`${config.backendUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Email sent successfully!');
      // Clear the fields
      setEmail('');
      setMessage('');
    } else {
      alert('Failed to send email. Please try again.');
    }
  } catch (error) {
    alert('An error occurred. Please try again later.');
  }
};
  
  return (
    <footer className="footer-section">
      <div className="top_header_div">
        <div className="top_header_divs">
          <i className="fas fa-map-marker-alt" id="top_header_icons"></i>

          <h3 className="top_header_divs_headers">Location</h3>

          <p className="top_header_divs_para">Malindi,Kenya</p>
        </div>

        <div className="top_header_divs">
          <i className="fas fa-phone" id="top_header_icons"></i>

          <h3 className="top_header_divs_headers">Phone</h3>

          <p className="top_header_divs_para">0706251573</p>
        </div>

        <div className="top_header_divs">
          <i className="far fa-envelope-open" id="top_header_icons"></i>

          <h3 className="top_header_divs_headers">Email</h3>
          
          <p className="top_header_divs_para">anyokaeats@gmail.com</p>
        </div>
      </div>

      <div className="footer-content">
        {/* <span className="bike"></span>
        <span className="car"></span> */}

        <div className="row row_two">
          <div className="column_logo column_footer">
            <div className="footer-widget">
              <div className="footer-logo">
                <a href="index.html" className="footer_logo_link">
                  <h2 className="footer_logo_head">Anyoka Eats</h2>
                </a>
              </div>

              <div className="footer-text">
                <p className="footer-logo-text"> 
                  "Anyoka Eats – Savor Every Moment, Anytime, Anywhere."
                </p>
              </div>

              <li className="privacy_list">
                <a href="#" className="privacy_link">Privacy & Terms Policy</a>
              </li>
            </div>
          </div>

          <div className="footer-social-icon column_footer">
            <p className="social_header">Socials</p>
            
            <div className="social_icon">
              <a href="https://www.tiktok.com/@anyokaeats" target="_blank" className="social_link">
                <i className="fab fa-tiktok tiktok-bg" id="social_list"></i>
              </a>

              <a href="https://www.facebook.com/anyokaeats" className="social_link">
                <i className="fab fa-facebook-f facebook-bg" id="social_list"></i>
              </a>

              <a href="https://twitter.com/AnyokaEats" target="_blank" className="social_link">
                <i className="fab fa-twitter twitter-bg" id="social_list"></i>
              </a>

              <a href="https://www.instagram.com/anyokaeats254" target="_blank" className="social_link">
                <i className="fab fa-instagram instagram-bg" id="social_list"></i>
              </a>

              <a href="https://wa.me/254706251573" target="_blank" className="whatsapp-link social_link">
                <i className="fab fa-whatsapp whatsapp-bg" id="social_list"></i>
              </a>
            </div>
          </div>

          <div className="column_contactus column_footer">

            <h3 className="footer_contactUs_heading">Email Us</h3>

            <form onSubmit={handleSubmit} className="contact_form">

              <input 
              type="email" 
              name='email'
                className="your_email"
                placeholder="Your Email"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <textarea
              name="message" 
              placeholder="Your Message" 
              className="contact_text_email"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              ></textarea>

              <button type="submit" className="contact_form_btn">Let's Talk</button>

            </form>
          </div>
        </div>

        {/* Helpful links */}
        {/* <div className="row links_row">
          <div className="column_footer">
            <h4 className="links_header">Discover</h4>
            <ul className="footer_links">
              <li><a href="/menu?category=Food">Popular Categories</a></li>
              <li><a href="/featured">Top Vendors</a></li>
              <li><a href="/offers">Deals & Offers</a></li>
              <li><a href="mailto:anyokaeats@gmail.com?subject=Advertise%20with%20Anyoka%20Eats">Advertise with Us</a></li>
            </ul>
          </div>
          <div className="column_footer">
            <h4 className="links_header">Help & Support</h4>
            <ul className="footer_links">
              <li><a href="/help">Help Center / FAQs</a></li>
              <li><a href="mailto:anyokaeats@gmail.com">Contact Support (Email)</a></li>
              <li><a href="tel:+254706251573">Contact Support (Phone)</a></li>
              <li><a href="https://wa.me/254706251573" target="_blank" rel="noreferrer">Contact on WhatsApp</a></li>
              <li><a href="/customer-dashboard">Track My Order</a></li>
              <li><a href="/support/report">Report an Issue</a></li>
            </ul>
          </div>
          <div className="column_footer">
            <h4 className="links_header">For Vendors</h4>
            <ul className="footer_links">
              <li><a href="/sign-up-sign-in">Become a Vendor (Sign up)</a></li>
              <li><a href="/sign-in">Vendor Login</a></li>
              <li><a href="/vendor/guidelines">Vendor Guidelines / Fees</a></li>
              <li><a href="/account-type-selection">Share Your Store (how‑to)</a></li>
            </ul>
          </div>
          <div className="column_footer">
            <h4 className="links_header">For Drivers</h4>
            <ul className="footer_links">
              <li><a href="/driver-signup">Become a Driver (Sign up)</a></li>
              <li><a href="/driver-login">Driver Login</a></li>
              <li><a href="/driver/requirements">Driver Requirements</a></li>
              <li><a href="/driver/safety">Safety Guidelines</a></li>
            </ul>
          </div>
          <div className="column_footer">
            <h4 className="links_header">Legal</h4>
            <ul className="footer_links">
              <li><a href="/legal/terms">Terms of Service</a></li>
              <li><a href="/legal/privacy">Privacy Policy</a></li>
              <li><a href="/legal/cookies">Cookie Policy</a></li>
              <li><a href="/legal/refunds">Refund & Cancellation Policy</a></li>
            </ul>
          </div>
          <div className="column_footer">
            <h4 className="links_header">Company</h4>
            <ul className="footer_links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/blog">Blog/News</a></li>
            </ul>
          </div>
        </div> */}
      </div>

      <span className="bike"></span>
      <span className="car"></span>

      <div className="copyright_div">
        <p className="copyright_text">Anyoka Eats &copy; Copyright 2025, All Right Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;

