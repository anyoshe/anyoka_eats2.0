// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHome } from '@fortawesome/free-solid-svg-icons';
// import MainSearchBar from './MainSearchBar';
// import CategoryDropdown from './CategoryDropdown';
// import RestaurantDropdown from './RestaurantDropdown';

// import './MenuPage.css';
// import DishCategories from './DishCategories';



// import { useCart } from './CartContext';
// import Cart from './Cart';

// const MenuPage = ({addToCart}) => {
//   const { state, dispatch } = useCart();

//   const handleCartClick = (e) => {
//     e.preventDefault();
//     dispatch({ type: 'TOGGLE_CART_VISIBILITY' });
// };

// return (
//     <div className="NavBarContainer">
//       {/* back and cart */}
//       <div id="navline">
//         <a href="/" className='homeLink'><FontAwesomeIcon icon={faHome}  className='homeIcon'/></a>
//         {<MainSearchBar addToCart={addToCart}  />}
//         <Cart />
//       </div>

//       <div className="menu-container">
//         <DishCategories />
//       </div>
//     </div>
//   );
// };

// export default MenuPage;

// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>STORE PAGE</title>
//     <link rel="stylesheet" href="storePage.css">
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
// </head>
// <body>
//     <section class="storeWrapper">
//         <!-- <div class="storeHeader">
//            <div>
//                 <h1 class="storeName">Store Name</h1>

//                 <p class="locationP">
//                     Lamu Road,Malindi 
//                 </p>

//                 <div class="storeRatingDiv">
//                     <i class="fas fa-star starIcon"></i>
//                     <i class="fas fa-star starIcon"></i>
//                     <i class="fas fa-star starIcon"></i>
//                     <i class="fas fa-star starIcon"></i>
//                     <i class="fas fa-star starIcon"></i>
//                 </div>
//            </div>

//              <div class="storeHeaderSearchDiv">
//                 <input class="storeHeaderSearchInput" type="text" placeholder="Search...">
//                 <i class="fas fa-search storeHeaderSearchIcon"></i>
//             </div> 
//         </div> -->

//         <div class="bodyWrapper">
//             <section class="dispalySection">

//                 <h3 class="categorySectiontitle">Most Bought</h3>
//                 <section class="categorySectionDisplay">
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\beautyStore.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\adExample.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\fashin_shop.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\healthILL.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\petILL.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>    
//                 </section>
            
//                 <h3 class="categorySectiontitle">Food</h3>
//                 <section class="categorySectionDisplay">
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\food_store_2.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
                          
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\food_shop.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
                          
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\foodILL_2.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>

//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\foodILL_1.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\food_store_2.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                 </section>
            
//                 <h3 class="categorySectiontitle">Health</h3>
//                 <section class="categorySectionDisplay">
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\healthILL.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\toys_store_2.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\health_store.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\healthILL.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\makeupILL.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                 </section>
            
//                 <h3 class="categorySectiontitle">Pet Supplies</h3>
//                 <section class="categorySectionDisplay">
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\petILL.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\pet_strore.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                        
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\foodILL_2.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <button class="addToCartBtn">
//                             <i class="fa-solid fa-cart-shopping"></i>
//                         </button>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\petILL.jpg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                     <div class="categorySectionDisplayDivs">
//                         <img src="images\healthILL.svg" alt="" class="categorySectionImage">
                        
//                         <p class="categorySectionName categorySectionP">Product Name</p>
                        
//                         <div class="priceQuantityRow">
//                             <p class="categorySectionPrice categorySectionP">KSH:100</p>
//                             <p class="categorySectionQuantity categorySectionP">500ml</p>
//                         </div>
                    
//                         <div class="addCartBtn">
//                             <button class="addToCartBtn">
//                                 <i class="fa-solid fa-cart-shopping"></i>
//                             </button>
//                         </div>
//                     </div>
                    
//                 </section>
            
//             </section>
            
//             <section class="cartSection">
//                 <div class="deliveryPointDiv">
//                     Delivering to Rongai
//                     <i class="fas fa-caret-down"></i>
//                 </div>

//                 <div class="cartWrapperDiv">
//                     <div class="cartListDiv">
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                         <div class="cartItem">
//                             <p class="cartItemName">Item Name</p>
//                             <p class="cartItemPrice">KSH 200</p>
//                         </div>
//                     </div>

//                     <div class="cartTotal">
//                         <p class="totalP">Total</p>
//                         <p class="totalfigure">KSH 1400</p>
//                     </div>
//                 </div>

//                 <div class="doneButtonDiv">
//                    Check Out
//                 </div>
//             </section>
//         </div>
//     </section>
// </body>
// </html>

import React, { useEffect, useState } from 'react';
import './MenuPage.css'; // Ensure the existing CSS file is imported
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCaretDown, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MenuPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products'); // Replace with your actual API endpoint
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Add product to cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <div className="storeWrapper">
      <div className="bodyWrapper">
        <section className="dispalySection">
          {/* Most Bought Section */}
          <h3 className="categorySectiontitle">Most Bought</h3>
          <section className="categorySectionDisplay">
            {products.map((product, index) => (
              <div key={index} className="categorySectionDisplayDivs">
                <img src={product.primaryImage || 'images/default.jpg'} alt={product.name} className="categorySectionImage" />
                <p className="categorySectionName categorySectionP">{product.name}</p>
                <div className="priceQuantityRow">
                  <p className="categorySectionPrice categorySectionP">KSH: {product.price}</p>
                  <p className="categorySectionQuantity categorySectionP">{product.unit}</p>
                </div>
                <div className="addCartBtn">
                  <button className="addToCartBtn" onClick={() => handleAddToCart(product)}>
                    <FontAwesomeIcon icon={faCartShopping} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Food Section */}
          <h3 className="categorySectiontitle">Food</h3>
          <section className="categorySectionDisplay">
            {products
              .filter((product) => product.category === 'Food')
              .map((product, index) => (
                <div key={index} className="categorySectionDisplayDivs">
                  <img src={product.primaryImage || 'images/default.jpg'} alt={product.name} className="categorySectionImage" />
                  <p className="categorySectionName categorySectionP">{product.name}</p>
                  <div className="priceQuantityRow">
                    <p className="categorySectionPrice categorySectionP">KSH: {product.price}</p>
                    <p className="categorySectionQuantity categorySectionP">{product.unit}</p>
                  </div>
                  <div className="addCartBtn">
                    <button className="addToCartBtn" onClick={() => handleAddToCart(product)}>
                      <FontAwesomeIcon icon={faCartShopping} />
                    </button>
                  </div>
                </div>
              ))}
          </section>

          {/* Health Section */}
          <h3 className="categorySectiontitle">Health</h3>
          <section className="categorySectionDisplay">
            {products
              .filter((product) => product.category === 'Health')
              .map((product, index) => (
                <div key={index} className="categorySectionDisplayDivs">
                  <img src={product.primaryImage || 'images/default.jpg'} alt={product.name} className="categorySectionImage" />
                  <p className="categorySectionName categorySectionP">{product.name}</p>
                  <div className="priceQuantityRow">
                    <p className="categorySectionPrice categorySectionP">KSH: {product.price}</p>
                    <p className="categorySectionQuantity categorySectionP">{product.unit}</p>
                  </div>
                  <div className="addCartBtn">
                    <button className="addToCartBtn" onClick={() => handleAddToCart(product)}>
                      <FontAwesomeIcon icon={faCartShopping} />
                    </button>
                  </div>
                </div>
              ))}
          </section>

          {/* Pet Supplies Section */}
          <h3 className="categorySectiontitle">Pet Supplies</h3>
          <section className="categorySectionDisplay">
            {products
              .filter((product) => product.category === 'Pet Supplies')
              .map((product, index) => (
                <div key={index} className="categorySectionDisplayDivs">
                  <img src={product.primaryImage || 'images/default.jpg'} alt={product.name} className="categorySectionImage" />
                  <p className="categorySectionName categorySectionP">{product.name}</p>
                  <div className="priceQuantityRow">
                    <p className="categorySectionPrice categorySectionP">KSH: {product.price}</p>
                    <p className="categorySectionQuantity categorySectionP">{product.unit}</p>
                  </div>
                  <div className="addCartBtn">
                    <button className="addToCartBtn" onClick={() => handleAddToCart(product)}>
                      <FontAwesomeIcon icon={faCartShopping} />
                    </button>
                  </div>
                </div>
              ))}
          </section>
        </section>

        {/* Cart Section */}
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
              <p className="totalfigure">KSH {cart.reduce((total, item) => total + item.price, 0)}</p>
            </div>
          </div>
          <div className="doneButtonDiv">Check Out</div>
        </section>
      </div>
    </div>
  );
};

export default MenuPage;