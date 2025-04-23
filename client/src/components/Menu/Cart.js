// import React, { useState, useEffect } from 'react';
// import { useCart } from './CartContext';
// import LocationModal from './LocationModal';
// import './Cart.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min'; 

// const Cart = () => {
//   const { state, dispatch } = useCart();
//   const [showLocationModal, setShowLocationModal] = useState(false);
//   const [showCartModal, setShowCartModal] = useState(false);
//   const [restaurantLocation, setRestaurantLocation] = useState('');

//   // Get the selected restaurant location from the state
//   useEffect(() => {
//     if (state.restaurantLocation) {
//       setRestaurantLocation(state.restaurantLocation);
//     }
//   }, [state.restaurantLocation]);

//   const handleCartClick = () => {
//     setShowCartModal(true);
//   };

//   const handlePlaceOrder = () => {
//     setShowLocationModal(true);
//   };

//   const closeLocationModal = () => {
//     setShowLocationModal(false);
//   };

//   const closeCartModal = () => {
//     setShowCartModal(false);
//   };

//   const handleIncreaseQuantity = (dishCode) => {
//     dispatch({ type: 'INCREASE_QUANTITY', payload: { dishCode } });
//   };

//   const handleDecreaseQuantity = (dishCode) => {
//     dispatch({ type: 'DECREASE_QUANTITY', payload: { dishCode } });
//   };

//   const handleRemoveFromCart = (dishCode) => {
//     dispatch({ type: 'REMOVE_FROM_CART', payload: { dishCode } });
//   };

//   return (
//     <>
//       {/* Cart Modal */}
//       <div className={`modal fade ${showCartModal ? 'show' : ''}`} id="cartModal" tabIndex="-1" aria-labelledby="cartModalLabel" aria-hidden="true" style={{ display: showCartModal ? 'block' : 'none' }}>
//         <div className="modal-dialog modal-lg" id='itemsList'>
//           <div className="modal-content cartModalContent">
//             <div className="modal-header">
//               <h5 className="modal-title" id="cartModalLabel">My Order</h5>
//             </div>

//             <div className="modal-body" id='cart-modal-body'>
//               <div className='restaurantNameDiv'>
//                 <span className='restaurantName'>Restaurant Name:</span> {state.firstDishRestaurant}
//               </div>

//               <ul id="cartItems">
//                 {state.items.map((item, index) => (
//                   <li key={index} className="d-flex justify-content-between align-items-center" id='cart-list-items'>
//                     <span className='itemDishName'>
//                       <span className='DishDetailSpan detailDishName'>{item.dishName}</span> 
//                       <span className='DishDetailSpan'>Ksh.{(item.price * item.quantity)}</span>
//                     </span>

//                     <div className="d-flex align-items-center" id='cart-modal-controls'>
//                       <button className="btn-outline-secondary btn-sm me-2 minus-plus minus valueControllers" onClick={() => handleDecreaseQuantity(item.dishCode)}id='cart-modal-minus'>-</button>

//                       <span className='menuDishQuantity'>{item.quantity}</span>

//                       <button className="btn-outline-secondary btn-sm ms-2 minus-plus plus valueControllers" onClick={() => handleIncreaseQuantity(item.dishCode)} id='cart-modal-plus'>+</button>

//                       <button className="btn-danger btn-sm ms-2 menuDelete" onClick={() => handleRemoveFromCart(item.dishCode)} id='cart-modal-delete'>Delete</button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>

//               <div>
//                 <span className='itemTotal'>Total Price :</span> Ksh <span id="totalPrice">{state.totalPrice.toFixed(2)}</span>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button type="button" className="bottomBtn" onClick={handlePlaceOrder}>
//                 Continue
//               </button>
              
//               <button type="button" className="bottomBtn" data-bs-dismiss="modal" aria-label="Close" onClick={closeCartModal}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Location Modal */}
//       <LocationModal 
//         show={showLocationModal}
//         handleClose={closeLocationModal} 
//         restaurantName={state.firstDishRestaurant}
//         orderedDishes={state.items}
//         restaurantLocation={restaurantLocation}
//       />

//       {/* Cart Trigger */}
//       <a href="#" id="cart2" onClick={handleCartClick}>
//         <i className="fas fa-shopping-cart"></i><span id="cartCount" className='cartCountFood'>{state.cartCount}</span>
//       </a>
//     </>
//   );
// };

// export default Cart;
