import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import "./AddFood.css";

const AddFood = () => {
  const [foodCode, setFoodCode] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('foodCode', foodCode);
    formData.append('foodName', foodName);
    formData.append('quantity', quantity);
    formData.append('foodPrice', foodPrice);
    formData.append('foodCategory', foodCategory);
    formData.append('vendor', vendor);
    formData.append('foodDescription', foodDescription);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post(`${config.backendUrl}/api/food`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Food added successfully!');

        setFoodCode('');
        setFoodName('');
        setQuantity(1);
        setFoodPrice('');
        setFoodCategory('');
        setVendor('');
        setFoodDescription('');
        setImage(null);
    } catch (error) {
      setMessage('Error adding food. Please try again.');
      console.error('Error adding food:', error);
    }
  };

  return (
    <div className='fresh_Page_wrapper'>

      <header data-equalizer-watch className="tableHeader">
        {/* TITLE AND TITLE CHANGE */}
        <div className="confereenceTitileChart">
          <h2 className='h2TableTitle'>
            TABLE TITLE
            <button className="conference-pencil">
              <i className="fa fa-pencil" aria-hidden="true"></i>
            </button>
          </h2>
        </div>

        {/* MENU SEARCH INPUT FIELD */}
        <div className="CONFERENCE_input">
          <input
            type="text"
            className="conference-search_menu"
            placeholder="Search Menu Items"
          />
          <button className="search_conference_btn">Search</button>
        </div>
      </header>  

      <form onSubmit={handleSubmit} className='fresh_Page_form'>

        <div className='fresh_Page_divs'>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className='fresh_Page_inputs'
            id='fresh_Page_inputs'
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="text"
            value={foodCode}
            placeholder='Food Code'
            onChange={(e) => setFoodCode(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="text"
            value={foodName}
            placeholder='Food Name'
            onChange={(e) => setFoodName(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="number"
            value={foodPrice}
            placeholder='Food Price'
            onChange={(e) => setFoodPrice(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="text"
            value={foodCategory}
            placeholder='Food Category'
            onChange={(e) => setFoodCategory(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <div className='fresh_Page_divs'>
          <input
            type="text"
            value={vendor}
            placeholder='Vendor'
            onChange={(e) => setVendor(e.target.value)}
            className='fresh_Page_inputs'
            required
          />
        </div>

        <button type="submit" className='fresh_Page_btn'>Add Food</button>
      </form>
      {message && <p>{message}</p>}

      <div className='fresh_table_headers'>
        <div className="freshHeaderDiv">Images</div>
        <div className="freshHeaderDiv">Code</div>
        <div className="freshHeaderDiv">Name</div>
        <div className="freshHeaderDiv">Quantity</div>
        <div className="freshHeaderDiv">Price</div>
        <div className="freshHeaderDiv">Category</div>
        <div className="freshHeaderDiv">Vendor</div>
        <div className="freshHeaderDiv">Action</div>
      </div>
    </div>
  );
};

export default AddFood;
