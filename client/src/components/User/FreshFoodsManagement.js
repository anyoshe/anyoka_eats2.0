import React, { useState, useEffect } from 'react';
import './Profile.css';
import config from '../../config';

const FreshFoodsManagement = ({ partner }) => {
  const [editTitle, setEditTitle] = useState(false);
  const [tableTitle, setTableTitle] = useState('TABLE TITLE');
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
  const [vendorLocation, setVendorLocation] = useState('');

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


    const formDataToSend = new FormData();
    formDataToSend.append('foodCode', formData.foodCode);
    formDataToSend.append('foodName', formData.foodName);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('foodPrice', formData.foodPrice);
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('foodCategory', formData.foodCategory);
    formDataToSend.append('vendor', selectedVendor?.vendor || '');
    formDataToSend.append('vendorLocation', vendorLocation || ''); // Directly use vendorLocation
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
        alert('Food added successfully!');
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
        alert('Failed to add food. Please check the details.');
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
    formDataToSend.append('vendorLocation', vendorLocation?.vendorLocation || '');
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
          discount: '', // Reset discount
        });
      } else {
        console.error('Failed to update food');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('Failed to update food. Please check the details.');
    }
  };


  const handleDelete = async (foodId) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/foods/${foodId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFoods(prevFoods => prevFoods.filter(food => food.foodCode !== foodId));
        alert('Food deleted successfully!');
      } else {
        alert('Failed to delete food. Please try again later.');
      }
    } catch (error) {
      alert('An error occurred while trying to delete the food.');
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
            {/* </div> */}

            <h4 className="vendorLocation">
              {vendorLocation}
            </h4>

            {/* Always show the Add Restaurant button */}
            <button className="addRestaurantButton" onClick={handleAddVendor}>Add Grocer Name</button>

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
                <input
                  type="text"
                  placeholder="Food Category"
                  className="headerInputs"
                  name="foodCategory"
                  value={formData.foodCategory}
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
                <button className="editButton" onClick={() => handleEdit(food)} style={{ display: food.foodCode === editingFoodCode ? 'none' : 'block' }}><i class="fas fa-edit"></i></button>

                <button className="saveButton" onClick={handleSubmit} style={{ display: food.foodCode === editingFoodCode ? 'block' : 'none' }}>Save</button>

                <button className="deleteButton" onClick={() => handleDelete(food._id)}><i class="fas fa-trash"></i></button>

              </div>
            </div>
          ))
        }

      </div >
    </div >
  );
};

export default FreshFoodsManagement;
