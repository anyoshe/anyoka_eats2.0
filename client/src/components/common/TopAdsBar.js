import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import styles from './TopAdsBar.module.css';
import CategoryControlsBar from './CategoryControlsBar';

const TopAdsBar = ({ 
  onBack, 
  messages,
  // CategoryControlsBar props
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
  showControls = false,
  // Cart props
  onCartClick,
  cartItemCount = 0,
  showCart = false,
}) => {
  const items = messages && messages.length > 0
    ? messages
    : [
        'Today\'s picks are hot — grab your favorites!',
        'Limited-time deals across top categories',
        'Fast delivery on featured items near you',
      ];

  return (
    <div className={styles.topAdsBar} role="region" aria-label="Promotions">
      <div className={styles.adsContent}>
        <button className={styles.backButton} onClick={onBack} aria-label="Go back">
          <FontAwesomeIcon icon={faCaretDown} rotation={90} /> Back
        </button>
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {items.concat(items).map((text, idx) => (
              <span key={idx} className={styles.marqueeItem}>{text}</span>
            ))}
          </div>
        </div>
        {showCart && (
          <button className={styles.cartButton} onClick={onCartClick} aria-label="Open cart">
            <FontAwesomeIcon icon={faCartShopping} />
            {cartItemCount > 0 && (
              <span className={styles.cartBadge}>
                {cartItemCount}
              </span>
            )}
          </button>
        )}
      </div>
      {showControls && (
        <CategoryControlsBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
          priceMin={priceMin}
          onPriceMinChange={onPriceMinChange}
          priceMax={priceMax}
          onPriceMaxChange={onPriceMaxChange}
          selectedVendor={selectedVendor}
          onVendorChange={onVendorChange}
          vendorOptions={vendorOptions}
          ratingThreshold={ratingThreshold}
          onRatingChange={onRatingChange}
          showVendor={showVendor}
          showRating={showRating}
        />
      )}
    </div>
  );
};

export default TopAdsBar;



