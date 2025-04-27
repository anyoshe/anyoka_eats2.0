import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CheckoutModal.module.css';
import { AuthContext } from '../../contexts/AuthContext';
import AuthPromptModal from './AuthPromptModal';
import MapSelector from './MapSelector';
import config from '../../config';
import DeliveryOptions from './DeliveryOptions';
import PaymentMethods from './PaymentMethods';

const CheckoutModal = ({ isOpen, onClose, cart, total }) => {
  const { user, setRedirectPath } = useContext(AuthContext);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isAddingNewLocation, setIsAddingNewLocation] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('platform'); // add to state
  const [isDeliveryFeeReady, setIsDeliveryFeeReady] = useState(false);
  const [isDeliveryCalculating, setIsDeliveryCalculating] = useState(false);

  const location = useLocation();

  const [formState, setFormState] = useState({
    town: user?.town || '',
    selectedLocation: user?.location || '',
    label: 'Home',
  });

  const [mapCenter, setMapCenter] = useState({ lat: -3.2192, lng: 40.1169 });
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(null); // Default


  const handleDeliveryChange = (fee, option, calculating) => {
    setDeliveryFee(fee);
    setDeliveryOption(option);
    setIsDeliveryCalculating(calculating);
    setIsDeliveryFeeReady(!calculating && fee !== null);
  };

  useEffect(() => {
    const fetchSavedLocations = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${config.backendUrl}/api/users/getSavedLocations/${user._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setSavedLocations(data.locations || []);
      } catch (error) {
        console.error('Error fetching saved locations:', error);
      }
    };

    if (isOpen) {
      fetchSavedLocations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!formState.town.trim()) return;
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${formState.town}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCenter({ lat, lng });
        }
      } catch (error) {
        console.error('Error fetching town coordinates:', error);
        alert('Unable to get coordinates for the town.');
      }
    };

    const debounce = setTimeout(fetchCoordinates, 500);
    return () => clearTimeout(debounce);
  }, [formState.town]);

  if (!isOpen) return null;

  if (!user && !showAuthPrompt) {
    setRedirectPath(location.pathname);
    setShowAuthPrompt(true);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormState((prev) => ({ ...prev, selectedLocation: location }));
  };

  
  const handleSaveLocation = async () => {
    if (!formState.selectedLocation.trim() || !formState.town.trim()) {
      alert('Please enter both a town and pin your location.');
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/users/addSavedLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          locationData: {
            label: formState.label,
            town: formState.town,
            location: formState.selectedLocation,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save location');
      alert('Location saved successfully!');
      setIsEditingLocation(false);
    } catch (error) {
      console.error('Error saving location:', error);
      alert('There was an error saving your location.');
    }
  };

  const handlePayment = (method) => {
    alert(`Proceeding with ${method} payment...`);
  };

  return (
    <div className={styles.checkoutModalBackdrop}>
      <div className={styles.checkoutModalContent}>
        <h2 className={styles.checkoutModalH2}>Confirm Your Order</h2>

        {user ? (
          <>
            <div className={styles.customerDetails}>
              <p><strong>Name: <br></br> </strong> {user.names}</p>
              <p><strong>Phone: <br></br> </strong> {user.phoneNumber}</p>
              <p><strong>Town: <br></br> </strong> {formState.town}</p>
              <p><strong>Delivery Location: <br></br> </strong> {formState.selectedLocation}</p>

              <button onClick={() => setIsEditingLocation(!isEditingLocation)} className={styles.changeLocationBtn}>
                {isEditingLocation ? 'Cancel Edit' : 'Change Delivery Location'}
              </button>

              {isEditingLocation && (
                <>
                  {!isAddingNewLocation ? (
                    <>
                      {savedLocations.length > 0 ? (
                        <>
                          <select
                            onChange={(e) => {
                              const selected = JSON.parse(e.target.value);
                              setFormState({
                                ...formState,
                                town: selected.town,
                                selectedLocation: selected.location,
                                label: selected.label,
                              });
                              setIsEditingLocation(false);
                            }}
                            className={styles.locationDropdown}
                          >
                            <option>Select a saved location</option>
                            {savedLocations.map((loc, idx) => (
                              <option key={idx} value={JSON.stringify(loc)}>
                                {loc.label} - {loc.town}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => setIsAddingNewLocation(true)}>
                            + Add New Location
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No saved locations found.</p>
                          <button onClick={() => setIsAddingNewLocation(true)}>
                            + Add New Location
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="town"
                        placeholder="Enter town"
                        value={formState.town}
                        onChange={handleInputChange}
                        className={styles.locationInput}
                      />

                      <select
                        name="label"
                        value={formState.label}
                        onChange={handleInputChange}
                        className={styles.labelDropdown}
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>

                      <MapSelector
                        onLocationSelect={handleLocationSelect}
                        center={mapCenter}
                      />

                      <p>Selected Location: {formState.selectedLocation || 'None'}</p>

                      <button onClick={handleSaveLocation}>Save Location</button>
                      <button onClick={() => setIsAddingNewLocation(false)}>Cancel</button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className={styles.orderSummary}>
              <h4 className={styles.orderSummaryH4}>Order Details:</h4>

              <div className={styles.orderItemDiv}>
                {cart.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    {item.name} x {item.quantity || 1} = KSH {item.price * (item.quantity || 1)}
                  </div>
                ))}
              </div>
              <div className={`${styles.orderItem} ${styles.total}`}>
                <strong>Total:</strong> KSH {total + deliveryFee}
              </div>

              <DeliveryOptions
                cart={cart}
                userLocation={formState.selectedLocation}
                deliveryTown={formState.town}
                onDeliveryOptionSelected={(fee, option) => {
                  setDeliveryFee(fee);
                  setDeliveryOption(option); 
                  setIsDeliveryFeeReady(option === 'own' || (option === 'platform' && fee > 0));
                }}
              />
            </div>

            <PaymentMethods
              cart={cart}
              total={total}
              deliveryFee={deliveryFee}
              deliveryOption={deliveryOption}
              deliveryTown={formState.town}
              isDeliveryFeeReady={isDeliveryFeeReady}
              deliveryLocation={formState.selectedLocation}
              clearCart={() => { /* clear context cart */ }}
              onSuccess={() => alert('Order placed!')}
              onError={msg => alert(`Order error: ${msg}`)}
            />
          </>
        ) : (
          <AuthPromptModal
            isOpen={showAuthPrompt}
            onRequestClose={() => {
              setShowAuthPrompt(false);
              onClose();
            }}
          />
        )}

        {/* <button className={styles.closeBtn} onClick={onClose}>Close</button> */}
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

      </div>
    </div>
  );
};

export default CheckoutModal;
