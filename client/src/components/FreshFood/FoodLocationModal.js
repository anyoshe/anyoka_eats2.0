/* global google */
import React, { useEffect, useState } from 'react';
import OrderSummaryModal from './FoodOrderSummaryModal';
const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

// Update fallbackLocations to use vendor names as keys
const fallbackLocations = {
  "Old Market Malindi": { lat: -3.2191971243260338, lng: 40.12079213531878 },
  "Vendor B": { lat: -3.222577, lng: 40.114147 },
  "Vendor C": { lat: -3.210163, lng: 40.117003 },
};

const FoodLocationModal = ({ show, handleClose, vendorName, vendorLocation, orderedFoods = [] }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [vendorCoords, setVendorCoords] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (show) {
      console.log('Showing FoodLocationModal. VendorLocation:', vendorLocation);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=places`;
      script.async = true;
      document.head.appendChild(script);

      window.initMap = function () {
        const defaultLocation = { lat: -3.2222, lng: 40.1167 };
        const newMap = new google.maps.Map(document.getElementById('mapContainer'), {
          zoom: 15,
          center: defaultLocation,
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

        const geocodeVendorLocation = () => {
          if (vendorLocation) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: vendorLocation }, (results, status) => {
              if (status === 'OK' && results.length > 0) {
                const location = results[0].geometry.location;
                const newVendorCoords = { lat: location.lat(), lng: location.lng() };
                setVendorCoords(newVendorCoords);
                newMap.setCenter(newVendorCoords);
                new google.maps.Marker({
                  map: newMap,
                  position: newVendorCoords,
                  label: 'Vendor',
                });
                console.log('Vendor coordinates set:', newVendorCoords);
              } else {
                console.error('Geocoding failed. Status:', status);
                // Fallback to coordinates based on vendor name
                const fallbackLocation = fallbackLocations[vendorLocation];
                if (fallbackLocation) {
                  setVendorCoords(fallbackLocation);
                  newMap.setCenter(fallbackLocation);
                  new google.maps.Marker({
                    map: newMap,
                    position: fallbackLocation,
                    label: 'Vendor',
                  });
                  console.log('Fallback coordinates set:', fallbackLocation);
                  alert(`Geocoding failed. Using fallback location for ${vendorLocation}.`);
                } else {
                  console.error('Unable to geocode vendor location. No fallback available.');
                  alert('Unable to geocode vendor location. Please use a different vendor.');
                }
              }
            });
          } else {
            console.error('Vendor location is not provided.');
          }
        };

        geocodeVendorLocation();
      };

      return () => {
        document.head.removeChild(script);
        setMap(null);
        setMarker(null);
      };
    }
  }, [show, vendorLocation]);

  const updateCustomerLocation = async (latLng) => {
    const lat = latLng.lat();
    const lng = latLng.lng();
    try {
      const address = await getReadableAddress(lat, lng);
      document.getElementById('customerLocation').value = address;
      setPinnedLocation({ lat, lng, address });
    } catch (error) {
      console.error('Error updating customer location:', error);
    }
  };

  const handleInputChange = async (event) => {
    setManualInput(event.target.value);
    try {
      const { lat, lng } = await getCoordinatesForAddress(event.target.value);
      setPinnedLocation({ lat, lng, address: event.target.value });
      map.setCenter({ lat, lng });
      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
        });
        setMarker(newMarker);
      }
    } catch (error) {
      console.error('Error setting pinned location:', error);
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
        console.error('No coordinates found for address:', address);
        throw new Error('No coordinates found for the given address');
      }
    } catch (error) {
      console.error('Error fetching coordinates for address:', error);
      throw error;
    }
  };

  const getReadableAddress = async (lat, lng) => {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('Geocode was not successful for the following reason: ' + status);
        }
      });
    });
  };

  const handleOkClick = () => {
    console.log('Vendor Coords:', vendorCoords);
  console.log('Pinned Location:', pinnedLocation);
    if (vendorCoords && pinnedLocation) {
      console.log(vendorCoords, pinnedLocation);
      setShowOrderSummary(true);
    } else {
      console.error('Both vendorCoords and pinnedLocation need to be set before proceeding.');
      alert('Please make sure both vendor and customer locations are set before proceeding.');
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
              <div><strong>Vendor Location:</strong> {vendorLocation}</div>
              <div id="mapContainer" style={{ height: '400px' }}></div>
              <input type="text" id="customerLocation" className="form-control mt-3" placeholder="Delivery Location" readOnly />
              <button type="button" className="btn btn-primary mt-3" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const address = await getReadableAddress(latitude, longitude);
                    document.getElementById('customerLocation').value = address;
                    setPinnedLocation({ lat: latitude, lng: longitude, address });
                    map.setCenter({ lat: latitude, lng: longitude });
                    if (marker) {
                      marker.setPosition({ lat: latitude, lng: longitude });
                    } else {
                      const newMarker = new google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map: map,
                        draggable: true,
                      });
                      setMarker(newMarker);
                    }
                  }, () => {
                    alert('Please enable location services.');
                  });
                } else {
                  alert('Your browser does not support geolocation.');
                }
              }}>
                Use My Current Location
              </button>
              <input type="text" className="form-control mt-3" value={manualInput} onChange={handleInputChange} placeholder="Enter address manually" />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleClose}>Close</button>
              <button type="button" className="btn btn-primary" onClick={handleOkClick}>Ok</button>
            </div>
          </div>
        </div>
      </div>

      {showOrderSummary && (
        <OrderSummaryModal
          show={showOrderSummary}
          handleClose={() => setShowOrderSummary(false)}
          vendorName={vendorName}
          vendorLocation={vendorCoords}
          pinnedLocation={pinnedLocation}
          orderedFoods={orderedFoods}
        />
      )}
    </>
  );
};

export default FoodLocationModal;


