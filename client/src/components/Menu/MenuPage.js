import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MenuPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import config from '../../config';
import ProductDetailModal from './ProductDetailModal';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add this import
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import CartSection from '../User/CartSection';
import { CartContext } from '../../contexts/CartContext';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import Logout from '../User/UserLogout';
import TopAdsBar from '../common/TopAdsBar';
import CategoryControlsBar from '../common/CategoryControlsBar';


const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');
  const selectedSubcategory = params.get('subcategory');
  const selectedProductQuery = params.get('product');
  const shopId = params.get("shop");
  const { currentProduct, setCurrentProduct, user, setRedirectPath } = useContext(AuthContext);
  const [productsByCategory, setProductsByCategory] = useState({});
  const { cart, addToCart } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [ratingThreshold, setRatingThreshold] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  const getVendorName = React.useCallback((p) => {
    return (
      p?.shop?.shopName ||
      p?.vendor?.shopName ||
      p?.vendor?.name ||
      p?.store?.businessName ||
      p?.partner?.businessName ||
      p?.shopName ||
      p?.businessName ||
      ''
    );
  }, []);



  useEffect(() => {
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let products = [];

        if (shopId) {
          // ✅ fetch products by shop
          const res = await axios.get(`${config.backendUrl}/api/products/by-shop/${shopId}`);
          products = res.data.products || [];
          setProductsByCategory({ Shop: products });
          setProducts(products);
        } else if (selectedSubcategory) {
          // ✅ fetch products by subcategory
          const res = await axios.get(`${config.backendUrl}/api/product/search?subcategory=${encodeURIComponent(selectedSubcategory)}`);
          products = res.data.products || [];
          setProductsByCategory({ [selectedSubcategory]: products });
          setProducts(products);

        } else {
          const response = await axios.get(`${config.backendUrl}/api/all-products`);
          const products = response.data.products || [];
          const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.category]) {
              acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
          }, {});

          setProductsByCategory(groupedProducts);
          setProducts(products);

          // ✅ Filter for product search
          if (selectedProductQuery) {
            const filtered = products.filter(p =>
              p.name.toLowerCase().includes(selectedProductQuery.toLowerCase())
            );
            setProductsByCategory({ Search: filtered }); // store under "Search"
          }
        }
      } catch (error) {
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, selectedProductQuery, shopId]);



  // Decide base list according to current context (category, shop, search)
  const baseList = useMemo(() => {
    if (loading) return [];
    if (shopId && productsByCategory['Shop']) return productsByCategory['Shop'];
    if (selectedProductQuery && productsByCategory['Search']) return productsByCategory['Search'];
    if (selectedCategory && productsByCategory[selectedCategory]) return productsByCategory[selectedCategory];
    if (selectedSubcategory && productsByCategory[selectedSubcategory]) return productsByCategory[selectedSubcategory];
    return [];
  }, [loading, productsByCategory, selectedCategory, selectedSubcategory, selectedProductQuery, shopId]);

  // Apply filters and sorting
  const visibleProducts = useMemo(() => {
    let list = [...baseList];

    // Price filter
    const min = priceMin !== '' ? parseFloat(priceMin) : null;
    const max = priceMax !== '' ? parseFloat(priceMax) : null;
    if (min !== null || max !== null) {
      list = list.filter((p) => {
        const price = typeof p.discountedPrice === 'number' && p.discountedPrice > 0 ? p.discountedPrice : p.price;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        return true;
      });
    }

    // Vendor filter (by vendor/shop name heuristic)
    if (selectedVendor) {
      list = list.filter((p) => getVendorName(p) === selectedVendor);
    }

    // Rating threshold
    const threshold = parseFloat(ratingThreshold) || 0;
    if (threshold > 0) {
      list = list.filter((p) => (p.ratings?.average || 0) >= threshold);
    }

    // Search by product name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low_high':
        list.sort((a, b) => {
          const pa = (typeof a.discountedPrice === 'number' && a.discountedPrice > 0 ? a.discountedPrice : a.price) ?? 0;
          const pb = (typeof b.discountedPrice === 'number' && b.discountedPrice > 0 ? b.discountedPrice : b.price) ?? 0;
          return pa - pb;
        });
        break;
      case 'price_high_low':
        list.sort((a, b) => {
          const pa = (typeof a.discountedPrice === 'number' && a.discountedPrice > 0 ? a.discountedPrice : a.price) ?? 0;
          const pb = (typeof b.discountedPrice === 'number' && b.discountedPrice > 0 ? b.discountedPrice : b.price) ?? 0;
          return pb - pa;
        });
        break;
      case 'rating_high_low':
        list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      default:
        break; // relevance (server order)
    }

    return list;
  }, [baseList, sortBy, priceMin, priceMax, searchQuery, selectedVendor, ratingThreshold, getVendorName]);

  // Compute category chips list and vendor options
  const categoryChips = useMemo(() => {
    const keys = Object.keys(productsByCategory || {});
    return keys.filter((k) => k !== 'Shop' && k !== 'Search');
  }, [productsByCategory]);

  const vendorOptions = useMemo(() => {
    const names = new Set();
    baseList.forEach((p) => {
      const n = getVendorName(p);
      if (n) names.add(n);
    });
    return Array.from(names).sort();
  }, [baseList, getVendorName]);



  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };


  const handleAddToCart = (product) => {
    const priceToUse = product.discountedPrice ?? product.price;
    const productToAdd = {
      ...product,
      price: priceToUse,
      quantity: 1,
    };
    addToCart(productToAdd);
  };


  const getImageSrc = (product) => {
    const stripServerPath = (fullPath) =>
      fullPath.replace('/mnt/shared/Projects/anyoka_eats2.0/online_hotel', '');


    if (product.primaryImage) {
      return `${config.backendUrl}${stripServerPath(product.primaryImage)}`;
    }


    if (product.images && product.images.length > 0) {
      return `${config.backendUrl}${stripServerPath(product.images[0])}`;
    }

    return '/path/to/placeholder-image.jpg'; // Fallback to a placeholder image
  };

  const renderStars = (averageRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={i <= Math.round(averageRating) ? solidStar : regularStar}
          className="star-icon"
        />
      );
    }
    return stars;
  };

  const handleImageLoad = (productId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [productId]: 'loaded'
    }));
  };

  const handleImageError = (productId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [productId]: 'error'
    }));
  };

  const handleImageStart = (productId) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [productId]: 'loading'
    }));
  };

  return (
    <div className={styles.storeWrapper}>
      <TopAdsBar
        onBack={() => navigate(-1)}
        showControls={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceMin={priceMin}
        onPriceMinChange={setPriceMin}
        priceMax={priceMax}
        onPriceMaxChange={setPriceMax}
        selectedVendor={selectedVendor}
        onVendorChange={setSelectedVendor}
        vendorOptions={vendorOptions}
        ratingThreshold={ratingThreshold}
        onRatingChange={setRatingThreshold}
        showCart={true}
        onCartClick={() => setShowCart(true)}
        cartItemCount={cart.reduce((total, item) => total + (item.quantity || 1), 0)}
      />


      {/* <Logout /> */}


      <div className={styles.bodyWrapper}>
        <section className={styles.dispalySection}>
          {/* <div className={styles.cartTopDiv}>
        <button className={styles.floatingCartIcon} onClick={() => setShowCart(true)}>
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </div> */}

          {showCart && (
            <div className={styles.cartModal} onClick={() => setShowCart(false)}>
              <div className={styles.cartModalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeCartBtn} aria-label="Close cart" onClick={() => setShowCart(false)}>×</button>
                <CartSection />
              </div>
            </div>
          )}



          {loading ? (
            <>
              <div className={`${styles.controlsBar} ${styles.stickyControls}`}>
                <div className={styles.resultMeta}>Loading...</div>
                <div className={styles.controlsGroup}>
                  <select className={styles.select} disabled>
                    <option>Sort by</option>
                  </select>
                  <input className={styles.input} placeholder="Min" disabled />
                  <span className={styles.rangeDash}>-</span>
                  <input className={styles.input} placeholder="Max" disabled />
                  <input className={styles.searchInput} placeholder="Search items..." disabled />
                </div>
              </div>
              <section className={styles.categorySectionDisplay}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                    <div className={styles.skeletonButton} />
                  </div>
                ))}
              </section>
            </>
          ) : (
            <>

              {visibleProducts.length === 0 ? (
                <div className={styles.emptyCatalogState} role="status" aria-live="polite">
                  <div className={styles.emptyCatalogIconWrap}>
                    <FontAwesomeIcon icon={faBoxOpen} className={styles.emptyCatalogIcon} />
                  </div>
                  <p className={styles.emptyCatalogTitle}>No items in this category yet</p>
                  <p className={styles.emptyCatalogSubtext}>We’re curating great options. Please check back soon.</p>
                </div>
              ) : (
                <section className={styles.categorySectionDisplay}>
                  {visibleProducts.map((product) => (
                    <div
                      key={product._id || product.name}
                      className={styles.categorySectionDisplayDivs}
                      onClick={() => handleProductClick(product)}
                    >
                      {typeof product.discountedPrice === 'number' && product.discountedPrice > 0 && (
                        <div className={styles.discountBadge}>
                          <span>Ksh {product.discountedPrice.toFixed(1)}</span>
                        </div>
                      )}

                      <div className={styles.imageContainer}>
                        {imageLoadingStates[product._id] === 'loading' && (
                          <div className={styles.imageSkeleton}>
                            <div className={styles.skeletonShimmer}></div>
                          </div>
                        )}
                        <img
                          src={getImageSrc(product)}
                          alt={product.name}
                          loading="lazy"
                          className={`${styles.categorySectionImage} ${imageLoadingStates[product._id] === 'loaded' ? styles.isLoaded : ''
                            }`}
                          onLoadStart={() => handleImageStart(product._id)}
                          onLoad={() => handleImageLoad(product._id)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/path/to/placeholder-image.jpg';
                            handleImageError(product._id);
                          }}
                          style={{
                            opacity: imageLoadingStates[product._id] === 'loaded' ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out'
                          }}
                        />
                      </div>

                      <p className={`${styles.categorySectionName} ${styles.categorySectionP}`}>
                        {product.name}
                      </p>

                      <div className={styles.priceQuantityRow}>
                        {product.discountedPrice ? (
                          <span className={styles.originalPriceOffer}>
                            <span className={`${styles.diagonalStrikethrough} ${styles.linePrice}`}>
                              Ksh {product.price.toFixed(1)}
                            </span>
                          </span>
                        ) : (
                          <p className={styles.productPrice}>Ksh {product.price.toFixed(1)}</p>
                        )}

                        <p className={`${styles.categorySectionQuantity} ${styles.categorySectionP}`}>
                          <span>{product.quantity}</span> {product.unit}
                        </p>
                      </div>

                      <div className={`${styles.ratingsDiv} ${styles.starIcon}`}>
                        {product.ratings?.average
                          ? renderStars(product.ratings.average)
                          : 'No ratings yet'}
                      </div>

                      <div className={styles.addCartBtn}>
                        <button
                          className={styles.addToCartBtn}
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <FontAwesomeIcon icon={faCartShopping} />
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </section>

        <section className={styles.cartSecti}>
          <CartSection />
        </section>

        {selectedProduct && (
          <ProductDetailModal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            product={selectedProduct}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>

  );
};

export default MenuPage;