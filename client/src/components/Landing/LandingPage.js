import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import DishCard from '../Menu/DishCard';
import RestaurantCard from '../Menu/RestaurantCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import OrderTrackingModal from '../Tracking/OrderTrackingModal';
import SearchBar from './SearchBar';
import SpecialOrderModal from '../SpecialOrder/SpecialOrderModal';
// import FoodCard from '../FreshFood/FoodCard';
import NavBar from '../Header/navbar';
import Testimonials from '../Landing/LandingTestimonial';
import FooterComponent from '../Landing/LandingFooter';
import FoodCardLand from '../FreshFood/FoodCardLand';
import DishCardLand from '../Menu/DishCardLand';
import InstallPrompt from '../Header/InstallPrompt';




import foodImg from '../../assets/images/flying-fried-chicken-with-bucket-cartoon.png';
import cateringImg from '../../assets/images/cooking-people-colored-composition.png';
import specialOrderImg from '../../assets/images/abstract-star-burst-with-rays-flare.png';
import conferencingImg from '../../assets/images/people-business-meeting-office-conference-room-concept-teamwork-communication-company-brainstorming-discussion-team-vector-flat-illustration-people-with-speech-bubbles.png';
import trackOrderImg from '../../assets/images/delivery-boy-picks-up-parcel-from-online-store-sending-customer-with-location-application-by-motorcycle-vector-illustration.png';
import freshFoodImg from '../../assets/images/vegetables-concept-illustration.png';
import serviceProviderImg from '../../assets/images/service_Provider.png';
import userPersonImg from '../../assets/images/userPerson.png';
import deliveryParsonImg from '../../assets/images/deliveryPerason.png';
import profileImg from '../../assets/images/Eliud.jpg';
import profileImg2 from '../../assets/images/mzeepassport.JPG';


const LandingPage = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topRatedRestaurants, setTopRatedRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [specialOrderModalOpen, setSpecialOrderModalOpen] = useState(false);
    const [discountedFoods, setDiscountedFoods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);


    const handleSearch = async () => {
        try {
            const response = await axios.get(`${config.backendUrl}/api/universal-search?q=${searchTerm}`);
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    useEffect(() => {
        const fetchDiscountedDishes = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/discounted-dishes`);
                const fetchedDishes = response.data.dishes || [];

                const discountedDishes = fetchedDishes.filter(dish => dish.discount && dish.discount > 0).slice(0, 5);

                setDishes(discountedDishes);
            } catch (error) {
                console.error('Error fetching discounted dishes:', error);
            }
        };

        const fetchDiscountedFoods = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/discounts`);
                // console.log("Full response:", response.data); 
                const fetchedFoods = response.data;
                const discountedFoods = fetchedFoods.slice(0, 5);
                setDiscountedFoods(discountedFoods);
            } catch (error) {
                console.error('Error fetching discounted foods:', error);
            }
        };

        fetchDiscountedDishes();
        fetchDiscountedFoods();
    }, []);

    useEffect(() => {
        const fetchTopRatedRestaurants = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/dishes-and-restaurants`);
                // console.log('Restaurants response:', response.data);
                const restaurants = response.data.restaurants || [];

                const topRated = [...restaurants].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
                setTopRatedRestaurants(topRated);
            } catch (error) {
                console.error('Error fetching top-rated restaurants:', error);
            }
        };

        fetchTopRatedRestaurants();
    }, []);

    const getTopRatedDishes = () => {
        return [...dishes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);
    };

    const handleMouseOver = () => {
        setDropdownOpen(true);
    };

    const handleMouseOut = () => {
        setDropdownOpen(false);
    };

    const selectOption = () => {
        setDropdownOpen(false);
    };

    const openModal = () => {
        setIsModalOpen(true)
    };

    const closeModal = () => {
        setIsModalOpen(false)
    };

    const openSpecialOrderModal = () => {
        setSpecialOrderModalOpen(true);
    };

    const closeSpecialOrderModal = () => {
        setSpecialOrderModalOpen(false);
    };

    return (
        <div className="containerDiv">
            {/* <NavBar/> */}
            {/* header section - logo, searchBar, signIn & logIn, slogan, services */}
            <div className="logo-CTA">
                <div className="logoDiv">
                    <h2 className="land_logo">Anyoka Eats</h2>
                </div>

                <div className="signCta_div">
                    <Link to="/sign-up-sign-in" className="landing_sign">Log In</Link>
                </div>
            </div>
            <section className="headerSection">
                {/* logo */}
                {/* <div className="logo-CTA">
                    <div className="logoDiv">
                        <h2 className="land_logo">Anyoka Eats</h2>
                    </div>

                    <div className="signCta_div">
                        <Link to="/sign-up-sign-in" className="landing_sign">Log In</Link>
                    </div>
                </div> */}

                {/* searchBar & services */}
                <div className="services-serchBar">
                    <SearchBar /><InstallPrompt />


                    {/* welcome message/slogan */}
                    <div className="services_slogan">
                        <div className="slogan">
                            <p className="sloganParagraph">Best services at your own comfort</p>
                        </div>

                        {/* services offered */}
                        <div className="services">
                            {/* Food */}
                            <Link to="/menu">
                                <div id="foodService" className="serviceDiv">
                                    <img src={foodImg} alt="Food" className="serviceImg" />
                                    <p>Food</p>
                                </div>
                            </Link>

                            {/* Outside Catering */}
                            {/* <Link to={'/outside-catering'}> */}
                                <div id="disabled" className="serviceDiv">
                                    <img src={cateringImg} alt="Outside Catering" className="serviceImg" />
                                    <p>Outside Catering</p>
                                </div>
                            {/* </Link> */}

                            {/* Special Order */}
                            <div id="specialOrderService" className="serviceDiv">
                                <img src={specialOrderImg} alt="Special Order" className="serviceImg" onClick={openSpecialOrderModal} />
                                <p>Special Order</p>
                            </div>

                            {/* More */}
                            <Link to={'/user'}>
                                <div id="moreServices" className="serviceDiv">
                                    <FontAwesomeIcon icon={faPlusSquare} className="faIcons fa-7x" />
                                    <p>More</p>
                                </div>
                            </Link>

                            {/* Conferencing & Meeting */}
                            {/* <Link to={'/conferences'}> */}
                                <div id="disabled" className="serviceDiv">
                                    <img src={conferencingImg} alt="Conferencing & Meeting" className="serviceImg" />
                                    <p>Conference & Meeting</p>
                                </div>
                            {/* </Link> */}

                            {/* Track Your Order */}

                            <div id="trackOrder" className="serviceDiv" onClick={openModal}>
                                <img src={trackOrderImg} alt="Track Your Order" className="serviceImg" />
                                <p>Track Your Order</p>
                            </div>

                            {/* Fresh Foods */}
                            <Link to={'freshfood'}>
                                <div id="freshFoodService" className="serviceDiv">
                                    <img src={freshFoodImg} alt="Fresh Foods" className="serviceImg" />
                                    <p>Fresh Foods</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* offers section */}
            <section className="offersSection">
                {/* offer title and offer search bar */}
                <div className="title-offerSearch">
                    <div className="title">
                        <h2 className='offerTitle'>Offers</h2>
                    </div>
                </div>

                <div className="category-dispaly">
                    {/* offer categories */}
                    <div className="offerNavContainer">
                        <div className="offerNav">
                            <button className="categories allBtn">All</button>

                            <button className="categories categoryBtn" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                                Categories
                            </button>

                            {dropdownOpen && (
                                <div className="dropdown-content" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                                    <a href="#Food" onClick={selectOption}>Food</a>
                                    <a href="#Special_Orders" onClick={selectOption}>Special Orders</a>
                                    <a href="#Outside_Catering" onClick={selectOption}>Outside Catering</a>
                                    <a href="#Conferencing_&_Meeting" onClick={selectOption}>Conferencing & Meeting</a>
                                    <a href="#Fresh_Foods" onClick={selectOption}>Fresh Foods</a>
                                </div>
                            )}
                        </div>

                        <div className="search-container">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search for any offer!!!"
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                            <a href="#" className="search-btn" onClick={handleSearch}>
                                <FontAwesomeIcon icon={faSearch} />
                            </a>


                            {/* Display Search Results */}
                            {searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map((result, index) => (
                                        <div key={index} className="search-result-item">
                                            <a href={`/${result.type}/${result.dishCode}`} className="search-result-item-a">
                                                {result.dishName && result.restaurant}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="offers-container">
                        {/* offer display */}
                        
                            {dishes.length > 0 ? (
                                <div>
                                    <div className="offerDisplay">
                                        {dishes.map(dish => (
                                            <DishCardLand key={dish.dishCode} dish={dish} source="offers" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p>No discounted dishes available at the moment. Please check back later.</p>
                            )}
                        


                        {/* Discounted Foods */}
                        {discountedFoods.length > 0 ? (
                            <div>
                                <div className="offerDisplay">
                                    {discountedFoods.map(food => (
                                        <FoodCardLand key={food.foodCode} food={food} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p>No discounted foods available at the moment. Keep checking for updates.</p>
                        )}

                    </div>
                </div>
            </section>

            {/* featured section */}
            <section className="featuredSection">
                <div className='divHotel divFeatured'>
                    {/* hotels heading */}
                    <div className="FeaturedDiv">
                        <h2 className="FeaturedHeading">Featured Hotels</h2>
                    </div>
                 
                    <div className="DishCards">
                        {topRatedRestaurants && topRatedRestaurants.length > 0 ? (
                            topRatedRestaurants.map((restaurant, index) => (
                                <RestaurantCard key={index} restaurant={restaurant} />
                            ))
                        ) : (
                            <p>No featured hotels available at the moment. Keep checking for the updates</p>
                        )}
                    </div>

                </div>

                <div className='divFood divFeatured'>
                    {/* Food heading */}
                    <div className="FeaturedDiv">
                        <h2 className="FeaturedHeading">Featured Food</h2>
                    </div>

                    {/* Food features */}
                    <div className="featuredFood featured">
                        {getTopRatedDishes().length > 0 ? (
                            getTopRatedDishes().map(dish => (
                                <DishCardLand key={dish.dishCode} dish={dish} source="featured" />
                            ))
                        ) : (
                            <p>No featured dishes available at the moment. Please check back later.</p>
                        )}
                    </div>

                </div>
            </section>

            <section className="join_team_section">
                <div className="join_team_div">
                    {/* <!-- PARAGRAPH  DIV --> */}
                    <div className="paragraph_div">
                        <h3 className="join_team_heading">
                            Join our ever evolving and  growing community as :
                        </h3>
                    </div>

                    {/* <!-- JOIN TEAM GRID CHOICES --> */}
                    <div className="join_team_grid_div">
                        <div className="join_team_choices">
                            <h3 className="join_title">Service Provider</h3>

                            <p className="join_explanation">Register your hotel, catering  or fresh food bussiness offer services</p>

                            {/* <!-- IMAGE DIV AND IMAGE --> */}
                            <div className="join_team_image_div">
                                <img src={serviceProviderImg} alt="Service Provider" className="join_img" />
                            </div>

                            {/* <!-- SIGN UP BUTTON --> */}
                            <button className="signup">Sign Up</button>
                        </div>

                        {/* <div className="join_team_choices">
                            <h3 className="join_title">User</h3>

                            <p className="join_explanation">Sign up and order food together with other services of your choice</p>

                            <div className="join_team_image_div">
                                <img src={userPersonImg} alt="User Person" className="join_img" />
                            </div>

                            <button className="signup">Sign Up</button>
                        </div> */}

                        <div className="join_team_choices">
                            <h3 className="join_title">Deliver Person</h3>

                            {/* <!-- <p className="join_explanation">Deliver food orders for people and earn</p> --> */}
                            <p className="join_explanation">Do you have a job.Fulfill delivery orders for customers and earn per trip</p>
                            {/* <!-- IMAGE DIV AND IMAGE --> */}
                            <div className="join_team_image_div">
                                <img src={deliveryParsonImg} alt="Delivery Person" className="join_img" />

                            </div>

                            {/* <!-- SIGN UP BUTTON --> */}
                            <button className="signup">Sign Up</button>
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- ABOUT US PAGE  --> */}
            <section className="about_us_section">
                <div className="about_us_div">
                    <div className="about_title_div">
                        <h3 className="about_us_title">About Us</h3>
                    </div>

                    <div className="about_us_content">

                        <div className="aboutUs_img_div aboutUs_img_div1">
                            <img src={profileImg} alt="Founder's Picture" className="about_us_img" />
                        </div>

                        <div className="aboutUs_img_div aboutUs_img_div2">
                            <img src={profileImg2} alt="Co-founder's Picture" className="about_us_img" />
                        </div>

                        <p className="aboutUs_paragraph">At Anyoka Eats, our mission is to transform the dining experience with a seamless, innovative online restaurant platform. Founded by a passionate team dedicated to enhancing food discovery and ordering, we combine cutting-edge technology with a love for great food.

                            Our platform brings together a diverse range of restaurants and cuisines, allowing users to effortlessly browse, order, and enjoy their favorite dishes. With features like real-time order tracking, personalized recommendations, and a user-friendly interface, we strive to make every meal memorable.

                            In addition to exceptional dining options, Anyoka Eats offers a variety of services to cater to your unique needs. Explore our conference and meeting spaces, perfect for business gatherings and special events. With detailed information on venue capacity, location, and available services, planning your next event has never been easier.

                            Our special ordering feature allows you to request customized meals that are made to your specific preferences, ensuring a home-cooked feel with every bite. We also offer a selection of fresh foods, delivered hot and ready to enjoy, to elevate your dining experience.

                            Our team, composed of experts in web development, user experience design, and culinary arts, works tirelessly to ensure that our platform not only meets but exceeds customer expectations. From dynamic dish updates to intuitive search functionalities, we are committed to providing an exceptional online dining experience.

                            Join us on this culinary journey and discover how Anyoka Eats is redefining the future of dining, events, and personalized food experiences.
                        </p>
                    </div>

                </div>
            </section>

            <Testimonials />
            <FooterComponent />

            <OrderTrackingModal isOpen={isModalOpen} onClose={closeModal} />
            {specialOrderModalOpen && <SpecialOrderModal closeModal={closeSpecialOrderModal} />}
        </div>
    );
};

export default LandingPage;