import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import config from '../../config';

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
// const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&callback=initMap&libraries=places`;
//       script.async = true;
//       document.head.appendChild(script);


// const HotelRestaurantSection = ({ partner }) => {
//   const [editTitle, setEditTitle] = useState(false);
//   // const [tableTitle, setTableTitle] = useState('TABLE TITLE');
//   const [formData, setFormData] = useState({
//     dishCode: '',
//     dishName: '',
//     dishPrice: '',
//     dishCategory: '',
//     quantity: '',
//     image: null
//   });
//   const [restaurants, setRestaurants] = useState([]);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);
//   const [showAddRestaurantPrompt, setShowAddRestaurantPrompt] = useState(false);
//   const [dishes, setDishes] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingDishCode, setEditingDishCode] = useState(null);
//   const [isEditingTitle, setIsEditingTitle] = useState(false);

//   // Assuming you have input fields for these restaurant fields
//   const [tableTitle, setTableTitle] = useState(selectedRestaurant?.restaurantName || "");
//   const [restaurantLocation, setRestaurantLocation] = useState(selectedRestaurant?.location || "");
//   const [dishCategory, setDishCategory] = useState(selectedRestaurant?.dishCategory || "");
//   const [restaurantImageUrl, setRestaurantImageUrl] = useState(selectedRestaurant?.restaurantImgUrl || "");


//   const [location, setLocation] = useState('');
//   const [map, setMap] = useState(null);
//   const [autocomplete, setAutocomplete] = useState(null);
//   const mapRef = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (window.google) {
//       // Initialize map and autocomplete
//       const mapOptions = {
//         center: { lat: -3.2222, lng: 40.1167 }, // Default location
//         zoom: 15,
//       };
//       const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
//       setMap(mapInstance);

//       const autoCompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
//       autoCompleteInstance.bindTo('bounds', mapInstance);
//       setAutocomplete(autoCompleteInstance);

//       autoCompleteInstance.addListener('place_changed', () => {
//         const place = autoCompleteInstance.getPlace();
//         if (place.geometry) {
//           setLocation(place.formatted_address);
//           mapInstance.setCenter(place.geometry.location);
//           mapInstance.setZoom(15);
//         }
//       });
//     }
//   }, []);

//   const handleUseMyLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition((position) => {
//         const { latitude, longitude } = position.coords;
//         const myLocation = new window.google.maps.LatLng(latitude, longitude);
//         map.setCenter(myLocation);
//         map.setZoom(15);
//         setLocation('Your current location');
//       });
//     } else {
//       alert('Geolocation is not supported by this browser.');
//     }
//   };
// import React, { useState, useEffect, useRef } from 'react';

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

  const [location, setLocation] = useState('');
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Function to initialize Google Maps
    const initializeMap = () => {
      if (mapRef.current && window.google) {
        const mapOptions = {
          center: { lat: -3.2222, lng: 40.1167 }, // Default location
          zoom: 15,
        };
        const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(mapInstance);

        const autoCompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
        autoCompleteInstance.bindTo('bounds', mapInstance);
        setAutocomplete(autoCompleteInstance);

        autoCompleteInstance.addListener('place_changed', () => {
          const place = autoCompleteInstance.getPlace();
          if (place.geometry) {
            setLocation(place.formatted_address);
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);
          }
        });
      }
    };

    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!googleApiKey) {
        console.error('Google API Key is missing.');
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        script.id = 'google-maps-script';
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    loadGoogleMapsScript();
  }, []);

  const handleUseMyLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const myLocation = new window.google.maps.LatLng(latitude, longitude);
        map.setCenter(myLocation);
        map.setZoom(15);
        setLocation('Your current location');
      });
    } else {
      alert('Geolocation is not supported by this browser or map not initialized.');
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

 
  const handleTitleToggle = async () => {
    if (isEditingTitle) {
      // Save the changes to the server
      try {
        const response = await fetch(`${config.backendUrl}/api/restaurants/${selectedRestaurant?._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant: tableTitle,
            location: restaurantLocation,
            dishCategory: dishCategory,
            restaurantImgUrl: restaurantImageUrl
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Restaurant updated successfully:', result);
          alert('Restaurant updated successfully!');
          // Optionally update the restaurant list or state here with updated fields
        } else {
          console.error('Failed to update restaurant');
          alert('Failed to update restaurant. Please try again.');
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

            {isEditingTitle ? (
              <input
                type="text"
                value={tableTitle}
                onChange={handleTitleChange}
                className="inputHide"
              />

            ) : (
              <h2 className='h2TableTitle'>
                {tableTitle}
              </h2>
            )}
            <button className="hideshow" onClick={handleTitleToggle}>
              {isEditingTitle ? 'Save' : ''}
              <i className={`fa ${isEditingTitle ? 'fa-save' : 'fa-pencil'}`} aria-hidden="true"></i>
            </button>
         
            <button className="deleteButton" onClick={handleDeleteRestaurant}><i className="fas fa-trash"></i></button>

            {/* <h3 className="businessName">{partner?.restaurant}</h3> */}
            {isEditingTitle ? (
              <div>
                <label>
                  Restaurant Name:
                  <input
                    type="text"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                  />
                </label>
                <div className="location-section">
        <label>
          Restaurant Location:
          <input
            type="text"
            placeholder="Enter a location"
            ref={inputRef}
            className="headerInputs"
          />
        </label>
        <button onClick={handleUseMyLocation}>Use My Location</button>
        <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
        <p>Selected Location: {location}</p>
      </div>
                <label>
                  Dish Category:
                  <input
                    type="text"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                  />
                </label>
                {/* <label>
      Restaurant Image URL:
      <input 
        type="text" 
        value={restaurantImageUrl} 
        onChange={(e) => setRestaurantImageUrl(e.target.value)} 
      />
    </label> */}

                {/* <button onClick={handleTitleToggle}>Save</button> */}
              </div>
            ) : (
              <button onClick={handleTitleToggle}></button>
            )}

            {/* Always show the Add Restaurant button */}
            <button className="addRestaurantButton" onClick={handleAddRestaurant}><i className="fa fa-plus" id='addingPlus'></i></button>

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
                  className="headerInputs small-1-input"
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

            <div className="small-4 cell column">
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

        <div className="tableRows">
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
              <button className="editButton" onClick={() => handleEdit(dish)} style={{ display: dish.dishCode === editingDishCode ? 'none' : 'block' }}><i className="fas fa-edit"></i>
              </button>

              <button className="saveButton" onClick={handleSubmit} style={{ display: dish.dishCode === editingDishCode ? 'block' : 'none' }}>Save</button>

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
