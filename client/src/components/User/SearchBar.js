// import React, { useState } from 'react';
// import axios from 'axios';
// import config from '../../config';

// const SearchBar = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchType, setSearchType] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   const handleSearch = async () => {
//     if (!searchQuery) {
//       alert('Please enter a search query');
//       return;
//     }

//     try {
//       const response = await axios.get(`${config.backendUrl}/api/search`, {
//         params: { query: searchQuery, type: searchType }
//       });
//       setSearchResults(response.data);
//     } catch (error) {
//       console.error('Error during search:', error);
//       alert('Failed to fetch search results');
//     }
//   };

//   return (
//     <div>
//       <div className="search-bar">
//         <input
//           type="text"
//           id="searchQuery"
//           placeholder="Search dishes, restaurants, categories"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <select
//           id="searchType"
//           value={searchType}
//           onChange={(e) => setSearchType(e.target.value)}
//         >
//           <option value="">Choose type</option>
//           <option value="dishes">Dishes</option>
//           <option value="restaurants">Restaurants</option>
//           <option value="categories">Categories</option>
//         </select>
//         <button id="searchButton" onClick={handleSearch}>Search</button>
//       </div>
//       <div id="searchResults">
//         {searchResults.length > 0 ? (
//           <ul>
//             {searchResults.map((result, index) => (
//               <li key={index}>
//                 {result.dishName && <div>Dish: {result.dishName}</div>}
//                 {result.restaurant && <div>Restaurant: {result.restaurant}</div>}
//                 {result.dishCategory && <div>Category: {result.dishCategory}</div>}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No results found</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchBar;
import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery) {
      alert('Please enter a search query');
      return;
    }

    try {
      const response = await axios.get(`${config.backendUrl}/api/search`, {
        params: { query: searchQuery, type: searchType }
      });
      setSearchResults(response.data);
      setSelectedResult(null); // Reset selected result
    } catch (error) {
      console.error('Error during search:', error);
      alert('Failed to fetch search results');
    }
  };

  const handleResultClick = async (id) => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/details`, {
        params: { id, type: searchType }
      });
      setSelectedResult(response.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to fetch details');
    }
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          id="searchQuery"
          placeholder="Search dishes, restaurants, categories"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          id="searchType"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="">Choose type</option>
          <option value="dishes">Dishes</option>
          <option value="restaurants">Restaurants</option>
          <option value="categories">Categories</option>
        </select>
        <button id="searchButton" onClick={handleSearch}>Search</button>
      </div>
      <div id="searchResults">
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleResultClick(result._id)}>
                {result.dishName && <div>Dish: {result.dishName}</div>}
                {result.restaurant && <div>Restaurant: {result.restaurant}</div>}
                {result.dishCategory && <div>Category: {result.dishCategory}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
      {selectedResult && (
        <div id="resultDetails">
          <h2>Details</h2>
          {selectedResult.dishName && <div>Dish: {selectedResult.dishName}</div>}
          {selectedResult.restaurant && <div>Restaurant: {selectedResult.restaurant}</div>}
          {selectedResult.dishCategory && <div>Category: {selectedResult.dishCategory}</div>}
          {/* Add more details as required */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

