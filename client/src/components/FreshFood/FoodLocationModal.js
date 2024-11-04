/* global google */
import React, { useEffect, useState } from 'react';
import OrderSummaryModal from './FoodOrderSummaryModal';
import config from '../../config';
import { useFreshFoodCart } from './FreshFoodCartContext';

import './FoodLocationalModal.css';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

const FoodLocationModal = ({ show, handleClose, vendors = [], orderedFoods = [] }) => {
  const { state, dispatch } = useFreshFoodCart();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [vendorCoords, setVendorCoords] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const fallbackVendorLocation = "1600 Amphitheatre Parkway, Mountain View, CA"; // Hardcoded fallback

  useEffect(() => {
    if (show) {
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

      if (vendors.length > 0) {
        // Assume the last vendor in the list is the one with the most recent order
        const lastVendor = vendors[vendors.length - 1];
        console.log("Last Vendor (by order):", lastVendor);
      
        const fetchVendorLocation = async (vendorName) => {
          try {
            const response = await fetch(`${config.backendUrl}/api/vendors/vendor/${vendorName}`);
            if (!response.ok) {
              throw new Error(`Error fetching vendor location: ${response.statusText}`);
            }
            const locationData = await response.json();
            return locationData.vendorLocation;
          } catch (error) {
            console.error("Error fetching vendor location:", error);
            return null;
          }
        };
      
        // Fetch the vendor location from the backend using the vendor's name
        fetchVendorLocation(lastVendor.vendor).then((vendorLocation) => {
          if (vendorLocation) {
            geocodeAddress(vendorLocation, newMap); // Use the vendor's location to geocode
          } else {
            console.log("Vendor location missing, attempting to geocode vendor name:", lastVendor.vendor);
            geocodeVendorName(lastVendor.vendor, newMap); // Fallback to using the vendor's name for geocoding
          }
        });
      } else {
        console.error('No vendors available.');
        alert('No vendor information available.');
      }
    }
      return () => {
        document.head.removeChild(script);
        setMap(null);
        setMarker(null);
      };
      
    }
  }, [show, vendors]);

  const geocodeAddress = (address, mapInstance) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        const newVendorCoords = { lat: location.lat(), lng: location.lng() };
        console.log("Geocoded Address Coordinates:", newVendorCoords);
        setVendorCoords(newVendorCoords);
        mapInstance.setCenter(newVendorCoords);
        new google.maps.Marker({
          map: mapInstance,
          position: newVendorCoords,
          label: 'Vendor',
        });
      } else {
        console.error('Geocoding failed for address. Status:', status);
        alert('Unable to locate the vendor address. Attempting to use a fallback location.');
        // Fallback to hardcoded location if geocoding fails
        geocodeAddress(fallbackVendorLocation, mapInstance);
      }
    });
  };

  const geocodeVendorName = (vendorName, mapInstance) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: vendorName }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        const newVendorCoords = { lat: location.lat(), lng: location.lng() };
        console.log("Geocoded Vendor Name Coordinates:", newVendorCoords);
        setVendorCoords(newVendorCoords);
        mapInstance.setCenter(newVendorCoords);
        new google.maps.Marker({
          map: mapInstance,
          position: newVendorCoords,
          label: 'Vendor',
        });
      } else {
        console.error('Geocoding failed for vendor name. Status:', status);
        alert('Unable to geocode the vendor name. Attempting to use a fallback location.');
        // Fallback to hardcoded location if vendor name geocoding fails
        geocodeAddress(fallbackVendorLocation, mapInstance);
      }
    });
  };

 
  const updateCustomerLocation = async (latLng) => {
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    try {
      const address = await getReadableAddress(lat, lng);
      document.getElementById('customerLocation').value = address;
      setPinnedLocation({ lat, lng, address });
    } catch (error) {
      console.error('Error updating customer location:', error);
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

  const handleOkClick = async () => {
    console.log('Vendor Coordinates:', vendorCoords);
    console.log('Pinned Location:', pinnedLocation);
    if (vendorCoords && pinnedLocation) {
      const distance = await calculateDistance(vendorCoords, pinnedLocation);
      console.log('Distance (in km):', distance);
      setShowOrderSummary(true);
    } else {
      alert('Please make sure both vendor and customer locations are set before proceeding.');
    }
  };
 
   // Function to pin the user's current location using Geolocation API
   const handlePinMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(latLng);

          if (marker) {
            marker.setPosition(latLng);
          } else {
            const newMarker = new google.maps.Marker({
              position: latLng,
              map: map,
              draggable: true,
            });
            setMarker(newMarker);
          }
          updateCustomerLocation(latLng);
        },
        (error) => {
          console.error('Error getting location: ', error);
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const calculateDistance = (vendorCoords, pinnedLocation) => {
    const service = new google.maps.DistanceMatrixService();
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix({
        origins: [new google.maps.LatLng(pinnedLocation.lat, pinnedLocation.lng)],
        destinations: [new google.maps.LatLng(vendorCoords.lat, vendorCoords.lng)],
        travelMode: 'DRIVING',
      }, (response, status) => {
        if (status === 'OK') {
          const distanceInMeters = response.rows[0].elements[0].distance.value;
          const distanceInKm = distanceInMeters / 1000;
          resolve(distanceInKm);
        } else {
          reject('Error calculating distance: ' + status);
        }
      });
    });
  };

  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} id="locationModal" tabIndex="-1" aria-labelledby="locationModalLabel" aria-hidden="true" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg freshfoodDalog">

          <div className="modal-content foodCartlocationContent">

            <div className="modal-header">

              <h5 className="modal-title" id="locationModalLabel">Pin Your Delivery Location</h5>

              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
              
            </div>
              <div className="modal-body" id='food_location_modal' style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>

              <div><strong>Vendor Location:</strong> {vendorCoords ? `${vendorCoords.lat}, ${vendorCoords.lng}` : 'Fetching...'}</div>

              <div id="mapContainer"></div>
              <input type="text" id="customerLocation" className="form-control mt-3" placeholder="Delivery Location" readOnly />
            </div>
            <button className="btn btn-primary mt-3" onClick={handlePinMyLocation}>Pin My Location</button>
            <div className="modal-footer">
              <button type="button" className="valueControllers" data-bs-dismiss="modal" onClick={handleClose}>Close</button>
              <button type="button" className="valueControllers" onClick={handleOkClick}>Ok</button>
            </div>
          </div>
        </div>
      </div>

      {showOrderSummary && (
        <OrderSummaryModal
          show={showOrderSummary}
          handleClose={() => setShowOrderSummary(false)}
          vendorName={vendors.length === 1 ? vendors[0]?.vendor : vendors[vendors.length - 1]?.vendor}
          vendorLocation={vendorCoords} // This is correct, should pass vendorCoords
          orderedFoods={orderedFoods}
          pinnedLocation={pinnedLocation}
          totalDistanceBetweenVendors={state.totalDistance}
        />
      )}

    </>
  );
};

export default FoodLocationModal;
