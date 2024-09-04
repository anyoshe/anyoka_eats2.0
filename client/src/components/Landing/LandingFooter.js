import React from 'react';
import './LandingFooter.css'; 

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="top_header_div">
        <div className="top_header_divs">
          <i className="fas fa-map-marker-alt" id="top_header_icons"></i>
          <h3 className="top_header_divs_headers">Location</h3>
          <p className="top_header_divs_para">1450 - 2000 Malindi, Maweni</p>
        </div>

        <div className="top_header_divs">
          <i className="fas fa-phone" id="top_header_icons"></i>
          <h3 className="top_header_divs_headers">Phone</h3>
          <p className="top_header_divs_para">0798765432</p>
        </div>

        <div className="top_header_divs">
          <i className="far fa-envelope-open" id="top_header_icons"></i>
          <h3 className="top_header_divs_headers">Email</h3>
          <p className="top_header_divs_para">AnyokaEats@gmail.com</p>
        </div>
      </div>

      <div className="footer-content">
        <span className="bike"></span>
        <span className="car"></span>

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
                  Lorem ipsum dolor sit amet, consec tetur adipisicing elit, sed do eiusmod tempor incididuntut consec tetur adipisicing elit, Lorem ipsum dolor sit amet.
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
              <a href="#" className="social_link">
                <i className="fab fa-facebook-f facebook-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-twitter twitter-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-google-plus-g google-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-whatsapp whatsapp-bg" id="social_list"></i>
              </a>
            </div>
          </div>

          <div className="column_contactus column_footer">
            <h3 className="footer_contactUs_heading">Email Us</h3>
            <form action="#" className="contact_form">
              <input type="text" className="your_email" placeholder="Your Email" />
              <textarea type="text" placeholder="Your Message" className="contact_text_email"></textarea>
              <button type="submit" className="contact_form_btn">Let's Talk</button>
            </form>
          </div>
        </div>
      </div>

      <div className="copyright_div">
        <p className="copyright_text">Anyoka Eats &copy; Copyright 2024, All Right Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
