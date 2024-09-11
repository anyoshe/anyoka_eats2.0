// import React from 'react';
// import './LandingFooter.css'; 

// const Footer = () => {
//   return (
//     <footer className="footer-section">
//       <div className="top_header_div">
//         <div className="top_header_divs">
//           <i className="fas fa-map-marker-alt" id="top_header_icons"></i>
//           <h3 className="top_header_divs_headers">Location</h3>
//           <p className="top_header_divs_para">1450 - 2000 Malindi, Maweni</p>
//         </div>

//         <div className="top_header_divs">
//           <i className="fas fa-phone" id="top_header_icons"></i>
//           <h3 className="top_header_divs_headers">Phone</h3>
//           <p className="top_header_divs_para">0798765432</p>
//         </div>

//         <div className="top_header_divs">
//           <i className="far fa-envelope-open" id="top_header_icons"></i>
//           <h3 className="top_header_divs_headers">Email</h3>
//           <p className="top_header_divs_para">AnyokaEats@gmail.com</p>
//         </div>
//       </div>

//       <div className="footer-content">
//         <span className="bike"></span>
//         <span className="car"></span>

//         <div className="row row_two">
//           <div className="column_logo column_footer">
//             <div className="footer-widget">
//               <div className="footer-logo">
//                 <a href="index.html" className="footer_logo_link">
//                   <h2 className="footer_logo_head">Anyoka Eats</h2>
//                 </a>
//               </div>

//               <div className="footer-text">
//                 <p className="footer-logo-text">
//                   Lorem ipsum dolor sit amet, consec tetur adipisicing elit, sed do eiusmod tempor incididuntut consec tetur adipisicing elit, Lorem ipsum dolor sit amet.
//                 </p>
//               </div>

//               <li className="privacy_list">
//                 <a href="#" className="privacy_link">Privacy & Terms Policy</a>
//               </li>
//             </div>
//           </div>

//           <div className="footer-social-icon column_footer">
//             <p className="social_header">Socials</p>
//             <div className="social_icon">
//               <a href="#" className="social_link">
//                 <i className="fab fa-facebook-f facebook-bg" id="social_list"></i>
//               </a>
//               <a href="#" className="social_link">
//                 <i className="fab fa-twitter twitter-bg" id="social_list"></i>
//               </a>
//               <a href="#" className="social_link">
//                 <i className="fab fa-google-plus-g google-bg" id="social_list"></i>
//               </a>
//               <a href="#" className="social_link">
//                 <i className="fab fa-whatsapp whatsapp-bg" id="social_list"></i>
//               </a>
//             </div>
//           </div>

//           <div className="column_contactus column_footer">
//             <h3 className="footer_contactUs_heading">Email Us</h3>
//             <form action="#" className="contact_form">
//               <input type="text" className="your_email" placeholder="Your Email" />
//               <textarea type="text" placeholder="Your Message" className="contact_text_email"></textarea>
//               <button type="submit" className="contact_form_btn">Let's Talk</button>
//             </form>
//           </div>
//         </div>
//       </div>

//       <div className="copyright_div">
//         <p className="copyright_text">Anyoka Eats &copy; Copyright 2024, All Right Reserved</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

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
    console.error('Error sending email:', error);
    alert('An error occurred. Please try again later.');
  }
};
  
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
              <a href="#" className="social_link">
                <i className="fab fa-tiktok tiktok-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-facebook-f facebook-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-twitter twitter-bg" id="social_list"></i>
              </a>
              <a href="#" className="social_link">
                <i className="fab fa-instagram instagram-bg" id="social_list"></i>
              </a>

              <a href="#" className="social_link">
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
      </div>

      <span className="bike"></span>
      <span className="car"></span>

      <div className="copyright_div">
        <p className="copyright_text">Anyoka Eats &copy; Copyright 2024, All Right Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;

