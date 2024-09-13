import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import LocationModal from './LocationModal';
import './Cart.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; 

const Cart = () => {
  const { state, dispatch } = useCart();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [restaurantLocation, setRestaurantLocation] = useState('');

  // Get the selected restaurant location from the state
  useEffect(() => {
    if (state.restaurantLocation) {
      setRestaurantLocation(state.restaurantLocation);
    }
  }, [state.restaurantLocation]);

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  const handlePlaceOrder = () => {
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
  };

  const closeCartModal = () => {
    setShowCartModal(false);
  };

  const handleIncreaseQuantity = (dishCode) => {
    dispatch({ type: 'INCREASE_QUANTITY', payload: { dishCode } });
  };

  const handleDecreaseQuantity = (dishCode) => {
    dispatch({ type: 'DECREASE_QUANTITY', payload: { dishCode } });
  };

  const handleRemoveFromCart = (dishCode) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { dishCode } });
  };

  return (
    <>
      {/* Cart Modal */}
      <div className={`modal fade ${showCartModal ? 'show' : ''}`} id="cartModal" tabIndex="-1" aria-labelledby="cartModalLabel" aria-hidden="true" style={{ display: showCartModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="cartModalLabel">My Order</h5>
              {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeCartModal}></button> */}
            </div>

            <div className="modal-body">
              <div className='restaurantNameDiv'>
                <span className='restaurantName'>Restaurant Name:</span> {state.firstDishRestaurant}
              </div>

              <ul id="cartItems">
                {state.items.map((item, index) => (
                  <li key={index} className="d-flex justify-content-between align-items-center">
                    <span className='itemDishName'>
                      <span className='DishDetailSpan'>{item.dishName}</span> 
                      <span className='DishDetailSpan'>Ksh.{(item.price * item.quantity)}</span>
                    </span>

                    <div className="d-flex align-items-center">
                      <button className="btn-outline-secondary btn-sm me-2 minus-plus minus" onClick={() => handleDecreaseQuantity(item.dishCode)}>-</button>
                      <span className='menuDishQuantity'>{item.quantity}</span>
                      <button className="btn-outline-secondary btn-sm ms-2 minus-plus plus" onClick={() => handleIncreaseQuantity(item.dishCode)}>+</button>
                      <button className="btn-danger btn-sm ms-2 menuDelete" onClick={() => handleRemoveFromCart(item.dishCode)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>

              <div>
                <span className='itemTotal'>Total Price :</span> Ksh <span id="totalPrice">{state.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="bottomBtn" onClick={handlePlaceOrder}>
                Continue
              </button>
              
              <button type="button" className="bottomBtn" data-bs-dismiss="modal" aria-label="Close" onClick={closeCartModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal 
        show={showLocationModal}
        handleClose={closeLocationModal} 
        restaurantName={state.firstDishRestaurant}
        orderedDishes={state.items}
        restaurantLocation={restaurantLocation} // Pass the restaurant location here
      />

      {/* Cart Trigger */}
      <a href="#" id="cart2" onClick={handleCartClick}>
        <i className="fas fa-shopping-cart"></i><span id="cartCount">{state.cartCount}</span>
      </a>
    </>
  );
};

export default Cart;
