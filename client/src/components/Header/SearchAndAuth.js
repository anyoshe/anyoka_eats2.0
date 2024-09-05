// src/components/header/SearchAndAuth.js

import React, { useState, useEffect } from 'react';
import './SearchAndAuth.css';
import config from '../../config';

const SearchAndAuth = ({ toggleModal }) => { // Destructure toggleModal from props
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [details, setDetails] = useState(null);
  const recognition = new window.webkitSpeechRecognition();

  useEffect(() => {
    const searchInput = document.getElementById('searchQuery');

    const handleInput = async () => {
      const searchTerm = searchInput.value.trim();
      if (!searchTerm) return;

      try {
        const response = await fetch(`${config.backendUrl}/api/searchAny?q=${encodeURIComponent(searchTerm)}&type=suggestion`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setSearchResults(data);
          setDetails(null);
        } else {
          console.error('Unexpected data structure:', data);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSearchResults([]);
      }
    };

    searchInput.addEventListener('input', handleInput);

    return () => {
      searchInput.removeEventListener('input', handleInput);
    };
  }, []);

  const fetchDetails = async (dishCode) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/dishes/details/${encodeURIComponent(dishCode)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && Object.keys(data).length > 0) {
        setDetails(data);
        setSearchResults([]);
      } else {
        console.error('No details found for this dish.');
        setDetails(null);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      setDetails(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setSearchResults([]);
      setDetails(null);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleMicClick = () => {
    setIsRecording(true);
    recognition.start();
  };

  const handleStopClick = () => {
    setIsRecording(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    let saidText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        saidText = event.results[i][0].transcript;
      } else {
        saidText += event.results[i][0].transcript;
      }
    }
    document.getElementById('searchQuery').value = saidText;
    const searchInput = document.getElementById('searchQuery');
    searchInput.dispatchEvent(new Event('input'));
  };

  recognition.onend = () => {
    setIsRecording(false);
  };

  return (
    <div className="search-auth-wrapper">
      <div className="auth-link">
        <a href="#" id="signup-link" onClick={(e) => { e.preventDefault(); toggleModal(); }}>SignIn/Up</a>
      </div>
      <div className="searchBar">
        <div className="search-bar">
          <span className="search-tool-icon"><i className="fas fa-search"></i></span>
          <input type="search" id="searchQuery" placeholder="Search dishes, restaurants, categories" />
          <span id="start" className={`mic-icon ${isRecording ? 'hide' : 'show'}`} onClick={handleMicClick}>
            <i className="fas fa-microphone clickable-mic"></i>
          </span>
          <input
            type="button"
            id="stop"
            className={isRecording ? 'show' : 'hide'}
            value="Stop"
            onClick={handleStopClick}
          />
        </div>
        <div id="searchResults">
          {searchResults.length > 0 && searchResults.map(item => (
            <div
              key={item.dishCode}
              className="suggestion-item"
              data-dish-code={item.dishCode}
              onClick={() => fetchDetails(item.dishCode)}
            >
              {item.dishName} - {item.dishCategory} - {item.restaurant}
            </div>
          ))}
        </div>
        <div id="details">
          {details && (
            <div className="detail-container">
              <img src={details.imageUrl} alt={details.dishName} />
              <h5>{details.dishName}</h5>
              <p>{details.dishDescription}</p>
              <p>Category: {details.dishCategory}</p>
              <p>Restaurant: {details.restaurant}</p>
              <p className="restaurant">Price: {details.dishPrice * 1.2}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndAuth;

