import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import config from '../../config';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

// Helper function to load Google Maps script asynchronously
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById('googleMaps');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.id = 'googleMaps';
    script.async = true;
    script.onload = () => {
      if (callback) callback();
    };
    document.head.appendChild(script);
  } else {
    if (callback) callback();
  }
};

const HotelRestaurantSection = ({ partner }) => {
  const [editTitle, setEditTitle] = useState(false);
  const [formData, setFormData] = useState({
    dishCode: '',
    dishName: '',
    dishPrice: '',
    dishCategory: '',
    quantity: '',
    image: null
  });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showAddRestaurantPrompt, setShowAddRestaurantPrompt] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDishCode, setEditingDishCode] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [tableTitle, setTableTitle] = useState(selectedRestaurant?.restaurantName || "");
  const [restaurantLocation, setRestaurantLocation] = useState(selectedRestaurant?.location || "");
  const [dishCategory, setDishCategory] = useState(selectedRestaurant?.dishCategory || "");
  const [restaurantImageUrl, setRestaurantImageUrl] = useState(selectedRestaurant?.restaurantImgUrl || "");

  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps script only once
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setScriptLoaded(true);
    });
  }, []);

  // Initialize the map once script is loaded
  useEffect(() => {
    if (scriptLoaded && isEditingTitle) {
      initializeMap();
    }
  }, [scriptLoaded, isEditingTitle]);

  const initializeMap = () => {
    if (!window.google) {
      console.error("Google Maps API is not loaded.");
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: -3.2222, lng: 40.1167 }, // Default location
      zoom: 15,
    });

    setMap(mapInstance);

    mapInstance.addListener('click', (event) => {
      const clickedLocation = event.latLng;
      if (marker) {
        marker.setMap(null); // Remove existing marker
      }

      const newMarker = new window.google.maps.Marker({
        position: clickedLocation,
        map: mapInstance,
        draggable: true,
      });

      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        reverseGeocode(position);
      });

      setMarker(newMarker);
      reverseGeocode(clickedLocation);
    });
  };

  const reverseGeocode = (location) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        console.error('Geocoder failed due to: ' + status);
        setAddress('Address not found');
      }
    });
  };

  const handleUseMyLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.setCenter(userLocation);
          map.setZoom(15);

          if (marker) {
            marker.setMap(null);
          }

          const newMarker = new window.google.maps.Marker({
            position: userLocation,
            map: map,
            draggable: true,
          });

          newMarker.addListener('dragend', () => {
            const position = newMarker.getPosition();
            reverseGeocode(position);
          });

          setMarker(newMarker);
          reverseGeocode(userLocation);
        }
      } catch (error) {
        console.error('Error fetching current location', error);
      }
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };


  useEffect(() => {
    fetchRestaurants();
  }, [partner]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/restaurants/${partner._id}`);
      if (response.status === 404) {
        setShowAddRestaurantPrompt(true);
        setRestaurants([]);
      } else {
        const data = await response.json();
        setRestaurants(data);
        setShowAddRestaurantPrompt(false);
        if (data.length === 1) {
          const singleRestaurant = data[0];
          setSelectedRestaurant(singleRestaurant);
          setTableTitle(singleRestaurant.restaurant);
          fetchDishes(singleRestaurant.restaurant); // Automatically fetch dishes
        }
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchDishes = async (restaurantName) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/partner_dishes?restaurantName=${encodeURIComponent(restaurantName)}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      console.log('Fetched dishes result:', result);

      const { dishes } = result;

      if (Array.isArray(dishes)) {
        const sortedDishes = dishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDishes(sortedDishes);
      } else {
        console.error('Expected an array but got:', dishes);
        setDishes([]);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    console.log('Restaurant ID:', restaurant._id);
    setSelectedRestaurant(restaurant);
    setTableTitle(restaurant.restaurant);
    fetchDishes(restaurant.restaurant);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      image: e.target.files[0] // Save the file object if needed
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Construct form data
    const formDataToSend = new FormData();
    formDataToSend.append('dishCode', formData.dishCode);
    formDataToSend.append('dishName', formData.dishName);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('dishPrice', formData.dishPrice);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('dishCategory', formData.dishCategory);
    formDataToSend.append('restaurant', selectedRestaurant?.restaurant || '');
    formDataToSend.append('dishDescription', formData.dishDescription || '');
    formDataToSend.append('partnerId', partner._id);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/dishes`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Dish added successfully:', result);

        // Update the dishes state with the newly added dish
        setDishes(prevDishes => [...prevDishes, result.dish]);

        alert('Dish added successfully!');

        // Clear the form
        setFormData({
          dishCode: '',
          dishName: '',
          dishPrice: '',
          dishCategory: '',
          quantity: '',
          image: null,
          discount: '',
        });

        setIsEditing(false);
      } else {
        console.error('Failed to add dish');
        alert('Failed to add dish. Please check the details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      setTableTitle(selectedRestaurant.restaurant || '');
      setAddress(selectedRestaurant.location || '');
      setDishCategory(selectedRestaurant.dishCategory || '');
      setRestaurantImageUrl(selectedRestaurant.restaurantImgUrl || '');
    }
  }, [selectedRestaurant]);


  const handleTitleToggle = async () => {
    if (!isEditingTitle) {
      setTableTitle(selectedRestaurant?.restaurant || '');
      setAddress(selectedRestaurant?.location || '');
      setDishCategory(selectedRestaurant?.dishCategory || '');
      setRestaurantImageUrl(selectedRestaurant?.restaurantImgUrl || '');
    }

    if (isEditingTitle) {
      // Save the changes to the server
      try {
        const updatedData = {};

        // Add only fields that have changed
        if (tableTitle && tableTitle !== selectedRestaurant?.restaurant) {
          updatedData.restaurant = tableTitle;
        }
        if (address && address !== selectedRestaurant?.location) {
          updatedData.location = address;
        }
        if (dishCategory && dishCategory !== selectedRestaurant?.dishCategory) {
          updatedData.dishCategory = dishCategory;
        }
        if (restaurantImageUrl && restaurantImageUrl !== selectedRestaurant?.restaurantImgUrl) {
          updatedData.restaurantImgUrl = restaurantImageUrl;
        }

        if (Object.keys(updatedData).length > 0) {
          const response = await fetch(`${config.backendUrl}/api/restaurants/${selectedRestaurant?._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Restaurant updated successfully:', result);
            alert('Restaurant updated successfully!');
          } else {
            console.error('Failed to update restaurant');
            alert('Failed to update restaurant. Please try again.');
          }
        } else {
          alert('No changes detected.');
        }
      } catch (error) {
        console.error('Error updating restaurant:', error);
        alert('Error updating restaurant. Please try again.');
      }
    }

    setIsEditingTitle(!isEditingTitle); // Toggle edit mode
  };


  const handleTitleChange = (e) => {
    setTableTitle(e.target.value);
    setRestaurantLocation(e.target.value);
  };

  const handleAddRestaurant = async () => {
    const restaurantName = prompt('Please enter the restaurant name:');
    const locationName = prompt('Please enter the location name:');
    if (restaurantName) {
      try {
        const response = await fetch(`${config.backendUrl}/api/restaurants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: partner._id,
            restaurant: restaurantName,
            location: locationName, // Or get this from a form input
            dishCategory: 'Default Category', // Or get this from a form input
            restaurantImgUrl: '' // Or get this from a form input
          })
        });
        if (!response.ok) throw new Error('Failed to add restaurant');
        await fetchRestaurants(); // Refresh restaurant list after adding new one
      } catch (error) {
        console.error('Error adding restaurant:', error);
      }
    }
  };


  const handleEdit = (dish) => {
    setFormData({
      dishCode: dish.dishCode,
      dishName: dish.dishName,
      dishPrice: dish.dishPrice,
      dishCategory: dish.dishCategory,
      quantity: dish.quantity,
      image: dish.image,
      discount: dish.discount,
    });
    setEditingDishCode(dish.dishCode);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct form data
    const formDataToSend = new FormData();
    formDataToSend.append('dishCode', formData.dishCode);
    formDataToSend.append('dishName', formData.dishName);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('dishPrice', formData.dishPrice);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('dishCategory', formData.dishCategory);
    formDataToSend.append('restaurant', selectedRestaurant?.restaurant || '');
    formDataToSend.append('dishDescription', formData.dishDescription || '');
    formDataToSend.append('partnerId', partner._id);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/dishes/${formData.dishCode}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedDish = await response.json();
        console.log('Dish updated successfully:', updatedDish);

        // Update the dishes array with the updated dish
        setDishes(prevDishes =>
          prevDishes.map(dish =>
            dish._id === updatedDish.dish._id ? updatedDish.dish : dish
          )
        );

        alert('Dish updated successfully!');

        // Clear the form and reset editing state
        setFormData({
          dishCode: '',
          dishName: '',
          dishPrice: '',
          dishCategory: '',
          quantity: '',
          image: null,
          discount: '',
        });

        setIsEditing(false);
        setEditingDishCode(''); // Clear the editing state
      } else {
        console.error('Failed to update dish');
        alert('Failed to update dish. Please check the details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Failed to update dish. Please check the details.');
    }
  };

  const handleDelete = async (dishId) => {
    try {
      console.log('Deleting dish with ID:', dishId); // Log the identifier being passed

      const response = await fetch(`${config.backendUrl}/api/dishes/${dishId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Filter out the deleted dish by its _id
        setDishes(prevDishes => prevDishes.filter(dish => dish._id !== dishId));
        console.log('Dish deleted successfully');
        alert('Dish deleted successfully!'); // Notify the user
      } else {
        console.error('Failed to delete dish');
        alert('Failed to delete dish. Please try again later.'); // Notify the user
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('An error occurred while trying to delete the dish.'); // Notify the user
    }
  };

  const handleDeleteRestaurant = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this restaurant and all its dishes? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`${config.backendUrl}/api/restaurants/${selectedRestaurant._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Restaurant and its dishes have been deleted successfully.');
          // Update the local state to remove the deleted restaurant
          setRestaurants(restaurants.filter(restaurant => restaurant._id !== selectedRestaurant._id));
          setSelectedRestaurant(null);
          setTableTitle('TABLE TITLE');
          setDishes([]);
        } else {
          console.error('Failed to delete restaurant');
          alert('Failed to delete restaurant. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        alert('Error deleting restaurant. Please try again.');
      }
    }
  };

  return (
    <div className="menu_table" id="hotelRestaurantSection">

      <div className="column small-12 left_panel">

        <header data-equalizer-watch className="iconHeader">

          <div className="tableTitileChart">
            {/* {isEditingTitle ? (
              <input
                type="text"
                value={tableTitle}
                onChange={handleTitleChange}
                className="inputHide"
              />

            ) : ( */}
              <h2 className='h2TableTitle'>
                {tableTitle}
                <h4 className="vendorLocation">
                  {address}
                </h4>

                <div className='func_div'>
                  <button className="hideshow func_icons func_icons_save" onClick={handleTitleToggle}>
                  {/* {isEditingTitle ? 'Save' : ''} */}
                
                    <i className={`fa ${isEditingTitle ? 'fa-save' : 'fa-edit'}`} aria-hidden="true"></i>
                  </button>

                  <button className="func_icons func_icons_delete" onClick={handleDeleteRestaurant}><i className="fas fa-trash"></i></button>
                
                  {isEditingTitle && (
                    <button className="closeButton func_icons func_icons_close" onClick={() => setIsEditingTitle(false)}>
                      {/* Close  */}
                      <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                  )}

                </div>

              </h2>
            {/* )} */}

            {/* <button className="hideshow" onClick={handleTitleToggle}>
              {isEditingTitle ? 'Save' : ''}
            
              <i className={`fa ${isEditingTitle ? 'fa-save' : 'fa-edit'}`} aria-hidden="true"></i>
            </button>
          
            {isEditingTitle && (
              <button className="closeButton" onClick={() => setIsEditingTitle(false)}>
                Close <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            )}

            <button className="deleteButton" onClick={handleDeleteRestaurant}><i className="fas fa-trash"></i></button> */}

            {/* <h3 className="businessName">{partner?.restaurant}</h3> */}
            {isEditingTitle ? (
              <div className='forgotten'>
                <label className='tableEditLabels'>
                  {/* Restaurant Name: */}
                  Name : 

                  <br></br>

                  <input
                    type="text"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className='tableEditInput'
                  />
                </label>

                {/* <label className='tableEditLabels'>
                    Location :  

                    <br></br>

                    <input
                    type="text"
                    value={address}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className='tableEditInput'
                  />
                </label> */}

                <label className='tableEditLabels'>
                  Best In:  

                  <br></br>

                  <input
                    type="text"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className='tableEditInput'
                  />
                </label>

                <br></br>
                
                <label className='tableEditLabels'>
                    Location :  

                    <br></br>

                    <input
                    type="text"
                    value={address}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className='tableEditInput locationtableEdit'
                  />
                </label>

                <div className="location-section">
                  {/* <label>
                    Restaurant Location: 
                    Location :  
                    <input
                    type="text"
                    value={address}
                    onChange={(e) => setTableTitle(e.target.value)}
                  />
                  </label> */}
                  <div id="map99" ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
                  {/* <input
                    type="text"
                    placeholder="Enter a location"
                    className="headerInputs"
                  /> */}
                  <button onClick={handleUseMyLocation} className='orUseBtn'> Or Use My Location</button>
                  {/* <p>Selected Address: {address}</p> */}

                </div>
                {/* <label>
                  Dish Category:
                  <input
                    type="text"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                  />
                </label> */}
              </div>
            ) : (
              <button onClick={handleTitleToggle}></button>
            )}

            {/* Always show the Add Restaurant button */}
            <button className="addRestaurantButton" onClick={handleAddRestaurant}>Add a Restaurant</button>

            {/* Show dropdown if there are 2 or more restaurants */}
            {restaurants.length > 1 && (
              <div className="restaurantSelection">
                
                <select onChange={(e) => handleRestaurantSelect(JSON.parse(e.target.value))} className='choose_select'>

                  <option value="" className='choose_select_options'>choose restaurant</option>

                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={JSON.stringify(restaurant)} className='choose_select_options'>
                      {restaurant.restaurant}
                    </option>

                  ))}

                </select>

              </div>
            )}
          </div>

          {/* MENU SEARCH INPUT FIELD */}
          <div className="label_input">

            <input
              type="text"
              className="search_menu"
              placeholder="Search Menu Items"
            />

            <button className="search_menu_btn">Search</button>

          </div>
        </header>


        {/* FORM HOLDING INPUT FIELDS TO FILL THE TABLE */}
        <form id="chart_datas" onSubmit={handleFormSubmit}>

          <div className="grid-x grid-padding-x input_wrp">

            <div className="small-1 cell column">

              <label>

                <input
                  type="file"
                  className="headerInputs small-1-input form_file"
                  onChange={handleFileChange}
                />

              </label>
            </div>

            <div className="small-2 cell column">

              <label>

                <input
                  type="text"
                  placeholder="Dish Code"
                  className="headerInputs"
                  name="dishCode"
                  value={formData.dishCode}
                  onChange={handleInputChange}
                />

              </label>

            </div>

            <div className="small-2 cell column">
              <label>

                <input
                  type="text"
                  placeholder="Dish Name"
                  className="headerInputs"
                  name="dishName"
                  value={formData.dishName}
                  onChange={handleInputChange}
                />

              </label>
            </div>

            <div className="small-3 cell column">
              <label>

                <input
                  type="text"
                  placeholder="Dish Price"
                  className="headerInputs"
                  name="dishPrice"
                  value={formData.dishPrice}
                  onChange={handleInputChange}
                />

              </label>
            </div>

            <div className="small-2 cell column">
              <label>

                <input
                  type="number"
                  placeholder="Discount (%)"
                  className="headerInputs"
                  name="discount"
                  value={formData.discount || ''}
                  onChange={handleInputChange}
                />

              </label>
            </div>

            {/* <div className="small-4 cell column">
              <label>

                <input
                  type="text"
                  placeholder="Dish Category"
                  className="headerInputs"
                  name="dishCategory"
                  value={formData.dishCategory}
                  onChange={handleInputChange}
                />

              </label>
            </div> */}

            <div className="small-4 cell column">
              <label>
                <select
                  placeholder="Dish Category"
                  className="headerInputs"
                  name="dishCategory"
                  value={formData.dishCategory}
                  onChange={handleInputChange}
                >
                  <option value="">Best In</option>
                  <option value="Chinese Foods">Chinese Foods</option>
                  <option value="Swahili Dishes">Swahili Dishes</option>
                  <option value="African Dishes">African Dishes</option>
                  <option value="Kenyan Food">Kenyan Food</option>
                  <option value="Indian Foods">Indian Foods</option>
                  <option value="Italian Foods">Italian Foods</option>
                  <option value="Others">Others</option>
                  {/* Add more categories if needed */}
                </select>
              </label>
            </div>

            <div className="small-5 cell column">
              <label>

                <input
                  type="text"
                  placeholder="Quantity"
                  className="headerInputs"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />

              </label>
            </div>

            <div className="small-12 cell column">
              <button type="submit" className="submitButton addRowBtn"><i className="fa fa-plus" id='addingPlus'></i></button>
            </div>
          </div>
        </form>

        {/* TABLE DISPLAY AREA */}

        <div className="tableRows" id='headerTableRows'>
          <div className="headerDiv">Picture</div>
          <div className="headerDiv headerspecial">Dish Code</div>
          <div className="headerDiv">Name</div>
          <div className="headerDiv headerspecial">Price</div>
          <div className="headerDiv headerspecial">Discount</div>
          <div className="headerDiv">Category</div>
          <div className="headerDiv headerspecial">Quantity</div>
          <div className="headerDiv">Action</div>
        </div>

        {/* Display fetched dishes here */}
        {dishes.map(dish => (
          <div className="tableRows" key={dish.dishCode}>

            <div className="dishDiv">
              {/* <img src={dish.imageUrl} alt={dish.dishName} className="dishImage" /> */}
              <img src={`${config.backendUrl}${dish.imageUrl}`} alt={dish.dishName} className="dishImagePartner" />
            </div>

            <div className="dishDiv headerspecial">{dish.dishCode}</div>
            <div className="dishDiv">{dish.dishName}</div>
            <div className="dishDiv headerspecial">{dish.dishPrice}</div>
            <div className="dishDiv headerspecial">{dish.discount}%</div>
            <div className="dishDiv">{dish.dishCategory}</div>
            <div className="dishDiv headerspecial">{dish.quantity}</div>

            <div className="dishDiv dishdiv_button">
              <button className="editButton" id='tableEditButton' onClick={() => handleEdit(dish)} style={{ display: dish.dishCode === editingDishCode ? 'none' : 'block' }}><i className="fas fa-edit"></i>
              </button>

              <button className="saveButton"  id='tableEditButton' onClick={handleSubmit} style={{ display: dish.dishCode === editingDishCode ? 'block' : 'none' }}>Save</button>

              <button className="deleteButton" onClick={() => handleDelete(dish._id)}><i className="fas fa-trash"></i>
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HotelRestaurantSection;
