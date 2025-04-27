import React, { useEffect, useState, useRef } from 'react';
import config from '../../config';
import styles from './DeliveryOptions.module.css';


const DELIVERY_CONFIG = {
  baseFee: 100,
  perKmFee: 25,
  freeLimitKm: 4,
  extraShopHandlingFee: 30,
  interTownFee: 200,
};

const DeliveryOptions = ({ cart, userLocation, deliveryTown, onDeliveryOptionSelected, handleDeliveryChange }) => {
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState([]);
  const [option, setOption] = useState('platform');
  const [calculating, setCalculating] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const latestRequestRef = useRef(0);


  const geocodeAddress = async (address) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;

      const addressComponents = data.results[0].address_components;
      const townComponent = addressComponents.find(c =>
        c.types.includes('locality') || c.types.includes('sublocality') || c.types.includes('administrative_area_level_2')
      );

      const townName = townComponent ? townComponent.long_name : null;

      return {
        coords: `${lat},${lng}`,
        town: townName,
      };
    } else {
      throw new Error(`Geocoding failed for: ${address}`);
    }
  };

  const calculateDeliveryFee = async () => {
    if (!userLocation || cart.length === 0) return;
  
    const currentRequestId = requestId + 1;
    setRequestId(currentRequestId);
    latestRequestRef.current = currentRequestId;
   
    setCalculating(true); // START calculating
  onDeliveryOptionSelected(null, 'platform', true);

    const shopAddresses = cart.map(item => item.shop.location);
    const uniqueShops = [...new Set(shopAddresses)];
  
    try {
      const shopCoordsList = await Promise.all(uniqueShops.map(addr => geocodeAddress(addr)));
      const userGeo = await geocodeAddress(userLocation);
      const userCoords = userGeo.coords;
      const deliveryTownDetected = userGeo.town?.toLowerCase();
  
      const origins = shopCoordsList.map(c => c.coords).join('|');
      const response = await fetch(`${config.backendUrl}/api/distance?origins=${origins}&destinations=${userCoords}`);
      const data = await response.json();
  
      if (currentRequestId !== latestRequestRef.current) {
        console.log('Ignored stale delivery calculation.');
        return;
      }
  
      if (data.status !== 'OK') throw new Error('Failed to fetch distance');
  
      const elements = data.rows.map(row => row.elements[0]);
  
      let maxDistanceInKm = null;
      elements.forEach((el, idx) => {
        if (el.status === 'OK' && el.distance?.value != null) {
          const distanceInKm = el.distance.value / 1000;
          if (maxDistanceInKm === null || distanceInKm > maxDistanceInKm) {
            maxDistanceInKm = distanceInKm;
          }
        } else {
          console.warn(`Invalid distance for shop at index ${idx}:`, el);
        }
      });
  
      if (maxDistanceInKm === null) throw new Error('Could not determine any valid shop-to-user distances.');
  
      const extraKm = Math.max(0, maxDistanceInKm - DELIVERY_CONFIG.freeLimitKm);
      const baseDeliveryFee = DELIVERY_CONFIG.baseFee + (extraKm * DELIVERY_CONFIG.perKmFee);
      let totalFee = baseDeliveryFee;
  
      if (uniqueShops.length > 1) {
        totalFee += (uniqueShops.length - 1) * DELIVERY_CONFIG.extraShopHandlingFee;
      }
  
      const shopTowns = await Promise.all(uniqueShops.map(async (addr) => {
        const result = await geocodeAddress(addr);
        return result.town?.toLowerCase();
      }));
  
      const anyDifferentTown = shopTowns.some(town =>
        town && deliveryTownDetected && town !== deliveryTownDetected
      );
  
      if (anyDifferentTown) {
        totalFee += DELIVERY_CONFIG.interTownFee;
      }
  
      const details = elements.map((el, idx) => {
        if (el.status === 'OK' && el.distance?.value != null) {
          const distanceInKm = el.distance.value / 1000;
          return {
            shop: uniqueShops[idx],
            distance: distanceInKm.toFixed(2),
            fee: idx === 0
              ? baseDeliveryFee.toFixed(2)
              : `Handled (KSH ${DELIVERY_CONFIG.extraShopHandlingFee})`,
          };
        } else {
          return {
            shop: uniqueShops[idx],
            distance: 'N/A',
            fee: 'Unavailable',
          };
        }
      });
  
      // Final safety check before updating state
      if (currentRequestId === latestRequestRef.current) {
        setDistanceInfo(details);
        const finalCost = Math.ceil(totalFee);
        setDeliveryFee(finalCost);
        onDeliveryOptionSelected(finalCost, 'platform', false);
      }
  
    } catch (error) {
      if (currentRequestId === latestRequestRef.current) {
        console.error('Error calculating delivery:', error);
        alert('Could not calculate delivery cost. Try again.');
        onDeliveryOptionSelected(null, 'platform', false);
      }
    } finally {
      if (currentRequestId === latestRequestRef.current) {
        setCalculating(false); // FINISHED
      }
    }
  };

  useEffect(() => {
    if (option === 'platform') {
      calculateDeliveryFee();
    } else {
      setDeliveryFee(0);
      setDistanceInfo([]);
      setCalculating(false);
      onDeliveryOptionSelected(0, 'own', false); // notify parent
    }
  }, [option, userLocation]);
  

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.heading}>Delivery Options</h4>

      <div className={styles.deliveryOptions}>
        
        <label className={styles.option}>
            <input
              type="radio"
              value="platform"
              checked={option === 'platform'}
              onChange={() => setOption('platform')}
            />
            Use our Delivery Service
          </label>

          <label className={styles.option}>
            <input
              type="radio"
              value="own"
              checked={option === 'own'}
              onChange={() => setOption('own')}
            />
            I’ll Send My Own Delivery Person
          </label>
      </div>

      {option === 'platform' && (
        <div className={styles.deliveryBreakdown}>
          <h5 className={styles.deliveryBreakdownH5}>Delivery Cost: KSH {deliveryFee}</h5>
          {distanceInfo.map((info, idx) => (
            <div key={idx} className={styles.deliveryLine}>
              From: {info.shop} — {info.distance} km → KSH {info.fee}
            </div>
          ))}
        </div>
      )}
    </div>

  );
};

export default DeliveryOptions;
