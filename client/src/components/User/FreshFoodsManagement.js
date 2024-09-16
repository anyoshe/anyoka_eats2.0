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


const FreshFoodsManagement = ({ partner }) => {
  const [editTitle, setEditTitle] = useState(false);
  // const [tableTitle, setTableTitle] = useState('TABLE TITLE');
  const [formData, setFormData] = useState({
    foodCode: '',
    foodName: '',
    foodPrice: '',
    foodCategory: '',
    quantity: '',
    image: null,
    discount: '',
    foodDescription: ''
  });
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAddVendorPrompt, setShowAddVendorPrompt] = useState(false);
  const [foods, setFoods] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFoodCode, setEditingFoodCode] = useState(null);
  // const [vendorLocation, setVendorLocation] = useState('');


  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [tableTitle, setTableTitle] = useState(selectedVendor?.vendorName || "");
  const [vendorLocation, setVendorLocation] = useState(selectedVendor?.location || "");
  const [foodCategory, setFoodCategory] = useState(selectedVendor?.foodCategory || "");
  const [vendorImageUrl, setVendoImageUrl] = useState(selectedVendor?.vendorImgUrl || "");

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
    fetchVendors();
  }, [partner]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/vendors/${partner._id}`);
      if (response.status === 404) {
        setShowAddVendorPrompt(true);
        setVendors([]);
      } else {
        const data = await response.json();
        setVendors(data);
        setShowAddVendorPrompt(false);
        if (data.length === 1) {
          const singleVendor = data[0];
          setSelectedVendor(singleVendor);
          setTableTitle(singleVendor.vendor);
          setVendorLocation(singleVendor.vendorLocation); // Set the vendor location
          fetchFoods(singleVendor.vendor); // Automatically fetch dishes
        }
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchFoods = async (vendorName) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/partner_foods?vendorName=${encodeURIComponent(vendorName)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const { foods } = result;
      if (Array.isArray(foods)) {
        const sortedFoods = foods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFoods(sortedFoods);
      } else {
        console.error('Expected an array but got:', foods);
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setTableTitle(vendor.vendor);
    setVendorLocation(vendor.vendorLocation); // This updates the vendor location directly
    fetchFoods(vendor.vendor);
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
    formDataToSend.append('foodCode', formData.foodCode);
    formDataToSend.append('foodName', formData.foodName);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('foodPrice', formData.foodPrice);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('foodCategory', formData.foodCategory);
    formDataToSend.append('vendor', selectedVendor?.vendor || '');
    formDataToSend.append('foodDescription', formData.foodDescription || '');
    formDataToSend.append('partnerId', partner._id);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/foods`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Food added successfully:', result);

        // Update the foods state with the newly added food item
        setFoods(prevFoods => [...prevFoods, result.food]);

        alert('Food added successfully!');

        // Clear the form
        setFormData({
          foodCode: '',
          foodName: '',
          foodPrice: '',
          foodCategory: '',
          quantity: '',
          image: null,
          discount: '',
          foodDescription: ''
        });

        setIsEditing(false);
      } else {
        console.error('Failed to add food');
        alert('Failed to add food. Please check the details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  const handleTitleToggle = async () => {
    if (!isEditingTitle) {
      // Prefill the form fields with current values from selectedVendor before editing
      if (selectedVendor) {
        setTableTitle(selectedVendor.vendor || '');
        setAddress(selectedVendor.vendorLocation || '');
        setFoodCategory(selectedVendor.foodCategory || '');
      }
    }

    // If user was editing and is now saving
    if (isEditingTitle) {
      // Create an object with only changed fields
      const updatedData = {};

      // Only add fields that have been modified (and are not empty)
      if (tableTitle && tableTitle !== selectedVendor?.vendor) {
        updatedData.vendor = tableTitle;
      }
      if (address && address !== selectedVendor?.vendorLocation) {
        updatedData.vendorLocation = address;
      }
      if (foodCategory && foodCategory !== selectedVendor?.foodCategory) {
        updatedData.foodCategory = foodCategory;
      }

      // Only proceed if there are changes to send
      if (Object.keys(updatedData).length > 0) {
        try {
          const response = await fetch(`${config.backendUrl}/api/vendors/${selectedVendor?._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData), // Send only updated fields
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Vendor updated successfully:', result);
            alert('Vendor updated successfully!');
          } else {
            console.error('Failed to update vendor');
            alert('Failed to update vendor. Please try again.');
          }
        } catch (error) {
          console.error('Error updating vendor:', error);
          alert('Error updating vendor. Please try again.');
        }
      } else {
        alert('No changes made');
      }
    }

    setIsEditingTitle(!isEditingTitle); // Toggle edit mode
  };


  const handleTitleChange = (e) => {
    setTableTitle(e.target.value);
    setVendorLocation(e.target.value); // Update the vendor location
  };

  const handleAddVendor = async () => {
    const vendorName = prompt('Please enter the vendor name:');
    const vendorLocation = prompt('Please enter the vendor location:');
    if (vendorName && vendorLocation) {
      try {
        const response = await fetch(`${config.backendUrl}/api/vendors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: partner._id,
            vendor: vendorName,
            vendorLocation: vendorLocation,
            foodCategory: 'Default Category',
            vendorImgUrl: ''
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        await fetchVendors();
        const newVendor = vendors.find(vendor => vendor.vendor === vendorName);
        if (newVendor) {
          setSelectedVendor(newVendor);
          setTableTitle(newVendor.vendor);
          setVendorLocation(newVendor.vendorLocation);
        }
      } catch (error) {
        console.error('Error adding vendor:', error);
      }
    }
  };

  const handleEdit = (food) => {
    setFormData({
      foodCode: food.foodCode,
      foodName: food.foodName,
      foodPrice: food.foodPrice,
      foodCategory: food.foodCategory,
      quantity: food.quantity,
      image: food.image,
      discount: food.discount,
      vendorLocation: food.vendorLocation
    });
    setEditingFoodCode(food.foodCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct form data
    const formDataToSend = new FormData();
    formDataToSend.append('foodCode', formData.foodCode);
    formDataToSend.append('foodName', formData.foodName);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('foodPrice', formData.foodPrice);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('foodCategory', formData.foodCategory);
    formDataToSend.append('vendor', selectedVendor?.vendor || '');
    formDataToSend.append('vendorDescription', formData.vendorDescription || '');
    formDataToSend.append('partnerId', partner._id);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/foods/${formData.foodCode}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Food updated successfully:', result);

        // Update the food item in the state
        setFoods(prevFoods =>
          prevFoods.map(food =>
            food.foodCode === result.food.foodCode ? result.food : food
          )
        );

        alert('Food updated successfully!');
        // Reset editing state and clear the form
        setIsEditing(false);
        setFormData({
          foodCode: '',
          foodName: '',
          foodPrice: '',
          foodCategory: '',
          quantity: '',
          image: null,
          discount: '',
          foodDescription: ''
        });
        setEditingFoodCode(null);
      } else {
        console.error('Failed to update food');
        alert('Failed to update food. Please check the details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Failed to update food. Please check the details.');
    }
  };

  const handleDelete = async (foodId) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/foods/${foodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // If the deletion was successful, remove the item from the frontend list
        setFoods(prevFoods => prevFoods.filter(food => food._id !== foodId));
        alert('Food item successfully deleted.');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete food item: ${errorData.message}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleDeleteVendor = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vendor and all its foods? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`${config.backendUrl}/api/vendors/${selectedVendor._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Vendor and its foods have been deleted successfully.');
          // Update the local state to remove the deleted restaurant
          setVendors(vendors.filter(vendor => vendor._id !== selectedVendor._id));
          setSelectedVendor(null);
          setTableTitle('TABLE TITLE');
          setFoods([]);
        } else {
          console.error('Failed to delete vendor');
          alert('Failed to delete vendor. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor. Please try again.');
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
                  {vendorLocation}
                </h4>

                <div className='func_div'>

                  <button className="hideshow func_icons" onClick={handleTitleToggle}>

                    {/* {isEditingTitle ? 'Save' : ''} */}
                    <i className={`fa ${isEditingTitle ? 'fa-save' : 'fa-edit'}`} aria-hidden="true"></i>

                  </button>

                  <button className="func_icons func_icons_delete" onClick={handleDeleteVendor}><i className="fas fa-trash"></i></button>

                  {/* Close Button when in editing mode */}
                  {isEditingTitle && (
                    <button className="closeButton func_icons func_icons_close" onClick={() => setIsEditingTitle(false)}>
                      {/* Close  */}
                      <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                  )}

                  {/* <button className="func_icons func_icons_delete" onClick={handleDeleteVendor}><i className="fas fa-trash"></i></button> */}
                </div>  
              </h2>
            {/* )} */}

            {isEditingTitle ? (
              <div>

                <label className='tableEditLabels'>
                  {/* Vendor Name: */}
                  Name:

                  <br></br>

                  <input
                    type="text"
                    value={tableTitle}
                    onChange={(e) => setTableTitle(e.target.value)}
                    className='tableEditInput'
                  />
                </label>

                <label className='tableEditLabels'>
                  Category:
                  
                  <br></br>

                  <input
                    type="text"
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    className='tableEditInput'
                  />
                </label> 

                <br></br>

                <label className='tableEditLabels'>
                    Location:

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
                    Vendor Location:
                  </label> */}

                  {/* <label className='tableEditLabels'>
                    Location:

                    <br></br>

                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setTableTitle(e.target.value)}
                      className='tableEditInput locationtableEdit'
                    />
                  </label> */}

                  <div id="map99" ref={mapRef} style={{ width: '100%', height: '400px' }}></div>

                  {/* <input
                    type="text"
                    placeholder="Enter a location"
                    ref={inputRef}
                    className="headerInputs"
                  /> */}

                  <button onClick={handleUseMyLocation} className='orUseBtn'> Or Use My Location</button>

                  {/* <p>Selected Address: {address}</p> */}

                </div>

                {/* <label>
                  Food Category:
                  <input
                    type="text"
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                  />
                </label> */}


              </div>
            ) : (
              <button onClick={handleTitleToggle}></button>
            )}

            {/* Always show the Add Restaurant button */}
            {/* <button className="addRestaurantButton" onClick={handleAddVendor}><i className="fa fa-plus" id='addingPlus'></i></button> */}
            <button className="addShopButton" onClick={handleAddVendor}>Add a Shop</button>

            {/* Show dropdown if there are 2 or more restaurants */}
            {vendors.length > 1 && (
              <div className="restaurantSelection">
                <select onChange={(e) => handleVendorSelect(JSON.parse(e.target.value))} className='choose_select'>
                  <option value="" className='choose_select_options'>Select a Grocer</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={JSON.stringify(vendor)}>
                      {vendor.vendor}
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
                  placeholder="Food Code"
                  className="headerInputs"
                  name="foodCode"
                  value={formData.foodCode}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="small-2 cell column">
              <label>
                <input
                  type="text"
                  placeholder="Food Name"
                  className="headerInputs"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="small-3 cell column">
              <label>
                <input
                  type="text"
                  placeholder="Food Price"
                  className="headerInputs"
                  name="foodPrice"
                  value={formData.foodPrice}
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
                <select
                  className="headerInputs"
                  name="foodCategory"
                  value={formData.foodCategory}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Food Category</option>
                  <option value="Fruits and Vegetables">Fruits & Vegetables</option>
                  <option value="Grains and Cereals">Grains & Cereals</option>
                  <option value="Spices">Spices</option>
                  <option value="Tubers and Roots">Tubers & Roots</option>
                  <option value="Meat and Poultry">Meat & Poultry</option>
                  <option value="Dairy and Eggs">Dairy & Eggs</option>
                  <option value="Sea Foods and Fish">Sea Foods & Fish</option>
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
              <button type="submit" className="submitButton addRowBtn"><i className="fa fa-plus addingPlus"></i></button>
            </div>
          </div>
        </form>

        {/* TABLE DISPLAY AREA */}

        <div className="tableRows">
          <div className="headerDiv">Picture</div>
          <div className="headerDiv">Food Code</div>
          <div className="headerDiv">Name</div>
          <div className="headerDiv">Price</div>
          <div className="headerDiv">Discount</div> {/* New column for discount */}
          <div className="headerDiv">Category</div>
          <div className="headerDiv">Quantity</div>
          <div className="headerDiv">Action</div>
        </div>

        {/* Display fetched dishes here */}
        {
          foods.map(food => (
            <div className="tableRows" key={food._id}>

              <div className="dishDiv">

                {/* <img src={dish.imageUrl} alt={dish.dishName} className="dishImage" /> */}
                <img src={`${config.backendUrl}${food.imageUrl}`} alt={food.foodName} className="dishImagePartner" />
              </div>
              <div className="dishDiv headerspecial">{food.foodCode}</div>
              <div className="dishDiv">{food.foodName}</div>
              <div className="dishDiv headerspecial">{food.foodPrice}</div>
              <div className="dishDiv  headerspecial">{food.discount}%</div> {/* Display discount */}
              <div className="dishDiv">{food.foodCategory}</div>
              <div className="dishDiv headerspecial">{food.quantity}</div>

              <div className="dishDiv dishdiv_button">
                <button className="editButton" onClick={() => handleEdit(food)} style={{ display: food.foodCode === editingFoodCode ? 'none' : 'block' }}><i className="fas fa-edit"></i></button>

                <button className="saveButton" onClick={handleSubmit} style={{ display: food.foodCode === editingFoodCode ? 'block' : 'none' }}>Save</button>

                <button className="deleteButton" onClick={() => handleDelete(food._id)}><i className="fas fa-trash"></i></button>

              </div>
            </div>
          ))
        }

      </div >
    </div >
  );
};

export default FreshFoodsManagement;
