import React, { useState } from 'react';
import './orderSearch.css';
import CategoryDropdown from './CategoryDropdown';
import RestaurantDropdown from './RestaurantDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const SearchBar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <form>
      <div className="search-bar-container">
          <div className="dropdown-section">
            <button
              className="dropdown-toggle btn btn-primary"
              type="button"
              onClick={toggleDropdown}>
              Search By
            </button>
              <div className='dropdownContainer'>
                {dropdownVisible && (
                  <>
                    <CategoryDropdown />
                    <RestaurantDropdown />
                  </>
              )}
            </div>
          </div>

        <input
          id="category"
          name="category"
          placeholder="Second By"
          className="secondSearch"
        />
      </div>
    </form>
  );
};

export default SearchBar;