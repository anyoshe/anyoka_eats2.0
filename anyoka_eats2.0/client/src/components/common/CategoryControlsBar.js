import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './CategoryControlsBar.module.css';

const CategoryControlsBar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  selectedVendor,
  onVendorChange,
  vendorOptions = [],
  ratingThreshold,
  onRatingChange,
  showVendor = true,
  showRating = true,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`${styles.controlsBar} ${styles.stickyControls}`}>
      <div className={styles.searchBarLarge}>
        <div className={styles.searchFieldWrapper}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInputLarge}
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label="Search within items"
          />
        </div>
        <button 
          className={styles.hamburgerButton}
          onClick={toggleFilters}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <FontAwesomeIcon icon={showFilters ? faTimes : faBars} />
        </button>
      </div>
      <div className={`${styles.controlsGroup} ${showFilters ? styles.showFilters : styles.hideFilters}`}>
        <div className={styles.row2Group}>
          <select
            className={`${styles.select} ${styles.selectSort}`}
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            aria-label="Sort products"
          >
            <option value="relevance">Relevance</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="rating_high_low">Rating: High to Low</option>
          </select>

          <input
            type="number"
            className={styles.input}
            placeholder="Min"
            value={priceMin}
            onChange={(e) => onPriceMinChange?.(e.target.value)}
            aria-label="Minimum price"
          />
          <span className={styles.rangeDash}>-</span>
          <input
            type="number"
            className={styles.input}
            placeholder="Max"
            value={priceMax}
            onChange={(e) => onPriceMaxChange?.(e.target.value)}
            aria-label="Maximum price"
          />
        </div>

        <div className={styles.row3Group}>
          {showVendor && (
            <select
              className={`${styles.select} ${styles.selectVendor}`}
              value={selectedVendor}
              onChange={(e) => onVendorChange?.(e.target.value)}
              aria-label="Filter by vendor"
            >
              <option value="">All vendors</option>
              {vendorOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}

          {showRating && (
            <select
              className={`${styles.select} ${styles.selectRating}`}
              value={ratingThreshold}
              onChange={(e) => onRatingChange?.(e.target.value)}
              aria-label="Minimum rating"
            >
              <option value="0">Any rating</option>
              <option value="4">4.0+ stars</option>
              <option value="3">3.0+ stars</option>
              <option value="2">2.0+ stars</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryControlsBar;


