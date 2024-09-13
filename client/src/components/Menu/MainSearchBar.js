// import React, { useState } from 'react';
// import CategoryDropdown from './CategoryDropdown';
// import RestaurantDropdown from './RestaurantDropdown';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
// import './MainSearchBar.css';

// const MainSearchBar = ({ addToCart }) => {
//     const [showDropdowns, setShowDropdowns] = useState(false);
//     const [selectedOption, setSelectedOption] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');

//     const handleToggleDropdowns = () => {
//         setShowDropdowns(!showDropdowns);
//         setSelectedOption(null);
//     };

//     const handleSearchChange = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     const handleOptionSelect = (option) => {
//         setSelectedOption(option);
//         setShowDropdowns(false);
//     };

//     return (
//         <div className="search-bar-container">
//             <div className="input-group mb-3">
//                 <button onClick={handleToggleDropdowns} className="btn btn-primary">
//                     {showDropdowns ? 'Hide Options' : 'Search By'}
//                 </button>
//                 <input
//                     type="text"
//                     className="form-control search-input"
//                     placeholder="Search for dishes or restaurants..."
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                 />
//                 {selectedOption === 'category' && (
//                     <CategoryDropdown addToCart={addToCart} searchQuery={searchQuery} />
//                 )}
//                 {selectedOption === 'restaurant' && (
//                     <RestaurantDropdown addToCart={addToCart} searchQuery={searchQuery} />
//                 )}
//             </div>
//             {showDropdowns && !selectedOption && (
//                 <div className="dropdown-container">
//                     <button
//                         className="btn btn-secondary m-2"
//                         onClick={() => handleOptionSelect('category')}
//                     >
//                         Order by Cuisine/Dish Type
//                     </button>
//                     <button
//                         className="btn btn-secondary m-2"
//                         onClick={() => handleOptionSelect('restaurant')}
//                     >
//                         Order by Restaurant
//                     </button>
//                 </div>
//             )}
    
//         </div>
//     );
// };

// export default MainSearchBar;
import React, { useState } from 'react';
import CategoryDropdown from './CategoryDropdown';
import RestaurantDropdown from './RestaurantDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './MainSearchBar.css';

const MainSearchBar = ({ addToCart }) => {
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryToggle = () => {
        setShowCategoryDropdown(!showCategoryDropdown);
        setShowRestaurantDropdown(false); // Ensure only one dropdown is visible at a time
    };

    const handleRestaurantToggle = () => {
        setShowRestaurantDropdown(!showRestaurantDropdown);
        setShowCategoryDropdown(false); // Ensure only one dropdown is visible at a time
    };

    return (
        <div className="search-bar-container">
            <div className="input-group mb-3">
                {/* <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search for dishes or restaurants..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                /> */}
                <button onClick={handleCategoryToggle} className="btn_category by_btn">
                    By Categories
                </button>

                <button onClick={handleRestaurantToggle} className="btn_restaurant  by_btn">
                    By Restaurants
                </button>
                
                {showCategoryDropdown && (
                    <CategoryDropdown addToCart={addToCart} searchQuery={searchQuery} />
                )}

                {showRestaurantDropdown && (
                    <RestaurantDropdown addToCart={addToCart} searchQuery={searchQuery} />
                )}
            </div>
        </div>
    );
};

export default MainSearchBar;
