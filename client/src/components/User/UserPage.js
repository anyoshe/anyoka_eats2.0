import React, { useState, useEffect } from 'react';
import AddDishModal from './AddDishModal';
import UpdateDishModal from './UpdateDishModal';
import DeleteDishComponent from './DeleteDishComponent';
import ConferenceForm from './ConferenceForm';
import UndeliveredOrders from './UndeliveredOrders';
import DeliveredOrders from './DeliveredOrders';
import UpdateConference from './UpdateConference';
import AddFood from '../FreshFood/AddFood';
import UpdateFood from '../FreshFood/UpdateFood';
import config from '../../config';
import axios from 'axios';
import SearchBar from './SearchBar';
import './UserPage.css';

const UserPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isUpdateFoodModalOpen, setIsUpdateFoodModalOpen] = useState(false);
  const [foodCodeToUpdate, setFoodCodeToUpdate] = useState(null);
  const [venueName, setVenueName] = useState(null);
  const [showUpdateConference, setShowUpdateConference] = useState(false);
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(`${config.backendUrl}/api/foods`);
        setFoods(response.data);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    fetchFoods();
  }, []);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const openFoodModal = () => {
    setIsFoodModalOpen(true);
  };

  const closeFoodModal = () => {
    setIsFoodModalOpen(false);
  };

  const openUpdateFoodModal = (foodCode) => {
    setFoodCodeToUpdate(foodCode);
    setIsUpdateFoodModalOpen(true);
  };

  const closeUpdateFoodModal = () => {
    setFoodCodeToUpdate(null);
    setIsUpdateFoodModalOpen(false);
  };
  const handleFormSubmit = () => {
    console.log('Form submitted successfully');
  };

  const handleUpdateConferenceClick = () => {
    const name = prompt('Please enter the venue name:');
    if (name) {
      setVenueName(name);
      setShowUpdateConference(true);
    }
  };

  const deleteFood = async (foodCode) => {
    try {
      await axios.delete(`${config.backendUrl}/api/foods/${foodCode}`);
      setFoods(foods.filter(food => food.foodCode !== foodCode));
      console.log('Food deleted successfully');
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <div>
      <nav className="navs">
        <div className="navs-container">
          <div className="logo"><img src="../assets/online Chefs (1).png" width="85" height="55" alt="Logo" /></div>
          <div className="Kitchen">
            <h3>OUR KITCHEN</h3>
          </div>

          <a href="./../customer/index.html">Go Home</a>
          <div className="toggle-button">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>
      <div className="page-content">
        <div className="dishControl">
          <h4>MENU CONTROLS</h4>
          <SearchBar />
          <button id="openModalBtn" onClick={openModal}>Add New Dishes</button>
          <button id="updateModalBtn" onClick={openUpdateModal}>Update Your Dishes</button>
          <button id="openFoodModalBtn" onClick={openFoodModal}>Add Fresh Foods</button>
          <button onClick={handleUpdateConferenceClick}>Update Conference</button>
        </div>
      </div>

      <div>
        {foods.map((food) => {
          // Define image URL dynamically
          const imageUrl = `${config.backendUrl}${food.imageUrl}`;

          return (
            <div key={food.foodCode} className='foodList'>
              <img src={imageUrl} alt={food.foodName} className="food-image" />
              <h3>{food.foodName}</h3>
              <p>{food.foodDescription}</p>
              <p>{food.foodPrice}</p>
              <button onClick={() => openUpdateFoodModal(food.foodCode)}>Edit Food</button>
              <button onClick={() => deleteFood(food.foodCode)}>Delete Food</button>
            </div>
          );
        })}
      </div>

      {venueName && showUpdateConference ? (
        <UpdateConference venueName={venueName} />
      ) : (
        <>
          <AddDishModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleFormSubmit} />
          <UpdateDishModal isOpen={isUpdateModalOpen} onClose={closeUpdateModal} onSubmit={handleFormSubmit} />
          {isFoodModalOpen && <AddFood />}
          {isUpdateFoodModalOpen && foodCodeToUpdate && <UpdateFood foodCode={foodCodeToUpdate} onClose={closeUpdateFoodModal} />}
          <DeleteDishComponent />
          <ConferenceForm />
          <DeliveredOrders />
          <div id="messageContainer" className="message"></div>
          <UndeliveredOrders />
        </>
      )}
    </div>
  );
};

export default UserPage;


