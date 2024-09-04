import React, { useState } from 'react';
import config from '../../config';
// import './User.css';

const AddDishModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    dishCode: '',
    dishName: '',
    quantity: '',
    dishPrice: '',
    dishCategory: '',
    restaurant: '',
    dishDescription: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    data.append('image', formData.image);
    data.append('dishCode', formData.dishCode);
    data.append('dishName', formData.dishName);
    data.append('quantity', formData.quantity);
    data.append('dishPrice', formData.dishPrice);
    data.append('dishCategory', formData.dishCategory);
    data.append('restaurant', formData.restaurant);
    data.append('dishDescription', formData.dishDescription);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${config.backendUrl}/api/dishes`, {
        method: 'POST',
        body: data,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add dish');
      }

      const responseData = await response.json();
      console.log('Success response data:', responseData);
      setMessage('Dish added successfully!');
      onSubmit();
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('Failed to add dish: Network error or server is unreachable.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return isOpen ? (
    <div className="modalContainer">
      <div className="modal">
        <div className="modal-content">
          <button type="button" onClick={onClose}>&times;</button>
          <form className="addDishForm" onSubmit={handleSubmit} encType="multipart/form-data">
            <h4>Add New Dish!</h4>
            <label htmlFor="dishCode">Dish Code:</label>
            <input type="text" name="dishCode" placeholder="Dish Code" id="dishCode" className="input" required onChange={handleInputChange} />

            <label htmlFor="dishName">Dish Name:</label>
            <input type="text" name="dishName" placeholder="Dish Name" id="dishName" className="input" required onChange={handleInputChange} />

            <label htmlFor="quantity">Quantity:</label>
            <input type="number" name="quantity" placeholder="Quantity" id="quantity" className="input" required onChange={handleInputChange} />

            <label htmlFor="dishPrice">Dish Price:</label>
            <input type="number" name="dishPrice" placeholder="Price Of Dish" id="dishPrice" className="input" required onChange={handleInputChange} />

            <label htmlFor="dishCategory">Dish Category:</label>
            <input type="text" name="dishCategory" placeholder="Category Of Dish" id="dishCategory" className="input" required onChange={handleInputChange} />

            <label htmlFor="restaurant">Restaurant:</label>
            <input type="text" name="restaurant" placeholder="Restaurant" id="restaurant" className="input" required onChange={handleInputChange} />

            <label htmlFor="dishDescription">Dish Description:</label>
            <input type="text" name="dishDescription" placeholder="Description Of Dish" id="dishDescription" className="input" required onChange={handleInputChange} />

            <label htmlFor="image">Dish Image:</label>
            <input type="file" name="image" id="imageInput" className="input" required onChange={handleImageChange} />

            <button type="submit" className="addButton">Add Dish</button>
          </form>
          {loading && <div id="loadingIndicator">Loading...</div>}
          {message && <div id="messageContainer" className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
        </div>
      </div>
    </div>
  ) : null;
};

export default AddDishModal;
