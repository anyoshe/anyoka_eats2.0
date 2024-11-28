import React from 'react';
import axios from 'axios';
import config from '../../config';

const DeleteFoodComponent = ({ foodCode, onDelete }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`${config.backendUrl}/api/foods/${foodCode}`);
      onDelete(foodCode);
      console.log('Food deleted successfully');
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete Food</button>
    </div>
  );
};

export default DeleteFoodComponent;
