import React, { useEffect, useState, useRef } from 'react';
import config from '../../config';
import styles from './DeliveryOptions.module.css';


const DELIVERY_CONFIG = {
  baseFee: 100,
  perKmFee: 25,
  freeLimitKm: 4,
  extraShopHandlingFee: 0,
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
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== 'OK') {
    }

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
  } catch (error) {
    throw error;
  }
};

  const calculateDeliveryFee = async () => {
  if (!userLocation || cart.length === 0) return;

  const currentRequestId = requestId + 1;
  setRequestId(currentRequestId);
  latestRequestRef.current = currentRequestId;

  setCalculating(true);
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

    if (currentRequestId !== latestRequestRef.current) return;
    if (data.status !== 'OK') throw new Error('Failed to fetch distance');

    const elements = data.rows.map(row => row.elements[0]);
    let maxDistanceInKm = null;

    elements.forEach((el, idx) => {
      if (el.status === 'OK' && el.distance?.value != null) {
        const distanceInKm = el.distance.value / 1000;
        if (maxDistanceInKm === null || distanceInKm > maxDistanceInKm) {
          maxDistanceInKm = distanceInKm;
        }
      }
    });

    if (maxDistanceInKm === null) throw new Error('No valid distances found.');
    // Save distance globally for PaymentMethods to access
    window.localStorage.setItem('latestDistanceKm', maxDistanceInKm);


    // ✅ Apply tiered pricing
    let totalFee;
    if (maxDistanceInKm <= 5) totalFee = 10;
    else if (maxDistanceInKm <= 50) totalFee = 100 + (10 * maxDistanceInKm);
    else if (maxDistanceInKm <= 150) totalFee = 500;
    else if (maxDistanceInKm <= 500) totalFee = 800;
    else totalFee = 1000;

    // Add handling for multiple shops
    if (uniqueShops.length > 1) {
      totalFee += (uniqueShops.length - 1) * DELIVERY_CONFIG.extraShopHandlingFee;
    }

    const details = elements.map((el, idx) => ({
      shop: uniqueShops[idx],
      distance:
        el.status === 'OK' && el.distance?.value != null
          ? (el.distance.value / 1000).toFixed(2)
          : 'N/A',
      fee: idx === 0
        ? Math.ceil(totalFee)
        : `Handled (KSH ${DELIVERY_CONFIG.extraShopHandlingFee})`,
    }));

    if (currentRequestId === latestRequestRef.current) {
      setDistanceInfo(details);
      setDeliveryFee(Math.ceil(totalFee));
      onDeliveryOptionSelected(Math.ceil(totalFee), 'platform', false);
    }
  } catch (error) {
    if (currentRequestId === latestRequestRef.current) {
      alert('Could not calculate delivery cost. Try again.');
      onDeliveryOptionSelected(null, 'platform', false);
    }
  } finally {
    if (currentRequestId === latestRequestRef.current) {
      setCalculating(false);
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
