import React, { useState } from 'react';
import CategoryDropdown from './CategoryDropdown';
import RestaurantDropdown from './RestaurantDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './MainSearchBar.css';

const MainSearchBar = ({ addToCart }) => {
    const [showDropdowns, setShowDropdowns] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggleDropdowns = () => {
        setShowDropdowns(!showDropdowns);
        setSelectedOption(null);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setShowDropdowns(false);
    };

    return (
        <div className="search-bar-container">
            <div className="input-group mb-3">
                <button onClick={handleToggleDropdowns} className="btn btn-primary">
                     {showDropdowns ? 'Hide Options' : 'Search By'}
                </button>
                <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search for dishes or restaurants..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {selectedOption === 'category' && (
                    <CategoryDropdown addToCart={addToCart} searchQuery={searchQuery} />
                )}
                {selectedOption === 'restaurant' && (
                    <RestaurantDropdown addToCart={addToCart} searchQuery={searchQuery} />
                )}
            </div>
            {showDropdowns && !selectedOption && (
                <div className="dropdown-container">
                    <button
                        className="btn btn-secondary m-2"
                        onClick={() => handleOptionSelect('category')}
                    >
                        Order by Cuisine/Dish Type
                    </button>
                    <button
                        className="btn btn-secondary m-2"
                        onClick={() => handleOptionSelect('restaurant')}
                    >
                        Order by Restaurant
                    </button>
                </div>
            )}
    
        </div>
    );
};

export default MainSearchBar;
