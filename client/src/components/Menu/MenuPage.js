import React, { useEffect, useState } from 'react';
import './MenuPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import config from '../../config';
import ProductDetailModal from './ProductDetailModal';

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

  // const getImageSrc = (product) => {
  //   if (product.primaryImage) {
  //     return product.primaryImage.startsWith('http')
  //       ? product.primaryImage
  //       : `${config.backendUrl}${product.primaryImage.replace('/var/data', '')}`;
  //   }

  //   if (product.images && product.images.length > 0) {
  //     return `${config.backendUrl}${product.images[0].replace('/var/data', '')}`;
  //   }

  //   return '/path/to/placeholder-image.jpg';
  // };

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
  
  

  return (
    <div className="storeWrapper">
      <div className="bodyWrapper">
        <section className="dispalySection">
          {Object.keys(productsByCategory).map((category) => (
            <div key={category}>
              <h3 className="categorySectiontitle">{category}</h3>
              <section className="categorySectionDisplay">
                {productsByCategory[category].map((product, index) => (
                  <div
                    key={index}
                    className="categorySectionDisplayDivs"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={getImageSrc(product)}
                      alt={product.name}
                      className="categorySectionImage"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/path/to/placeholder-image.jpg';
                      }}
                    />
                    <p className="categorySectionName categorySectionP">{product.name}</p>
                    <div className="priceQuantityRow">
                      <p className="categorySectionPrice categorySectionP">KSH:{product.price}</p>
                      <p className="categorySectionQuantity categorySectionP">
                        <span>{product.quantity}</span>
                        {product.unit}
                      </p>
                    </div>
                    <div className="addCartBtn">
                      <button
                        className="addToCartBtn"
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

        <section className="cartSection">
          <div className="deliveryPointDiv">
            Delivering to Rongai
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
          <div className="cartWrapperDiv">
            <div className="cartListDiv">
              {cart.map((item, index) => (
                <div key={index} className="cartItem">
                  <p className="cartItemName">{item.name}</p>
                  <p className="cartItemPrice">KSH {item.price}</p>
                </div>
              ))}
            </div>
            <div className="cartTotal">
              <p className="totalP">Total</p>
              <p className="totalfigure">
                KSH {cart.reduce((total, item) => total + item.price, 0)}
              </p>
            </div>
          </div>
          <div className="doneButtonDiv">Check Out</div>
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
