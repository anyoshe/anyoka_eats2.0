import React, { useState } from 'react';
import { useFreshFoodCart } from './FreshFoodCartContext';
import FoodLocationModal from './FoodLocationModal';
import './FoodCart.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; 

const FoodCart = () => {
  const { state, dispatch } = useFreshFoodCart();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  // Assuming vendor location is part of the state; extract it here.
  const selectedVendorLocation = state.vendorLocation;

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

  const handleIncreaseQuantity = (foodCode) => {
    dispatch({ type: 'INCREASE_QUANTITY', payload: { foodCode } });
  };

  const handleDecreaseQuantity = (foodCode) => {
    dispatch({ type: 'DECREASE_QUANTITY', payload: { foodCode } });
  };

  const handleRemoveFromCart = (foodCode) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { foodCode } });
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
              <span className='restaurantName'>Vendor Name: </span>{state.firstFoodVendor}</div>
              <ul id="cartItems">
                {state.items.map((item, index) => (
                  <li key={index} className="d-flex justify-content-between align-items-center">
                    <span className='itemDishName'> <span className='DishDetailSpan'>{item.foodName}</span>
                    <span className='DishDetailSpan'>Kes.{(item.price * item.quantity)}</span>
                    </span>
                    <div className="d-flex align-items-center">
                      <button className="btn btn-outline-secondary btn-sm me-2 minus-plus minus" onClick={() => handleDecreaseQuantity(item.foodCode)}>-</button>
                      <span  className='menuDishQuantity'>{item.quantity}</span>
                      <button className="btn btn-outline-secondary btn-sm ms-2 minus-plus plus" onClick={() => handleIncreaseQuantity(item.foodCode)}>+</button>
                      <button className="btn btn-danger btn-sm ms-2 menuDelete" onClick={() => handleRemoveFromCart(item.foodCode)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* <div>
              <span className='itemTotal'>Total Price :</span></span>id="totalPrice">{state.totalPrice.toFixed(2)}</span></div>
              {/* <div>Items in Cart: <span id="cartCount">{state.cartCount}</span></div> */}
            {/* </div> */}
            <div>
                <span className='itemTotal'>Total Price :</span> Ksh <span id="totalPrice">{state.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {/* <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" onClick={closeCartModal}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handlePlaceOrder}>
                Place Order
              </button> */}
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
      <FoodLocationModal 
        show={showLocationModal}
        handleClose={closeLocationModal} 
        vendorName={state.firstFoodVendor}
        orderedFoods={state.items}
        vendorLocation={selectedVendorLocation} // Passing the vendor location here
      />
     

      {/* Cart Trigger */}
      <a href="#" id="cart2" onClick={handleCartClick}>
        <i className="fas fa-shopping-cart"></i><span id="cartCount2">{state.cartCount}</span>
      </a>
    </>
  );
};

export default FoodCart;
