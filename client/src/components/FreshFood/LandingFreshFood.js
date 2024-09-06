// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import FoodCard from './FoodCard';
// import './LandingFreshFood.css';
// import config from '../../config';
// import FoodCart from './FoodCart';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHome } from '@fortawesome/free-solid-svg-icons';
// import FooterComponent from '../Landing/LandingFooter';
// import NavBar from '../Header/navbar';

// import FruitVegImage from '../../assets/display images grocer.jpg';
// import GrainsCerealImage from '../../assets/cerial display.jpg';
// import SpicesImage from '../../assets/spices images.jpg';
// import TubersRootsImage from '../../assets/tubers and roots display.jpg';
// import MeatImg from '../../assets/meat display.jpg';
// import DairyProductImage from '../../assets/dairyproducts.jpg';
// import SeaFoodFishImage from '../../assets/seafood and fish.jpg';

// const LandingFreshFood = () => {
//   const [foods, setFoods] = useState([]);
//   const [groupedFoods, setGroupedFoods] = useState({});
//   const [discountedFoods, setDiscountedFoods] = useState([]);

//   useEffect(() => {
//     const fetchFoods = async () => {
//       try {
//         const response = await axios.get(`${config.backendUrl}/api/foods`);
//         const fetchedFoods = response.data;

//         const grouped = fetchedFoods.reduce((acc, food) => {
//           if (!acc[food.foodCategory]) {
//             acc[food.foodCategory] = [];
//           }
//           acc[food.foodCategory].push(food);
//           return acc;
//         }, {});

//         setFoods(fetchedFoods);
//         setGroupedFoods(grouped);
//       } catch (error) {
//         console.error('Error fetching foods:', error);
//       }
//     };

//     const fetchDiscountedFoods = async () => {
//       try {
//         const response = await axios.get(`${config.backendUrl}/api/discounts?discount_gt=1`);
//         setDiscountedFoods(response.data);
//       } catch (error) {
//         console.error('Error fetching discounted foods:', error);
//       }
//     };

//     fetchFoods();
//     fetchDiscountedFoods();
//   }, []);

//   return (
//     <div className="landing-fresh-food">
//         {/* <NavBar/> */}
//       <div className='fresh_nav_position'>
//         <header className='landing-fresh-foods-header'>
//           <a href="/" className="homeLink">
//             <FontAwesomeIcon icon={faHome} className="homeIcon" />
//           </a>

//           <div className="fresh_bar">
//             <input type="text" placeholder="Search..."  className="fresh_bar_input" />
//             <i class="fas fa-magnifying-glass fresh_glass" ></i>
//           </div>
          
//           <FoodCart />
//         </header>
//       </div>

//       <section className="main-category">

//         <div className="fresh-list">

//           <h2 className='fresh_page_heading'>Product Categories</h2>

//           <ul className="fresh_category">
           
//             <a href="#shop" className='fresh_link'><li>All</li></a>
           
//             <a href="#shop" className='fresh_link'><li>Fruits & Vegetables</li></a>
           
//             <a href="#shop" className='fresh_link'><li>Grains & Cereals</li></a>
          
//             <a href="#shop" className='fresh_link'><li>Spices</li></a>
          
//             <a href="#shop" className='fresh_link'><li>Tubers & Roots</li></a>
        
//             <a href="#shop" className='fresh_link'><li>Meat & Poultry</li></a>
           
//             <a href="#shop" className='fresh_link'><li>Dairy & Eggs</li></a>
           
//             <a href="#shop" className='fresh_link'><li>Sea Foods & Fish</li></a>
    
//           </ul>

//         </div>

//         <div className="category-grid">
//           <h2>Discover Our Selection</h2>
//           {Object.keys(groupedFoods).map((category) => (
//             <div key={category} className="category">
//               <h3>{category}</h3>
//               <div className="food-grid">
//                 {groupedFoods[category].map((food) => (
//                   <FoodCard key={food._id} food={food} />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section  id="special-offers" className="fresh-page-offers-section">

//         <h2 className="fresh-page-offers-title">Special Offers & Discounts</h2>

//         <div className="offer-page-grid">

//           {discountedFoods.length > 0 ? (
//             discountedFoods.map((food) => (
//               <FoodCard key={food._id} food={food} />
//             ))
//           ) : (

//             <p>No special offers available at the moment.</p>

//           )}
//         </div>

//       </section>

//       <section className="wholesale">

//         <h2 className='fresh-wholesale-title'>Wholesale & Bulk Orders</h2>

//         <p className='fresh-wholesale-para'>Looking for bulk purchases? Contact us for exclusive wholesale prices and offers.</p>

//         <a href="#contact" className="wholesale-cta-button">Get a Quote</a>

//       </section>
      
//       <FooterComponent />
//     </div>
//   );
// };

// export default LandingFreshFood;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FoodCard from './FoodCard';
import './LandingFreshFood.css';
import config from '../../config';
import FoodCart from './FoodCart';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import FooterComponent from '../Landing/LandingFooter';
import NavBar from '../Header/navbar';

const LandingFreshFood = () => {
  const [foods, setFoods] = useState([]);
  const [groupedFoods, setGroupedFoods] = useState({});
  const [discountedFoods, setDiscountedFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/foods`);
        const fetchedFoods = response.data;

        const grouped = fetchedFoods.reduce((acc, food) => {
          if (!acc[food.foodCategory]) {
            acc[food.foodCategory] = [];
          }
          acc[food.foodCategory].push(food);
          return acc;
        }, {});

        setFoods(fetchedFoods);
        setGroupedFoods(grouped);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    const fetchDiscountedFoods = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/discounts?discount_gt=1`);
        setDiscountedFoods(response.data);
      } catch (error) {
        console.error('Error fetching discounted foods:', error);
      }
    };

    fetchFoods();
    fetchDiscountedFoods();
  }, []);

  useEffect(() => {
    // Check if the URL contains the hash
    const hash = window.location.hash;
    if (hash === '#special-offers') {
      const element = document.getElementById('special-offers');
      if (element) {
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="landing-fresh-food">
      {/* <NavBar/> */}
      <div className='fresh_nav_position'>
        <header className='landing-fresh-foods-header'>
          <a href="/" className="homeLink">
            <FontAwesomeIcon icon={faHome} className="homeIcon" />
          </a>

          <div className="fresh_bar">
            <input type="text" placeholder="Search..." className="fresh_bar_input" />
            <i class="fas fa-magnifying-glass fresh_glass"></i>
          </div>
          
          <FoodCart />
        </header>
      </div>

      <section className="main-category">

        <div className="fresh-list">
          <h2 className='fresh_page_heading'>Product Categories</h2>
          <ul className="fresh_category">
            <a href="#shop" className='fresh_link'><li>All</li></a>
            <a href="#shop" className='fresh_link'><li>Fruits & Vegetables</li></a>
            <a href="#shop" className='fresh_link'><li>Grains & Cereals</li></a>
            <a href="#shop" className='fresh_link'><li>Spices</li></a>
            <a href="#shop" className='fresh_link'><li>Tubers & Roots</li></a>
            <a href="#shop" className='fresh_link'><li>Meat & Poultry</li></a>
            <a href="#shop" className='fresh_link'><li>Dairy & Eggs</li></a>
            <a href="#shop" className='fresh_link'><li>Sea Foods & Fish</li></a>
          </ul>
        </div>

        <div className="category-grid">
          <h2>Discover Our Selection</h2>
          {Object.keys(groupedFoods).map((category) => (
            <div key={category} className="category">
              <h3>{category}</h3>
              <div className="food-grid">
                {groupedFoods[category].map((food) => (
                  <FoodCard key={food._id} food={food} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="special-offers" className="fresh-page-offers-section"> {/* Added ID here */}
        <h2 className="fresh-page-offers-title">Special Offers & Discounts</h2>
        <div className="offer-page-grid">
          {discountedFoods.length > 0 ? (
            discountedFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))
          ) : (
            <p>No special offers available at the moment.</p>
          )}
        </div>
      </section>

      <section className="wholesale">
        <h2 className='fresh-wholesale-title'>Wholesale & Bulk Orders</h2>
        <p className='fresh-wholesale-para'>Looking for bulk purchases? Contact us for exclusive wholesale prices and offers.</p>
        <a href="#contact" className="wholesale-cta-button">Get a Quote</a>
      </section>

      <FooterComponent />
    </div>
  );
};

export default LandingFreshFood;
