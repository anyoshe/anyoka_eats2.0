import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MenuPage.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import config from '../../config';
import ProductDetailModal from './ProductDetailModal';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add this import
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import CartSection from '../User/CartSection';
import { CartContext } from '../../contexts/CartContext';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import Logout from '../User/UserLogout';


const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get('category');
  const { currentProduct, setCurrentProduct, user, setRedirectPath } = useContext(AuthContext);
  const [productsByCategory, setProductsByCategory] = useState({});
  const { cart, addToCart } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    console.log('User in MenuPage:', user);
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.backendUrl}/api/all-products`);
        const products = response.data.products || [];
       console.log(products);
        const groupedProducts = products.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});

        setProductsByCategory(groupedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchProducts();
  }, []);


  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null); // Clear the current product
  };


  const handleAddToCart = (product) => {
    const priceToUse = product.discountedPrice ?? product.price;
    const productToAdd = {
      ...product,
      price: priceToUse,
      quantity: 1, // Initialize quantity to 1
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

  return (

    // <div className={styles.storeWrapper}>
    //   <Logout />
    //   <div className={styles.bodyWrapper}>
    //     <section className={styles.dispalySection}>

    //       <div className={styles.cartTopDiv}>
    //         <button className={styles.floatingCartIcon} onClick={() => setShowCart(true)}>
    //           <FontAwesomeIcon icon={faCartShopping} />
    //         </button>
    //       </div>

    //       {showCart && (
    //         <div className={styles.cartModal}>
    //           <button className={styles.closeCartBtn} onClick={() => setShowCart(false)}>×</button>
    //           <CartSection />
    //         </div>
    //       )}
          
    //       {selectedCategory && productsByCategory[selectedCategory] ? (
    //         <div>
    //           <h3 className={styles.categorySectiontitle}>{selectedCategory}</h3>
    //           <section className={styles.categorySectionDisplay}>
    //             {productsByCategory[selectedCategory].map((product, index) => (
    //               <div
    //                 key={index}
    //                 className={styles.categorySectionDisplayDivs}
    //                 onClick={() => handleProductClick(product)}
    //               >

    //                 {typeof product.discountedPrice === 'number' && product.discountedPrice > 0 && (
    //                   <div className={styles.discountBadge}>
    //                     <span>
    //                       Ksh {product.discountedPrice.toFixed(1)}
    //                     </span>
    //                   </div>
    //                 )}


    //                 <img
    //                   src={getImageSrc(product)}
    //                   alt={product.name}
    //                   className={styles.categorySectionImage}

    //                   onError={(e) => {
    //                     e.target.onerror = null;
    //                     e.target.src = '/path/to/placeholder-image.jpg';
    //                   }}
    //                 />

    //                 <p className={`${styles.categorySectionName} ${styles.categorySectionP}`}>
    //                   {product.name}
    //                 </p>

    //                 <div className={styles.priceQuantityRow}>
    //                   {/* If there’s a discount, show original price with strikethrough */}
    //                   {product.discountedPrice ? (
    //                     <span className={styles.originalPriceOffer}>
    //                       {/* Was{' '} */}
    //                       <span className={`${styles.diagonalStrikethrough} ${styles.linePrice}`}>
    //                         Ksh {product.price.toFixed(1)}
    //                       </span>
    //                     </span>
    //                   ) : (
    //                     // If no discount, just show normal price
    //                     <p className={styles.productPrice}>Ksh {product.price.toFixed(1)}</p>
    //                   )}

    //                   <p className={`${styles.categorySectionQuantity} ${styles.categorySectionP}`}>
    //                     <span>{product.quantity}</span>
    //                     {product.unit}
    //                   </p>
    //                 </div>

    //                 <div className={`${styles.ratingsDiv} ${styles.starIcon}`}>
    //                   {product.ratings?.average
    //                     ? renderStars(product.ratings.average)
    //                     : 'No ratings yet'}
    //                 </div>

    //                 <div className={styles.addCartBtn}>
    //                   <button
    //                     className={styles.addToCartBtn}

    //                     onClick={(e) => {
    //                       e.stopPropagation();
    //                       handleAddToCart(product);
    //                     }}
    //                   >
    //                     <FontAwesomeIcon icon={faCartShopping} />
    //                   </button>
    //                 </div>
    //               </div>
    //             ))}
    //           </section>
    //         </div>
    //         ) : (
    //           <p>No products found for selected category.</p>
    //         )}
          
    //     </section>

    //     <section className={styles.cartSecti}>
    //       <CartSection />
    //     </section>

    //     {/* Render the ProductDetailModal */}
    //     {selectedProduct && (
    //       <ProductDetailModal
    //         isOpen={isModalOpen}
    //         onRequestClose={closeModal}
    //         product={selectedProduct}
    //         onAddToCart={handleAddToCart}
    //       />
    //     )}
    //   </div>
    // </div>
    <div className={styles.storeWrapper}>
  <Logout />

  <div className={styles.bodyWrapper}>
    <section className={styles.dispalySection}>
      <div className={styles.cartTopDiv}>
        <button className={styles.floatingCartIcon} onClick={() => setShowCart(true)}>
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </div>

      {showCart && (
        <div className={styles.cartModal}>
          <button className={styles.closeCartBtn} onClick={() => setShowCart(false)}>×</button>
          <CartSection />
        </div>
      )}

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading selected category...</p>
        </div>
      ) : selectedCategory && productsByCategory[selectedCategory] ? (
        <div>
          <h3 className={styles.categorySectiontitle}>{selectedCategory}</h3>
          <section className={styles.categorySectionDisplay}>
            {productsByCategory[selectedCategory].map((product, index) => (
              <div
                key={index}
                className={styles.categorySectionDisplayDivs}
                onClick={() => handleProductClick(product)}
              >
                {typeof product.discountedPrice === 'number' && product.discountedPrice > 0 && (
                  <div className={styles.discountBadge}>
                    <span>Ksh {product.discountedPrice.toFixed(1)}</span>
                  </div>
                )}

                <img
                  src={getImageSrc(product)}
                  alt={product.name}
                  className={styles.categorySectionImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/path/to/placeholder-image.jpg';
                  }}
                />

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
        </div>
      ) : (
        <p>No products found for selected category.</p>
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