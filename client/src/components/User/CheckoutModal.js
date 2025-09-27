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
  const [deliveryOption, setDeliveryOption] = useState('platform');
  const [isDeliveryFeeReady, setIsDeliveryFeeReady] = useState(false);
  const [isDeliveryCalculating, setIsDeliveryCalculating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // For carousel functionality

  const location = useLocation();

  const [formState, setFormState] = useState({
    town: user?.town || '',
    selectedLocation: user?.location || '',
    label: 'Home',
  });

  const [mapCenter, setMapCenter] = useState({ lat: -3.2192, lng: 40.1169 });
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(!user);

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
      }
    };

    if (isOpen && user) {
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
        alert('Unable to get coordinates for the town.');
      }
    };

    const debounce = setTimeout(fetchCoordinates, 500);
    return () => clearTimeout(debounce);
  }, [formState.town]);

  useEffect(() => {
    if (isOpen && !user) {
      // Save full URL (path + query string)
      setRedirectPath(`${location.pathname}${location.search}`);
      setShowAuthPrompt(true);
    }
  }, [isOpen, user, location.pathname, location.search, setRedirectPath]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onRequestClose={() => {
          setShowAuthPrompt(false);
          onClose();
        }}
      />
    );
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
      const data = await response.json();
      setSavedLocations([...savedLocations, data.location]);
      alert('Location saved successfully!');
      setIsEditingLocation(false);
    } catch (error) {
      alert('There was an error saving your location.');
    }
  };

  // Carousel navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className={styles.checkoutModalBackdrop}>
      <div className={styles.checkoutModalContent}>
        <h2 className={styles.checkoutModalH2}>Confirm Your Order</h2>

        {/* Carousel for wide screens (1024px-2560px) */}
        <div className={styles.checkoutCarousel}>
          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${currentStep >= 1 ? (currentStep > 1 ? styles.completed : styles.active) : ''}`} onClick={() => goToStep(1)}></div>
            <div className={`${styles.stepDot} ${currentStep >= 2 ? (currentStep > 2 ? styles.completed : styles.active) : ''}`} onClick={() => goToStep(2)}></div>
            <div className={`${styles.stepDot} ${currentStep >= 3 ? (currentStep > 3 ? styles.completed : styles.active) : ''}`} onClick={() => goToStep(3)}></div>
          </div>

          {/* Step 1: Customer Details */}
          <div className={`${styles.stepContent} ${currentStep === 1 ? styles.active : ''}`}>
            <h3 className={styles.stepTitle}>Customer Details</h3>
            <div className={styles.customerDetails}>
              <p><strong>Name: </strong> {user.names || 'N/A'}</p>
              <p><strong>Phone: </strong> {user.phoneNumber || 'N/A'}</p>
              <p><strong>Town: </strong> {formState.town || 'N/A'}</p>
              <p><strong>Delivery Location: </strong> {formState.selectedLocation || 'None'}</p>

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
                            <option value="">Select a saved location</option>
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
          </div>

          {/* Step 2: Order Details */}
          <div className={`${styles.stepContent} ${currentStep === 2 ? styles.active : ''}`}>
            <h3 className={styles.stepTitle}>Order Details</h3>
            <div className={styles.orderSummary}>
              <h4 className={styles.orderSummaryH4}>Order Items:</h4>

              <div className={styles.orderItemDiv}>
                {cart.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    {item.name} x {item.quantity || 1} = KSH {(item.price * (item.quantity || 1)).toFixed(2)}
                  </div>
                ))}
              </div>
              <div className={`${styles.orderItem} ${styles.total}`}>
                <strong>Total:</strong> KSH {(total + (deliveryFee || 0)).toFixed(2)}
              </div>

              <DeliveryOptions
                cart={cart}
                userLocation={formState.selectedLocation}
                deliveryTown={formState.town}
                onDeliveryOptionSelected={handleDeliveryChange}
              />
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className={`${styles.stepContent} ${currentStep === 3 ? styles.active : ''}`}>
            <h3 className={styles.stepTitle}>Select Payment Method</h3>
            <div className={styles.paymentOptions}>
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
                onError={(msg) => alert(`Order error: ${msg}`)}
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className={styles.stepNavigation}>
            <button 
              className={styles.stepButton} 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </button>
            <span className={styles.stepCounter}>Step {currentStep} of 3</span>
            <button 
              className={`${styles.stepButton} ${styles.primary}`} 
              onClick={nextStep}
              disabled={currentStep === 3}
            >
              {currentStep === 3 ? 'Complete Order' : 'Next'}
            </button>
          </div>
        </div>

        {/* Original layout for smaller screens - hidden on wide screens */}
        <div className={styles.originalLayout}>
          <div className={styles.customerDetails}>
            <p><strong>Name: </strong> {user.names || 'N/A'}</p>
            <p><strong>Phone: </strong> {user.phoneNumber || 'N/A'}</p>
            <p><strong>Town: </strong> {formState.town || 'N/A'}</p>
            <p><strong>Delivery Location: </strong> {formState.selectedLocation || 'None'}</p>

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
                          <option value="">Select a saved location</option>
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
                  {item.name} x {item.quantity || 1} = KSH {(item.price * (item.quantity || 1)).toFixed(2)}
                </div>
              ))}
            </div>
            <div className={`${styles.orderItem} ${styles.total}`}>
              <strong>Total:</strong> KSH {(total + (deliveryFee || 0)).toFixed(2)}
            </div>

            <DeliveryOptions
              cart={cart}
              userLocation={formState.selectedLocation}
              deliveryTown={formState.town}
              onDeliveryOptionSelected={handleDeliveryChange}
            />
          </div>

          <div className={styles.paymentOptions}>
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
              onError={(msg) => alert(`Order error: ${msg}`)}
            />
          </div>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;