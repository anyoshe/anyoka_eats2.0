/* global google */
import React, { useState, useEffect } from 'react';
import './SpecialOrderModal';
import config from '../../config';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const SpecialOrderModal = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryLocation: '',
    deliveryDate: '',
    deliveryTime: '',
    orderDetails: '',
    specialInstructions: ''
  });
  const [specialOrderMap, setSpecialOrderMap] = useState(null);
  const [specialOrderMarker, setSpecialOrderMarker] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=places`;
    script.async = true;
    document.head.appendChild(script);

    window.initMap = () => {
      const initialPosition = { lat: -3.2222, lng: 40.1167 };
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: initialPosition
      });
      const marker = new google.maps.Marker({
        position: initialPosition,
        map,
        draggable: true
      });
      google.maps.event.addListener(marker, 'dragend', () => {
        const position = marker.getPosition();
        setFormData(prevFormData => ({
          ...prevFormData,
          deliveryLocation: `${position.lat()}, ${position.lng()}`
        }));
      });

      // Listen for clicks on the map to move the marker
      google.maps.event.addListener(map, 'click', (event) => {
        const clickedLocation = event.latLng;
        marker.setPosition(clickedLocation);
        setFormData(prevFormData => ({
          ...prevFormData,
          deliveryLocation: `${clickedLocation.lat()}, ${clickedLocation.lng()}`
        }));
      });

      setSpecialOrderMap(map);
      setSpecialOrderMarker(marker);
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update marker position when the location input changes
    if (name === 'deliveryLocation') {
      const [lat, lng] = value.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        specialOrderMarker.setPosition({ lat, lng });
        specialOrderMap.setCenter({ lat, lng });
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };
          specialOrderMarker.setPosition(currentLocation);
          specialOrderMap.setCenter(currentLocation);
          setFormData(prevFormData => ({
            ...prevFormData,
            deliveryLocation: `${latitude}, ${longitude}`
          }));
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to retrieve your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const validateForm = () => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryLocation,
      deliveryDate,
      deliveryTime,
      orderDetails,
      specialInstructions
    } = formData;

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !deliveryLocation ||
      !deliveryDate ||
      !deliveryTime ||
      !orderDetails ||
      !specialInstructions
    ) {
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fill in all the required fields.');
      return;
    }

    fetch(`${config.backendUrl}/api/special-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (response.ok) {
          alert('Special order placed successfully! We shall contact you shortly with full details');
          closeModal();
          setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            deliveryLocation: '',
            deliveryDate: '',
            deliveryTime: '',
            orderDetails: '',
            specialInstructions: ''
          });
          specialOrderMarker.setPosition({ lat: -3.2222, lng: 40.1167 });
          specialOrderMap.setCenter({ lat: -3.2222, lng: 40.1167 });
        } else {
          alert('Failed to place the order. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place the order. Please try again.');
      });
  };

  const showMap = () => {
    document.getElementById('map').style.display = 'block';
    google.maps.event.trigger(specialOrderMap, 'resize');
    specialOrderMap.setCenter(specialOrderMarker.getPosition());
  };

  return (
    <div className="modal fade show" id="specialOrderModal" tabIndex="-1" role="dialog" aria-labelledby="specialOrderModalLabel" aria-hidden="true" style={{ display: 'block' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="specialOrderModalLabel">Place Special Order</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form id="specialOrderForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="customerName">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="customerName"
                  name="customerName"
                  placeholder="Enter your name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerEmail">Customer Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="customerEmail"
                  name="customerEmail"
                  placeholder="Enter your email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="customerPhone"
                  name="customerPhone"
                  placeholder="Enter your phone number"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryLocation">Delivery Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="deliveryLocation"
                  name="deliveryLocation"
                  placeholder="Enter delivery location"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="btn btn-secondary mt-2" onClick={showMap}>Pin Location on Map</button>
                <button type="button" className="btn btn-secondary mt-2" onClick={handleUseCurrentLocation}>Use My Current Location</button>
                <div id="map" className="mt-3" style={{ height: '300px', display: 'none' }}></div>
              </div>
              <div className="form-group">
                <label htmlFor="deliveryDate">Preferred Delivery Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryTime">Preferred Delivery Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="orderDetails">Order Details</label>
                <textarea
                  className="form-control"
                  id="orderDetails"
                  name="orderDetails"
                  rows="3"
                  placeholder="Provide details of your special order"
                  value={formData.orderDetails}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="specialInstructions">Special Instructions</label>
                <textarea
                  className="form-control"
                  id="specialInstructions"
                  name="specialInstructions"
                  rows="2"
                  placeholder="Any special instructions or preferences"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit Special Order</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOrderModal;
