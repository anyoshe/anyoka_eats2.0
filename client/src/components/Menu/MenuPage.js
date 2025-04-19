import React, { useEffect, useState } from 'react';
import styles from './MenuPage.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import config from '../../config';
import ProductDetailModal from './ProductDetailModal';
import { faTruck } from '@fortawesome/free-solid-svg-icons';

const MenuPage = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
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

  return (
    <div className={styles.storeWrapper}>
      <div className={styles.bodyWrapper}>
        <section className={styles.dispalySection}>
          {Object.keys(productsByCategory).map((category) => (
            <div key={category}>
              <h3 className={styles.categorySectiontitle}>{category}</h3>
              <section className={styles.categorySectionDisplay}>
                {productsByCategory[category].map((product, index) => (
                  <div
                    key={index}
                    className={styles.categorySectionDisplayDivs}
                    onClick={() => handleProductClick(product)}
                  >
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
                      <p className={`${styles.categorySectionPrice} ${styles.categorySectionP}`}>
                        KSH:{product.price}
                      </p>
                      <p className={`${styles.categorySectionQuantity} ${styles.categorySectionP}`}>
                        <span>{product.quantity}</span>
                        {product.unit}
                      </p>
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
          ))}
        </section>

        <section className={styles.cartSection}>
          <div className={styles.deliveryPointDiv}>
            <p className={styles.deliveringP}>
              <FontAwesomeIcon icon={faTruck} className={styles.deliveryTruck} />
              to 
              <span className={styles.locationChoice}>Rongai</span>
            </p>

            <FontAwesomeIcon icon={faCaretDown} className={styles.deliveringIcon} />
          </div>

          <div className={styles.cartWrapperDiv}>
            <div className={styles.cartListDiv}>
              {cart.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <p className={styles.cartItemName}>{item.name}</p>
                  <p className={styles.cartItemPrice}>KSH {item.price}</p>
                </div>
              ))}
            </div>
            <div className={styles.cartTotal}>
              <p className={styles.totalP}>Total</p>
              <p className={styles.totalfigure}>
                KSH {cart.reduce((total, item) => total + item.price, 0)}
              </p>
            </div>
          </div>
          
          <div className={styles.doneButtonDiv}>Check Out</div>
        </section>
      </div>
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default MenuPage;
