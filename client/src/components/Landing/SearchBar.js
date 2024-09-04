import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import config from '../../config';
import './SearchBar.css';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [details, setDetails] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const speechRecognition = new window.webkitSpeechRecognition();
            speechRecognition.continuous = false;
            speechRecognition.interimResults = false;
            speechRecognition.onresult = (event) => {
                let saidText = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        saidText = event.results[i][0].transcript;
                    } else {
                        saidText += event.results[i][0].transcript;
                    }
                }
                setSearchTerm(saidText);
                setIsRecording(false);
                fetchSuggestions(saidText); 
            };
            speechRecognition.onend = () => {
                setIsRecording(false);
            };
            setRecognition(speechRecognition);
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }, []);

    const handleSearchInputChange = (e) => {
        const searchTerm = e.target.value;
        setSearchTerm(searchTerm);
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        fetchSuggestions(searchTerm);
    };

    const fetchSuggestions = async (searchTerm) => {
        try {
            const response = await axios.get(`${config.backendUrl}/api/searchAny?q=${encodeURIComponent(searchTerm)}&type=suggestion`);
            if (response.data && Array.isArray(response.data)) {
                setSearchResults(response.data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSearchResults([]);
        }
    };

    const fetchDetails = async (dishCode) => {
        try {
            const response = await axios.get(`${config.backendUrl}/api/dishes/details/${encodeURIComponent(dishCode)}`);
            setDetails(response.data);
            setSearchResults([]);
        } catch (error) {
            console.error('Error fetching details:', error);
            setDetails(null);
        }
    };

    const handleSuggestionClick = (dishCode) => {
        fetchDetails(dishCode);
    };

    const handleStartRecording = () => {
        if (recognition) {
            setIsRecording(true);
            recognition.start();
        }
    };

    const handleStopRecording = () => {
        if (recognition) {
            setIsRecording(false);
            recognition.stop();
        }
    };

    return (
        <div className="searchBar">

            <div className="search__container">
                <input
                    type="text"
                    id="searchQuery"
                    className="search__input"
                    placeholder="What would you like....?"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                />

                <span id="start" className={`mic-icon ${!isRecording ? 'show' : 'hide'}`}>
                    <FontAwesomeIcon icon={faMicrophone} onClick={handleStartRecording} />
                </span>

                <input
                    type="button"
                    id="stop"
                    className={isRecording ? 'show' : 'hide'}
                    value="Stop"
                    onClick={handleStopRecording}
                />
                
            </div>

            <div id="searchResults">
                {searchResults.map((item) => (
                    <div
                        key={item.dishCode}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item.dishCode)}
                    >
                        {/* {item.dishName} - {item.dishCategory} - {item.restaurant} */}
                        <span>{item.dishName}</span>  <span>{item.dishCategory}</span>  <span>{item.restaurant}</span>
                    </div>
                ))}
            </div>

            <div id="details">
                {details && (
                    <div className="detail-container">
                        <div className='result_display img-result_display'>
                            <img src={`${config.backendUrl}${details.imageUrl}` } alt={details.dishName} />
                             {/* const imageUrl = `${config.backendUrl}${food.imageUrl}`; */}
                        </div>

                        <div className='result_display result-result_display'>
                            <h5 className='search_h5'>{details.dishName}</h5>
                            <p>{details.dishDescription}</p>
                            {/* <p>Category: {details.dishCategory}</p> */}
                            <p>{details.dishCategory}</p>
                            {/* <p>Restaurant: {details.restaurant}</p> */}
                            <p>{details.restaurant}</p>
                            <p className="restaurant">Price: {details.dishPrice * 1.2}</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
 
export default SearchBar;
 
 