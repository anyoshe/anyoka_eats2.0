 

 

 

 

 

 

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../../config';
import styles from './HeroHeader.module.css';

const HeroHeaderSearch = ({ onSearchSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], partners: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef();
  const containerRef = useRef(null); // NEW

  useEffect(() => {
    if (!query) {
      setResults({ products: [], partners: [], categories: [] });
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        setResults({ products: [], partners: [], categories: [] });
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // 👇 Close dropdown when clicking outside OR inside the input
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      // ✅ Close only when clicking OUTSIDE the search container
      setShowDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

 // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (containerRef.current && containerRef.current.contains(e.target)) {
  //       // Clicked inside search (including input) → close dropdown
  //       setShowDropdown(false);
  //     } else {
  //       // Clicked anywhere else → close dropdown
  //       setShowDropdown(false);
  //     }
  //   };
   //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

 
  const handleSelect = (item, type) => {
    setQuery('');
    setShowDropdown(false);
    if (onSearchSelect) onSearchSelect(item, type);
  };

  return (
    <div ref={containerRef} className={styles.searchContainer} style={{ position: 'relative' }}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search for anything..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoComplete="off"
      />
      <i className={`fas fa-search ${styles.searchIcon}`}></i>
      {showDropdown && (
        <ul className={styles.searchResults}>
          {results.categories.length > 0 && (
            <>
              <li className={styles.searchResultHeader}>Categories</li>
              {results.categories.map(cat => (
                <li
                  key={`cat-${cat}`}
                  className={styles.searchResultItem}
                  onClick={() => handleSelect(cat, 'category')}
                >
                  {cat}
                </li>
              ))}
            </>
          )}
          {results.products.length > 0 && (
            <>
              <li className={styles.searchResultHeader}>Products</li>
              {results.products.map(prod => (
                <li
                  key={`prod-${prod._id}`}
                  className={styles.searchResultItem}
                  onClick={() => handleSelect(prod, 'product')}
                >
                  {prod.name}
                </li>
              ))}
            </>
          )}
          {results.partners.length > 0 && (
            <>
              <li className={styles.searchResultHeader}>Partners</li>
              {results.partners.map(partner => (
                <li
                  key={`partner-${partner._id}`}
                  className={styles.searchResultItem}
                  onClick={() => handleSelect(partner, 'partner')}
                >
                  {partner.businessName}
                </li>
              ))}
            </>
          )}
          {results.categories.length === 0 && results.products.length === 0 && results.partners.length === 0 && (
            <li className={styles.searchResultItem}>No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default HeroHeaderSearch;
