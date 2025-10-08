import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import styles from './HeroHeader.module.css';

const HeroHeaderSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const debounceRef = useRef();
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${config.backendUrl}/api/search?q=${encodeURIComponent(query)}`
        );
        const flatSuggestions = [
          ...res.data.categories.map(cat => ({ type: 'category', value: cat })),
          ...(res.data.subcategories?.map(subcat => ({ type: 'subcategory', value: subcat })) || []),
          ...res.data.partners.map(partner => ({ type: 'partner', value: partner.businessName, id: partner._id })),
          ...res.data.products.map(prod => ({ type: 'product', value: prod.name, id: prod._id })),
        ];
        setSuggestions(flatSuggestions);
        setShowDropdown(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion) => {
    setQuery(suggestion.value);
    setSelectedSuggestion(suggestion);
    setShowDropdown(false);
    handleNavigate(suggestion);
  };

  const handleNavigate = (suggestion) => {
    if (!suggestion) return;
    if (suggestion.type === 'partner') {
      navigate(`/menu?shop=${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/menu?category=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'subcategory') {
      navigate(`/menu?subcategory=${encodeURIComponent(suggestion.value)}`);
    } else if (suggestion.type === 'product') {
      navigate(`/menu?product=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (selectedSuggestion) {
      handleNavigate(selectedSuggestion);
      return;
    }

    // Try to match manually if no suggestion selected
    try {
      const res = await axios.get(
        `${config.backendUrl}/api/search?q=${encodeURIComponent(query)}`
      );
      const { categories, subcategories = [], partners, products } = res.data;

      const partner = partners.find(p => p.businessName.toLowerCase() === query.trim().toLowerCase());
      if (partner) return navigate(`/menu?shop=${partner._id}`);

      const category = categories.find(cat => cat.toLowerCase() === query.trim().toLowerCase());
      if (category) return navigate(`/menu?category=${encodeURIComponent(category)}`);

      const subcategory = subcategories.find(subcat => subcat.toLowerCase() === query.trim().toLowerCase());
      if (subcategory) return navigate(`/menu?subcategory=${encodeURIComponent(subcategory)}`);

      if (query.trim().length >= 2 && products.length > 0) {
        return navigate(`/menu?product=${encodeURIComponent(query.trim())}`);
      }

      setShowDropdown(true);
    } catch (err) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div ref={containerRef} className={styles.searchContainer} style={{ position: 'relative' }}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search for anything..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setSelectedSuggestion(null);
        }}
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <i
        className={`fas fa-search ${styles.searchIcon}`}
        onClick={handleSearch}
        style={{ cursor: 'pointer' }}
      ></i>
      {showDropdown && suggestions.length > 0 && (
        <ul className={styles.searchResults}>
          {suggestions.map((sugg, idx) => (
            <li
              key={sugg.type + '-' + (sugg.id || sugg.value) + '-' + idx}
              className={styles.searchResultItem}
              onClick={() => handleSelect(sugg)}
            >
              {sugg.value}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && suggestions.length === 0 && (
        <ul className={styles.searchResults}>
          <li className={styles.searchResultItem}>No results found</li>
        </ul>
      )}
    </div>
  );
};

export default HeroHeaderSearch;
