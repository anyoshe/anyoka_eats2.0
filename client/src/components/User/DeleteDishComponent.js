import React, { useState } from 'react';
import config from '../../config';

const DeleteDishComponent = () => {
  const [dishIdentifier, setDishIdentifier] = useState('');
  const [message, setMessage] = useState('');

  const deleteDish = async (identifier) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/dishes/${identifier}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);
      // Clear the field
      setDishIdentifier('');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to delete dish');
    }
  };

  const confirmDeleteDish = () => {
    if (!dishIdentifier) {
      alert('Please enter a valid dish code or name.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this dish?')) {
      deleteDish(dishIdentifier);
    }
  };

  return (
    <div className="deleteSearch">
      <div className="dishDetails">
        <label htmlFor="dishIdentifier">Delete Dish</label>
        <input
          type="text"
          id="dishIdentifier"
          placeholder="Dish Code or Name"
          value={dishIdentifier}
          onChange={(e) => setDishIdentifier(e.target.value)}
        />
        <button onClick={confirmDeleteDish}>Delete</button>
        <div id="dishDetailsContainer">{message}</div>
      </div>
    </div>
  );
};

export default DeleteDishComponent;
