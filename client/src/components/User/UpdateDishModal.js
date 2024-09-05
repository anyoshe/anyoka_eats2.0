import React, { useState } from 'react';
import config from '../../config';

const UpdateDishModal = ({ isOpen, onClose, onSubmit }) => {
  const [dishCode, setDishCode] = useState('');
  // const [dishDetails, setDishDetails] = useState({
    const initialDishDetails = {
      dishName: '',
      dishPrice: '',
      discount: '',
      discountedPrice: '',
      quantity: '',
      dishCategory: '',
      restaurant: '',
      dishDescription: '',
      image: null,
    };
    
  const [dishDetails, setDishDetails] = useState(initialDishDetails);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDishDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setDishDetails((prevDetails) => ({
      ...prevDetails,
      image: event.target.files[0],
    }));
  };

  const calculateDiscountedPrice = () => {
    const discount = parseFloat(dishDetails.discount) || 0;
    const dishPrice = parseFloat(dishDetails.dishPrice) || 0;
    if (discount > 0 && dishPrice > 0) {
      return dishPrice - (dishPrice * discount / 100);
    }
    return dishPrice;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isFetching) {
      if (!dishCode) {
        setMessage('Dish code is required to fetch details.');
        return;
      }

      try {
        const response = await fetch(`${config.backendUrl}/api/dishes/${dishCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch dish details');
        }

        setDishDetails({
          dishName: data.dishName || '',
          dishPrice: data.dishPrice || '',
          discount: data.discount || '',
          // discountedPrice: data.discountedPrice || '',
          quantity: data.quantity || '',
          dishCategory: data.dishCategory || '',
          restaurant: data.restaurant || '',
          dishDescription: data.dishDescription || '',
          image: null,
        });

        setMessage('Dish details fetched successfully. Please proceed with modifications.');
        setIsFetching(false);
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'An error occurred');
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('dishName', dishDetails.dishName);
        formData.append('dishPrice', dishDetails.dishPrice);
        formData.append('discount', dishDetails.discount);
        // formData.append('discountedPrice', calculateDiscountedPrice());
        formData.append('quantity', dishDetails.quantity);
        formData.append('dishCategory', dishDetails.dishCategory);
        formData.append('restaurant', dishDetails.restaurant);
        formData.append('dishDescription', dishDetails.dishDescription);
        if (dishDetails.image) {
          formData.append('image', dishDetails.image);
        }

        const putResponse = await fetch(`${config.backendUrl}/api/dishes/${dishCode}`, {
          method: 'PUT',
          body: formData,
        });
        const putData = await putResponse.json();

        if (!putResponse.ok) {
          throw new Error(putData.message || 'Failed to update dish');
        }

        setMessage('Dish updated successfully');

          // Reset the form fields after successful update
        setTimeout(() => {
          setDishCode('');
          setDishDetails(initialDishDetails);
          setMessage('');
          setIsFetching(true);
          onSubmit();
          onClose();
        }, 2000);
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'An error occurred');
      }
    }
  };

  return isOpen ? (
    <div className="modal-container">
      <div className="modal">
        <div className="modal-content">
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
          <form onSubmit={handleSubmit} enctype="multipart/form-data">
            <h4>Update Your Dishes!</h4>
            <div className="message-container">{message}</div>

            <label htmlFor="dishCode">Dish Code: </label>
            <input
              type="text"
              id="dishCode"
              name="dishCode"
              value={dishCode}
              onChange={(e) => setDishCode(e.target.value)}
              required
            />

            <label htmlFor="dishName">New Dish Name: </label>
            <input
              type="text"
              id="updateDishName"
              name="dishName"
              value={dishDetails.dishName}
              onChange={handleInputChange}
            />

            <label htmlFor="dishPrice">New Dish Price: </label>
            <input
              type="number"
              id="updateDishPrice"
              name="dishPrice"
              value={dishDetails.dishPrice}
              onChange={handleInputChange}
            />

           <label htmlFor="discount">Discount (%): </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={dishDetails.discount}
              onChange={handleInputChange}
            />

            {/* <label htmlFor="discountedPrice">Discounted Price: </label>
            <input
              type="number"
              id="discountedPrice"
              name="discountedPrice"
              value={calculateDiscountedPrice()}
              readOnly
            /> */}

            <label htmlFor="quantity">New Quantity: </label>
            <input
              type="number"
              id="updateQuantity"
              name="quantity"
              value={dishDetails.quantity}
              onChange={handleInputChange}
            />

            <label htmlFor="dishCategory" className="label">
              New Dish Category :
            </label>
            <input
              type="text"
              name="dishCategory"
              id="updateDishCategory"
              value={dishDetails.dishCategory}
              onChange={handleInputChange}
            />

            <label htmlFor="restaurant" className="label">
              New Restaurant :
            </label>
            <input
              type="text"
              name="restaurant"
              id="updateRestaurant"
              value={dishDetails.restaurant}
              onChange={handleInputChange}
            />

            <label htmlFor="dishDescription">New Dish Description: </label>
            <input
              type="text"
              id="updateDishDescription"
              name="dishDescription"
              value={dishDetails.dishDescription}
              onChange={handleInputChange}
            />

            <label htmlFor="image" className="label">
              Dish Image :
            </label>
            <input
              type="file"
              name="image"
              id="imageInput"
              className="input"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleImageChange}
            />
            <div id="updateImagePreview"></div>

            <button type="submit" className="updateDish" id="submitButton">
              {isFetching ? 'Fetch Dish Details' : 'Update Dish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default UpdateDishModal;
