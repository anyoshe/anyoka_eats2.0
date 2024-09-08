/* global google */
import React, { useEffect, useState } from 'react';
import OrderSummaryModal from './FoodOrderSummaryModal';

// Accessing in React
const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;



const fallbackLocations = {
  "Linet": { lat: -3.2191971243260338, lng: 40.12079213531878 },
  "Old Market Malindi": { lat: -3.2191971243260338, lng: 40.12079213531878 },
  "New Market Malindi": { lat: -3.222576663810411, lng: 40.11414740233532 },
  "STARS AND GARTERS": { lat: -3.2101632447638084, lng: 40.11700276546466 },
};

const FoodLocationModal = ({ show, handleClose, vendorName, orderedFoods = [] }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (show) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=places`;
      script.async = true;
      // script.defer = true;
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

        const geocodeVendor = () => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: vendorName }, (results, status) => {
            if (status === 'OK' && results.length > 0) {
              const location = results[0].geometry.location;
              const newVendorLocation = { lat: location.lat(), lng: location.lng() };
              setVendorLocation(newVendorLocation);
              newMap.setCenter(newVendorLocation);
            } else {
              const fallbackLocation = fallbackLocations[vendorName];
              if (fallbackLocation) {
                setVendorLocation(fallbackLocation);
                newMap.setCenter(fallbackLocation);
              } else {
                console.error('Unable to geocode vendor location: ' + status);
              }
            }
          });
        };

        geocodeVendor();
      };

      return () => {
        document.head.removeChild(script);
        setMap(null);
        setMarker(null);
      };
    }
  }, [show, vendorName]);

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
        setPinnedLocation({ lat, lng });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const handleInputChange = async (event) => {
    setManualInput(event.target.value);
    const address = event.target.value;
    try {
      const { lat, lng } = await getCoordinatesForAddress(address);
      setPinnedLocation({ lat, lng, address });
    } catch (error) {
      console.error('Error setting pinned location:', error);
    }
  };

  const handleOkClick = () => {
    console.log('Vendor Location:', vendorLocation);
    console.log('Pinned Location:', pinnedLocation);
    if (vendorLocation && pinnedLocation) {
      setShowOrderSummary(true);
    } else {
      console.error('Both vendorLocation and pinnedLocation need to be set before proceeding.');
    }
  };

  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} id="locationModal" tabIndex="-1" aria-labelledby="locationModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="locationModalLabel">Pin Your Delivery Location</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
              <div><strong>From:</strong> {vendorName}</div>
              <div id="mapContainer" style={{ height: '400px' }}></div>
              <input type="text" id="customerLocation" className="form-control mt-3" placeholder="Delivery Location" readOnly />
              <button type="button" className="btn btn-primary" onClick={getLocation}>Use My Location</button>
              <input type="text" id="customerLocationManual" className="form-control mt-3" placeholder="Enter Delivery Location" onChange={handleInputChange} value={manualInput} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleClose}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleOkClick}>OK</button>
            </div>
          </div>
        </div>
      </div>

      {showOrderSummary && (
        <OrderSummaryModal
          show={showOrderSummary}
          handleClose={() => setShowOrderSummary(false)}
          vendorName={vendorName}
          orderedFoods={orderedFoods}
          vendorLocation={vendorLocation}
          pinnedLocation={pinnedLocation}
        />
      )}
    </>
  );
};

export default FoodLocationModal;
