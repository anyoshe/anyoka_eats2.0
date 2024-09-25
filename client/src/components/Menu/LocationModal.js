/* global google */
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import OrderSummaryModal from './OrderSummaryModal';
import './LocationModal.css';
import { useCart } from './CartContext';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

const fallbackLocations = {
  "JOHARIS": { lat: -1.3014837036023645, lng: 36.81863427013397 },
  "KIENYEJI CLUB": { lat: -3.215983807798293, lng: 40.11173015525964 },
  "BILLIONAIRE CLUB": { lat: -3.2150307505922235, lng: 40.11619069638544 },
  "STARS AND GARTERS": { lat: -3.2101632447638084, lng: 40.11700276546466 },
  "Milcah'sRestaurant": { lat: -3.215983807798293, lng: 40.11173015525964 },
};

const LocationModal = ({ show, handleClose, restaurantName, orderedDishes = [] }) => {
  const { state } = useCart();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (show) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=places`;
      script.async = true;
      document.head.appendChild(script);

      window.initMap = function () {
        const newMap = new google.maps.Map(document.getElementById('mapContainer'), {
          zoom: 15,
          center: { lat: -3.2222, lng: 40.1167 },
        });

        newMap.addListener('click', event => {
          if (marker) {
            marker.setPosition(event.latLng);
          } else {
            const newMarker = new google.maps.Marker({
              position: event.latLng,
              map: newMap,
              draggable: true,
            });
            setMarker(newMarker);
          }
          updateCustomerLocation(event.latLng);
        });

        setMap(newMap);

        const initializeLocation = async () => {
          // Check if restaurant location (lat/lng) is passed from cart context
          if (state.restaurantLocation && state.restaurantLocation.lat && state.restaurantLocation.lng) {
            // Directly set the restaurant location without geocoding since it's already geocoded
            setRestaurantLocation(state.restaurantLocation);
            newMap.setCenter(state.restaurantLocation);
          } else if (state.restaurantLocation) {
            try {
              // If restaurantLocation is a human-readable address, convert it to lat/lng
              const { lat, lng } = await getCoordinatesForAddress(state.restaurantLocation);
              const newRestaurantLocation = { lat, lng };
              setRestaurantLocation(newRestaurantLocation);
              newMap.setCenter(newRestaurantLocation);
            } catch (error) {
              console.error('Error converting restaurant location from cart context:', error);
              // Proceed to check if restaurant name can be geocoded
              geocodeRestaurant();
            }
          } else {
            // No restaurantLocation in cart context, attempt to geocode the restaurant name
            geocodeRestaurant();
          }
        };
        
        const geocodeRestaurant = () => {
          const geocoder = new google.maps.Geocoder();
        
          // Try geocoding the restaurant name
          geocoder.geocode({ address: restaurantName }, (results, status) => {
            if (status === 'OK' && results.length > 0) {
              const location = results[0].geometry.location;
              const newRestaurantLocation = { lat: location.lat(), lng: location.lng() };
              setRestaurantLocation(newRestaurantLocation);
              newMap.setCenter(newRestaurantLocation);
            } else {
              console.error('Geocoding restaurant name failed:', status);
              // Use fallback coordinates if available
              const fallbackLocation = fallbackLocations[restaurantName];
              if (fallbackLocation) {
                setRestaurantLocation(fallbackLocation);
                newMap.setCenter(fallbackLocation);
              } else {
                // If no fallback is available, show an error message
                console.error('Unable to geocode restaurant location and no fallback available.');
                alert('Failed to locate the restaurant position. Please try again later.');
              }
            }
          });
        };
        
        initializeLocation();

      }

      return () => {
        document.head.removeChild(script);
        setMap(null);
        setMarker(null);
      };
    }
  }, [show, restaurantName, state.restaurantLocation]);

  const getReadableAddress = async (latitude, longitude) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
      
          if (data.status === 'OK') {
            const address = data.results[0].formatted_address;
            return address;
          } else {
            console.error('Error fetching address:', data);
            throw new Error('Unable to fetch address');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          throw error;
        }
      };

  const getCoordinatesForAddress = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        console.error('Unable to find coordinates for address:', address);
        throw new Error('No coordinates found for the given address');
      }
    } catch (error) {
      console.error('Error fetching coordinates for address:', error);
      throw error;
    }
  };
  const getLocation = async () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const address = await getReadableAddress(latitude, longitude);
            document.getElementById('customerLocation').value = address;
            setPinnedLocation({ lat: latitude, lng: longitude, address });
          }, () => {
            alert('Please enable location services.');
          });
        } else {
          alert('Your browser does not support geolocation.');
        }
      };
    
      const updateCustomerLocation = newPosition => {
        const lat = newPosition.lat();
        const lng = newPosition.lng();
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK') {
            const address = results[0].formatted_address;
            document.getElementById('customerLocation').value = address;
            setPinnedLocation({ lat, lng, address });
          } else {
            console.error('Geocode was not successful for the following reason: ' + status);
          }
        });
      };
  const handleInputChange = async (event) => {
    setManualInput(event.target.value);
    const address = event.target.value;
    try {
      const coordinates = await getCoordinatesForAddress(address);
      setPinnedLocation({ ...coordinates, address });
    } catch (error) {
      console.error('Error setting pinned location:', error);
      // Optionally, set an error state here to inform the user
    }
  };

  const handleOkClick = async () => {
    try {
      console.log('Restaurant Location:', restaurantLocation);
      console.log('Pinned Location:', pinnedLocation);

      if (restaurantLocation && pinnedLocation) {
        // Both locations are in the correct format
        setShowOrderSummary(true);
      } else {
        // Convert restaurantLocation if it's a human-readable address
        if (typeof restaurantLocation === 'string') {
          const { lat, lng } = await getCoordinatesForAddress(restaurantLocation);
          setRestaurantLocation({ lat, lng });
        }

        // Convert pinnedLocation if it's a human-readable address
        if (typeof pinnedLocation === 'string') {
          const { lat, lng } = await getCoordinatesForAddress(pinnedLocation);
          setPinnedLocation({ lat, lng, address: pinnedLocation });
        }

        if (restaurantLocation && pinnedLocation) {
          setShowOrderSummary(true);
        } else {
          console.error('Both restaurantLocation and pinnedLocation need to be set before proceeding.');
        }
      }
    } catch (error) {
      console.error('Error converting locations:', error);
    }
  };

  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} id="locationModal" tabIndex="-1" aria-labelledby="locationModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="locationModalLabel">Pin Your Delivery Location</h5>
            </div>

            <div className="modal-body">
              <div><span className='fromSpan'>From: </span> {restaurantName}</div>
              <div id="mapContainer"></div>

              <div className='useMylocation'>
                <button type="button" className="btn-primary InputBtn" onClick={getLocation}>Use My Location</button> 

                <input
                  type="text"
                  id="customerLocation"
                  className="form-control"
                  placeholder="Enter Delivery Location"
                  onChange={handleInputChange}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="cancel_Ok_btn" onClick={handleOkClick}>OK</button>
              <button type="button" className="btn-secondary landingCancel" data-bs-dismiss="modal" onClick={handleClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
      {showOrderSummary && (
        <OrderSummaryModal
          show={showOrderSummary}
          handleClose={() => setShowOrderSummary(false)}
          restaurantName={restaurantName}
          orderedDishes={orderedDishes}
          restaurantLocation={restaurantLocation}
          pinnedLocation={pinnedLocation}
        />
      )}
    </>
  );
};

export default LocationModal;
