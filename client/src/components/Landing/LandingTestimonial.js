import React, { useState } from 'react';
import './LandingTestimonial.css';

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNextSlide = () => {
    const nextIndex = (activeIndex + 1) % 6;
    setActiveIndex(nextIndex);
  };

  const handlePrevSlide = () => {
    const prevIndex = (activeIndex - 1 + 6) % 6;
    setActiveIndex(prevIndex);
  };

  return (
    <div className="testimonials">
      <h1 className="testimonial_title">Testimonials</h1>
      
      <p className="testimonial_description">What our customer feel and say about Anyoka Eats.</p>
      
    
      <div className="slider">
        
        <div className="slide-box active">
          
          <p className="comment">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
          </p>

          <img
          src="https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
          />

          <h3 className="name">Albert Sinelly</h3>

          <h4 className="job">Driver</h4>
        </div>

    
        <div className="slide-box">

          <p className="comment">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
          </p>

          <img
          src="https://images.unsplash.com/photo-1627541718143-1adc1b582e62?ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8bXVzbGltfGVufDB8MnwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
          />

          <h3 className="name">Hirok Meryam</h3>

          <h4 className="job">User</h4>
        </div>

     
        <div className="slide-box">
          
            <p className="comment">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
            </p>

            <img
            src="https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzJ8fGZhY2V8ZW58MHwyfDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            />

            <h3 className="name">Sebastian Sert</h3>

            <h4 className="job">Service Provider</h4>
        </div>

      
        <div className="slide-box">
       
          <p className="comment">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
          </p>

          <img
          src="https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
          />

          <h3 className="name">Albert Sinelly</h3>

          <h4 className="job">Driver</h4>
        </div>

     
        <div className="slide-box">
         
          <p className="comment">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
          </p>

          <img
          src="https://images.unsplash.com/photo-1627541718143-1adc1b582e62?ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8bXVzbGltfGVufDB8MnwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
          />

          <h3 className="name">Hirok Meryam</h3>

          <h4 className="job">User</h4>
        </div>

       
        <div className="slide-box">
          
            <p className="comment">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
            </p>

            <img
            src="https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzJ8fGZhY2V8ZW58MHwyfDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
            />

            <h3 className="name">Sebastian Sert</h3>

            <h4 className="job">Service Provider</h4>
        </div>

        {/* SLIDER SEVEN  */}
        <div className="slide-box">
          <p className="comment">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat.
          </p>

          <img
          src="https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzJ8fGZhY2V8ZW58MHwyfDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
          />

          <h3 className="name">Sebastian Sert</h3>

          <h4 className="job">Service Provider</h4>
        </div>

        </div>
    </div>
  );
}

export default Testimonials;
