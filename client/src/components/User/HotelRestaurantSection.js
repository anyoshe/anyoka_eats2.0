import React, { useState, useEffect } from 'react';
import './Profile.css';
import config from '../../config';

const HotelRestaurantSection = ({ partner }) => {
  const [editTitle, setEditTitle] = useState(false);
  const [tableTitle, setTableTitle] = useState('TABLE TITLE');
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
        alert('Dish added successfully!'); // Notify the user
        // Optionally, clear the form or update UI as needed
        setFormData({
          dishCode: '',
          dishName: '',
          dishPrice: '',
          dishCategory: '',
          quantity: '',
          image: null,
          discount: '', // Assuming you want to reset the discount field as well
        });
        setIsEditing(false); // If editing, reset the editing state
      
        // Clear the form or update UI as needed
      } else {
        console.error('Failed to add dish');
        alert('Failed to add dish. Please check the details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  const handleTitleToggle = () => {
    setEditTitle(prevEditTitle => !prevEditTitle);
  };

  const handleTitleChange = (e) => {
    setTableTitle(e.target.value);
  };

  const handleAddRestaurant = async () => {
    const restaurantName = prompt('Please enter the restaurant name:');
    if (restaurantName) {
      try {
        const response = await fetch(`${config.backendUrl}/api/restaurants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: partner._id,
            restaurant: restaurantName,
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
        const result = await response.json();
        console.log('Dish updated successfully:', result);
        alert('Dish updated successfully!');
        // Reset editing state and clear the form
        setIsEditing(false);
        setFormData({
          dishCode: '',
          dishName: '',
          dishPrice: '',
          dishCategory: '',
          quantity: '',
          image: null,
          discount: '', // Reset discount
        });
      } else {
        console.error('Failed to update dish');
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
        setDishes(prevDishes => prevDishes.filter(dish => dish.dishCode !== dishId)); // Filter by dishCode
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
  
  return (
    <div className="menu_table" id="hotelRestaurantSection">

      <div className="column small-12 left_panel">

        <header data-equalizer-watch className="iconHeader">

          <div className="tableTitileChart">

            {editTitle ? (
              <input
                type="text"
                value={tableTitle}
                onChange={handleTitleChange}
                className="inputHide"
              />

            ) : (
              <h2 className='h2TableTitle'>
                {tableTitle}
                <button className="hideshow" onClick={handleTitleToggle}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
              </h2>

            )}

            <h3 className="businessName">{partner?.restaurant}</h3> {/* Display business name here */}

            {/* Always show the Add Restaurant button */}
            <button className="addRestaurantButton" onClick={handleAddRestaurant}>Add</button>

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

        {/* PLUS ICON TO ADD TABLE ROWS INTO THE TABLE */}
        {/* <div className="addRowBtn">
          <i className="fa fa-plus addingPlus"></i>
        </div> */}

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
        <div className="tableRows" key={dish._id}>

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
            <button className="editButton" onClick={() => handleEdit(dish)} style={{ display: dish.dishCode === editingDishCode ? 'none' : 'block' }}><i class="fas fa-edit"></i>
            </button>

            <button className="saveButton" onClick={handleSubmit} style={{ display: dish.dishCode === editingDishCode ? 'block' : 'none' }}>Save</button>

            <button className="deleteButton" onClick={() => handleDelete(dish._id)}><i class="fas fa-trash"></i>
            </button>
              {/* <div className="dishDiv">
  <button
    className="editButton"
    onClick={() => handleEdit(dish)}
    style={{ display: dish.dishCode !== editingDishCode ? 'block' : 'none' }}
    aria-label={`Edit ${dish.dishName}`}
  >
    Edit
  </button>
  <button
    className="saveButton"
    onClick={handleSubmit}
    style={{ display: dish.dishCode === editingDishCode ? 'block' : 'none' }}
    aria-label={`Save changes for ${dish.dishName}`}
  >
    Save
  </button>
  <button
    className="deleteButton"
    onClick={() => handleDelete(dish._id)}
    aria-label={`Delete ${dish.dishName}`}
  >
    Delete
  </button>
</div> */}

            
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default HotelRestaurantSection;
