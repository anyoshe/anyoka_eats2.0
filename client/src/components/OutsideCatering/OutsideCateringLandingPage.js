import React, { useEffect } from "react";
import "./OutsideCateringLandingPage.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import NavBar from "../Header/navbar";
import carrotImage from '../../assets/carrots.jpg';

const OutsideCateringLandingPage = () => {
  useEffect(() => {
    const serviceCardsContainer = document.querySelector('.service-cards');
    const cards = Array.from(document.querySelectorAll('.service-card'));

    // Duplicate the service cards
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      serviceCardsContainer.appendChild(clone);
    });

    // Adjust the width of the container to account for the duplicates
    const cardWidth = cards[0].getBoundingClientRect().width;
    const containerWidth = cardWidth * cards.length * 2; // For duplicated items
    serviceCardsContainer.style.width = `${containerWidth}px`;
  }, []);

  return (
    <div className="catering-landing-page">
       <NavBar/>
      {/* Hero/Banner Section */}
      <section className="fresh-hero-section">
        <div className="fresh-hero-overlay">
          <h1 className="fresh_discover-header">Discover the Best Outside Catering Services</h1>
          <p className="fresh_discover-paragraph">
            Explore a variety of outside catering services from top providers
            and book your perfect service today.
          </p>
          <button className="fresh_discover-button">Explore Services</button>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-services">
        <h3 className="featured-services-header">Featured Services</h3>
        
        <div className="service-cards">
          <div className="service-card">
            <img
              src={carrotImage}
              alt="Catering Service 1"
            />
            <p>Gourmet Meals</p>
          </div>

          <div className="service-card">
            <img
              src={carrotImage}
              alt="Catering Service 2"
            />
            <p>Live Cooking</p>
          </div>

          <div className="service-card">
            <img
             src={carrotImage}
              alt="Catering Service 3"
            />
            <p>Cocktail Parties</p>
          </div>

          <div className="service-card">
            <img
             src={carrotImage}
              alt="Catering Service 1"
            />
            <p>Delicious Gourmet Meals</p>
          </div>

          <div className="service-card">
            <img
              src={carrotImage}
              alt="Catering Service 2"
            />
            <p>Live Cooking Stations</p>
          </div>

          <div className="service-card">
            <img
              src={carrotImage}
              alt="Catering Service 3"
            />
            <p>Cocktail Parties</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h3 className="testimonialTitle">What Our Customers Say</h3>
        <div className="testimonial-cards">

          <div className="testimonial-card">
            <p>
              "The gourmet meals were exquisite! Our guests were thoroughly
              impressed. Highly recommend!"
            </p>
            <h4>– Jane Doe</h4>
          </div>

          <div className="testimonial-card">
            <p>
              "The live cooking stations added a unique touch to our event. The
              chefs were fantastic!"
            </p>
            <h4>– John Smith</h4>
          </div>

          <div className="testimonial-card">
            <p>
              "Our cocktail party was a hit thanks to the elegant setup and
              professional staff."
            </p>
            <h4>– Sarah Lee</h4>
          </div>

          <div className="testimonial-card">
            <p>
              "The gourmet meals were exquisite! Our guests were thoroughly
              impressed. Highly recommend!"
            </p>
            <h4>– Jane Doe</h4>
          </div>

          <div className="testimonial-card">
            <p>
              "The live cooking stations added a unique touch to our event. The
              chefs were fantastic!"
            </p>
            <h4>– John Smith</h4>
          </div>

          <div className="testimonial-card">
            <p>
              "Our cocktail party was a hit thanks to the elegant setup and
              professional staff."
            </p>
            <h4>– Sarah Lee</h4>
          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
       <p className="copyright_text">Anyoka Eats &copy; Copyright 2024, All Right Reserved</p>
      </footer>
    </div>
  );
};

export default OutsideCateringLandingPage;
