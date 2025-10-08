import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from './StoreMenuPage.module.css';
import config from '../../config';
import ProductDetailModal from './ProductDetailModal';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import CartSection from '../User/CartSection';
import { CartContext } from '../../contexts/CartContext';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import Logout from '../User/UserLogout';
import TopAdsBar from '../common/TopAdsBar';
import CategoryControlsBar from '../common/CategoryControlsBar';

const StoreMenuPage = () => {
    const { storeId } = useParams();
    const [resolvedPartnerId, setResolvedPartnerId] = useState(null);
    const navigate = useNavigate();
    const { currentProduct, setCurrentProduct, user, setRedirectPath } = useContext(AuthContext);
    const [productsByCategory, setProductsByCategory] = useState({});
    const { cart, addToCart } = useContext(CartContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
    }, [user]);


    useEffect(() => {
        const isHex24 = (val) => /^[a-fA-F0-9]{24}$/.test(val || '');

        const resolveStore = async () => {
            // Resolve slug to partner _id when necessary
            if (isHex24(storeId)) {
                setResolvedPartnerId(storeId);
                return storeId;
            }
            try {
                const res = await axios.get(`${config.backendUrl}/api/partners/slug/${encodeURIComponent(storeId)}`);
                const partner = res.data;
                setResolvedPartnerId(partner._id);
                return partner._id;
            } catch (_e) {
                setResolvedPartnerId(null);
                return null;
            }
        };

        const fetchProducts = async () => {
            try {
                setLoading(true); // Start loading
                const partnerId = await resolveStore();
                if (!partnerId) {
                    setProductsByCategory({});
                    return;
                }
                const response = await axios.get(`${config.backendUrl}/api/products-by-partner/${partnerId}`);

                const products = response.data.products || [];

                const groupedProducts = products.reduce((acc, product) => {
                    if (!acc[product.category]) {
                        acc[product.category] = [];
                    }
                    acc[product.category].push(product);
                    return acc;
                }, {});

                setProductsByCategory(groupedProducts);
            } catch (error) {
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchProducts();
        // re-run when storeId changes
    }, [storeId]);


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

        return '/path/to/placeholder-image.jpg'; 
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

    const hasAnyProducts = Object.values(productsByCategory || {}).some(arr => (arr || []).length > 0);

    return (
        <div className={styles.storeWrapper}>

            <TopAdsBar 
                onBack={() => navigate(-1)}
                showControls={true}
                searchQuery={''}
                onSearchChange={() => {}}
                sortBy={'relevance'}
                onSortChange={() => {}}
                priceMin={''}
                onPriceMinChange={() => {}}
                priceMax={''}
                onPriceMaxChange={() => {}}
                selectedVendor={''}
                onVendorChange={() => {}}
                vendorOptions={[]}
                ratingThreshold={'0'}
                onRatingChange={() => {}}
                showVendor={false}
                showRating={false}
            />
            
            <button className={styles.floatingCartIcon} onClick={() => setShowCart(true)}>
                <FontAwesomeIcon icon={faCartShopping} />
            </button>

            {/* <Logout /> */}

            <div className={styles.bodyWrapper}>
                  
                {loading ? (
                <div className={styles.skeletonContainer}>
                    <div className={styles.skeletonHeader} />
                    <div className={styles.skeletonGrid}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLineShort} />
                            </div>
                        ))}
                    </div>
                </div>
                ) : (
                    <>
                        <section className={styles.dispalySection}>

                            {showCart && (
                                <div className={styles.cartModal}>
                                <button className={styles.closeCartBtn} onClick={() => setShowCart(false)}>×</button>
                                <CartSection />
                                </div>
                            )}

                            {!hasAnyProducts && (
                                <div className={styles.emptyCatalogState} role="status" aria-live="polite">
                                    <div className={styles.emptyCatalogIconWrap}>
                                        <FontAwesomeIcon icon={faBoxOpen} className={styles.emptyCatalogIcon} />
                                    </div>
                                    <p className={styles.emptyCatalogTitle}>This store has no items yet</p>
                                    <p className={styles.emptyCatalogSubtext}>Please check back soon.</p>
                                </div>
                            )}

                            {Object.keys(productsByCategory).map((category) => (
                                <div key={category}>
                                    <h3 className={styles.categorySectiontitle}>{category}</h3>
                                    
                                    {productsByCategory[category].length === 0 ? (
                                        <div className={styles.emptyCategoryState}>
                                            <FontAwesomeIcon icon={faBoxOpen} className={styles.emptyCategoryIcon} />
                                            <p>No items in this category yet</p>
                                        </div>
                                    ) : (
                                        <section className={styles.categorySectionDisplay}>
                                        {productsByCategory[category].map((product, index) => (
                                            <div key={index} className={styles.categorySectionDisplayDivs}
                                                onClick={() => handleProductClick(product)}
                                                aria-label={`View ${product.name}`}
                                            >

                                                 {typeof product.discountedPrice === 'number' && product.discountedPrice > 0 && (
                                                                      <div className={styles.discountBadge}>
                                                                        <span>
                                                                          Ksh {product.discountedPrice.toFixed(1)}
                                                                        </span>
                                                                      </div>
                                                                    )}

                                                <img
                                                    src={getImageSrc(product)}
                                                    alt=""
                                                    className={styles.categorySectionImage}
                                                    onLoad={(e) => e.currentTarget.classList.add('isLoaded')}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/path/to/placeholder-image.jpg';
                                                        e.currentTarget.classList.add('isLoaded');
                                                    }}
                                                />

                                                <p className={`${styles.categorySectionName} ${styles.categorySectionP}`}>
                                                    {product.name}
                                                </p>


                                                <div className={styles.priceQuantityRow}>
                                                    {/* If there’s a discount, show original price with strikethrough */}
                                                    {product.discountedPrice ? (
                                                    <span className={styles.originalPriceOffer}>
                                                        {/* Was{' '} */}
                                                        <span className={`${styles.diagonalStrikethrough} ${styles.linePrice}`}>
                                                        Ksh {product.price.toFixed(1)}
                                                        </span>
                                                    </span>
                                                    ) : (
                                                    // If no discount, just show normal price
                                                    <p className={styles.productPrice}>Ksh {product.price.toFixed(1)}</p>
                                                    )}
                            
                                                    <p className={`${styles.categorySectionQuantity} ${styles.categorySectionP}`}>
                                                    <span>{product.quantity}</span>
                                                    {product.unit}
                                                    </p>
                                                </div>


                                                {/* <div className="ratingsDiv star-icon"> */}
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
                                    )}
                                </div>
                            ))}
                        </section>

                        {selectedProduct && (
                            <ProductDetailModal
                                isOpen={isModalOpen}
                                onRequestClose={closeModal}
                                product={selectedProduct}
                                onAddToCart={handleAddToCart}
                            />
                        )}
                    </>

                )}

                <section className={styles.cartSecti}>
                    <CartSection />
                </section>


            </div>
        </div>
    );
};

export default StoreMenuPage;

