// import React from 'react';
// import './FoodCardWrapper.css';
// import config from '../../config';

// const FoodCardWrapper = ({ food }) => {
//     const imageUrl = `${config.backendUrl}${food.imageUrl}`;
//     return (
//         <li className="food-card">
//             {imageUrl && (
//         <div className="food-image-wrapper1">
//           <img src={imageUrl} alt={food.foodName} className="food-image" />
//           {food.discount > 0 && (
//             <span className="discounted-price-circle1">
//               Now Kes.{(food.discountedPrice).toFixed(2)}
//             </span>
//           )}
//         </div>
//       )}
//             <h3>{food.foodName}</h3>
//             <p>{food.foodDescription}</p>
//             <p>Was Kes: {food.foodPrice * 1.2}</p>
//             <p>Discount: {food.discount}%</p>
//         </li>
//     );
// };


// export default FoodCardWrapper;

import React from 'react';

import axios from 'axios';
import config from '../../config';
export const calculateDistance = async (vendorAddresses) => {
  const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  
  // Filter out invalid addresses
  const validAddresses = vendorAddresses.filter(address => 
    typeof address === 'object' && address !== null &&
    'lat' in address && 'lng' in address &&
    typeof address.lat === 'number' && typeof address.lng === 'number'
  );

  console.log('Valid addresses:', validAddresses);

  if (validAddresses.length === 0) {
    console.warn('No valid addresses found');
    return 0;
  }

  const originString = validAddresses.map(a => `${a.lat},${a.lng}`).join('|');
  const destinationString = originString;

  try {
    const response = await axios.get(`${config.backendUrl}/api/distance`, {
      params: {
        origin: originString,
        destination: destinationString,
        key: googleApiKey
      }
    });

    if (!response.data || !response.data.rows || response.data.rows.length === 0) {
      throw new Error('Invalid Google Maps API response');
    }

    const validElements = response.data.rows[0].elements.filter(element => element.status === 'OK');

    if (validElements.length > 0) {
      const distance = validElements[0].distance.text;
      console.log(`Total distance: ${distance}`);
      return parseFloat(distance.replace(/[^0-9.]/g, '')); // Remove commas and convert to float
    } else {
      console.warn('No valid distances found');
      return 0;
    }
  } catch (error) {
    console.error('Error calculating total distance:', error);
    console.error('Vendor addresses:', vendorAddresses);
    return 0;
  }
};
