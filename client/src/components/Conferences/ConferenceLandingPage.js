import React from "react";
import { Link } from 'react-router-dom';
import "./ConferenceLandingPage.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const ConferenceLandingPage = () => {
  return (
    <div className="Conference-landing-page">
      <header className="conference-header">
        <nav className="navbar-conference con-container">
          <div> <a href="/" className='homeLink'><FontAwesomeIcon icon={faHome}  className='homeIcon'/></a></div>
          <div className="logo">
            <h1>ConfHub</h1>
          </div>
          <ul className="con-nav-links">
            <li><a href="#conferences">Conferences</a></li>
            <li><a href="#showcase">Why Us</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
          <a href="#contact" className="btn">Get Started</a>
        </nav>
      </header>

      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>Discover and choose Your Conferences and meeting area</h1>
          <p>Find the perfect space to hold your meeting and or conference.</p>
          <Link to={'/conferenceList'}> <a href="#conferences" className="btn">Explore Now</a></Link>
        </div>
      </section>

      <section className="conferences" id="conferences">
        <h2>Featured Conferences</h2>
        <div className="conference-list container">
          <div className="conference-card">
            <img src="conference1.jpg" alt="Conference 1" />
            <h3>Tech Innovation 2024</h3>
            <p>Join industry leaders to discuss the latest in tech.</p>
            <a href="#" className="btn">View Details</a>
          </div>
          <div className="conference-card">
            <img src="conference2.jpg" alt="Conference 2" />
            <h3>Marketing Summit</h3>
            <p>Explore new trends and strategies in marketing.</p>
            <a href="#" className="btn">View Details</a>
          </div>
          <div className="conference-card">
            <img src="conference3.jpg" alt="Conference 3" />
            <h3>Health & Wellness Expo</h3>
            <p>Discover the latest advancements in healthcare.</p>
            <a href="#" className="btn">View Details</a>
          </div>
          <div className="conference-card">
            <img src="conference4.jpg" alt="Conference 4" />
            <h3>Global Business Forum</h3>
            <p>Network with top executives and entrepreneurs.</p>
            <a href="#" className="btn">View Details</a>
          </div>
        </div>
      </section>

      <section className="showcase" id="showcase">
        <h2>Showcased Conference</h2>
        <p>Have a meeting or conference or an event that require space, food etc? Your at the right place.</p>
        <div className="showcase-grid container">
          <div className="showcase-item">
            <img src="showcase1.jpg" alt="Showcase 1" />
            <h3>Submit Your Event or requirement</h3>
            <p>Let us find for you what best suits you on our platform our platform.</p>
          </div>
          <div className="showcase-item">
            <img src="showcase2.jpg" alt="Showcase 2" />
            <h3>Safe time, money and energy </h3>
            <p>Check out those unique aspects of your conference needs and select the best. We take time to give you the best as you attend to other issues</p>
          </div>
          <div className="showcase-item">
            <img src="showcase3.jpg" alt="Showcase 3" />
            <h3>Engage with Attendees</h3>
            <p>Interact with our space providers and our team effectively to get what you desire.</p>
          </div>
        </div>
        <a href="#contact" className="btn showcase-btn">List of Conferences</a>
      </section>

      <section className="testimonials" id="testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonial-cards container">
          <div className="testimonial-card">
            <p>"ConfHub made it easy for us to find the right conference spaces for our events. Highly recommended!"</p>
            <h4>– Alex Johnson, Tech Enthusiast</h4>
          </div>
          <div className="testimonial-card">
            <p>"As a conference organizer, showcasing my event on ConfHub brought us great visibility and attendance."</p>
            <h4>– Sarah Lee, Event Manager</h4>
          </div>
          <div className="testimonial-card">
            <p>"The variety of conferences available on ConfHub is impressive. There’s something for everyone."</p>
            <h4>– Michael Brown, Marketing Specialist</h4>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <h2>Contact Us</h2>
        <p>Interested in getting your conference space and services or have questions? Reach out to us!</p>
        <form className="contact-form container">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <input type="tel" placeholder="Your Phone Number" required />
          <textarea placeholder="Your Message" required></textarea>
          <button type="submit" className="btn">Send Message</button>
        </form>
      </section>

      <footer className="con-footer">
        <div className="con-container">
          <p>&copy; 2024 ConfHub. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ConferenceLandingPage;
