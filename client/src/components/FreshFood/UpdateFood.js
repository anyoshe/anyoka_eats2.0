import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const UpdateFood = ({ foodCode, onClose }) => {
  const initialFoodDetails = {
    foodCode: '',
    foodName: '',
    quantity: 1,
    foodPrice: '',
    discount: '',
    discountedPrice: '',
    foodCategory: '',
    vendor: '',
    foodDescription: '',
    imageUrl: ''
  };

  const [foodDetails, setFoodDetails] = useState(initialFoodDetails);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFoodDetails = async () => {
      if (!foodCode) {
        setMessage('Invalid food code.');
        return;
      }

      try {
        const response = await axios.get(`${config.backendUrl}/api/food/${foodCode}`);
        setFoodDetails({
          ...response.data,
          discount: response.data.discount || '',
        });
      } catch (error) {
        console.error('Error fetching food details:', error);
        setMessage('Error fetching food details');
      }
    };

    fetchFoodDetails();
  }, [foodCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const calculateDiscountedPrice = () => {
    const discount = parseFloat(foodDetails.discount) || 0;
    const foodPrice = parseFloat(foodDetails.foodPrice) || 0;
    if (discount > 0 && foodPrice > 0) {
      return foodPrice - (foodPrice * discount / 100);
    }
    return foodPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('foodCode', foodDetails.foodCode);
    formData.append('foodName', foodDetails.foodName);
    formData.append('quantity', foodDetails.quantity);
    formData.append('foodPrice', foodDetails.foodPrice);
    formData.append('discount', foodDetails.discount);
    formData.append('discountedPrice', calculateDiscountedPrice());
    formData.append('foodCategory', foodDetails.foodCategory);
    formData.append('vendor', foodDetails.vendor);
    formData.append('foodDescription', foodDetails.foodDescription);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.put(`${config.backendUrl}/api/food/${foodCode}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Food updated successfully!');
      onClose(); 
    } catch (error) {
      setMessage('Error updating food. Please try again.');
      console.error('Error updating food:', error);
    }
  };

  return (
    <div>
      <h2>Update Food</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Food Code:</label>
          <input
            type="text"
            name="foodCode"
            value={foodDetails.foodCode}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div>
          <label>Food Name:</label>
          <input
            type="text"
            name="foodName"
            value={foodDetails.foodName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={foodDetails.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Food Price:</label>
          <input
            type="number"
            name="foodPrice"
            value={foodDetails.foodPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Discount (%):</label>
          <input
            type="number"
            name="discount"
            value={foodDetails.discount}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Discounted Price:</label>
          <input
            type="number"
            name="discountedPrice"
            value={calculateDiscountedPrice()}
            readOnly
          />
        </div>
        <div>
          <label>Food Category:</label>
          <input
            type="text"
            name="foodCategory"
            value={foodDetails.foodCategory}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Vendor:</label>
          <input
            type="text"
            name="vendor"
            value={foodDetails.vendor}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Food Description:</label>
          <textarea
            name="foodDescription"
            value={foodDetails.foodDescription}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Image:</label>
          <input
            type="file"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Update Food</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateFood;

