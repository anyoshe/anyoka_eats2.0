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

  // Group items by vendor
  const groupedItems = state.items.reduce((acc, item) => {
    (acc[item.vendor] = acc[item.vendor] || []).push(item);
    return acc;
  }, {});

  const vendors = Object.keys(groupedItems).map(vendor => ({
    name: vendor,
    items: groupedItems[vendor],
    location: state.vendorLocation // Adjust to the appropriate vendor location if needed
  }));


  return (
    <>
      {/* Cart Modal */}
      <div className={`modal fade ${showCartModal ? 'show' : ''}`} id="cartModal" tabIndex="-1" aria-labelledby="cartModalLabel" aria-hidden="true" style={{ display: showCartModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="cartModalLabel">My Order</h5>
            </div>
            <div className="modal-body">
              {Object.keys(groupedItems).map(vendor => (
                <div key={vendor}>
                  <div className='restaurantNameDiv'>
                    <span className='restaurantName'>Vendor Name: </span>{vendor}
                  </div>
                  <ul id="cartItems">
                    {groupedItems[vendor].map((item, index) => (
                      <li key={index} className="d-flex justify-content-between align-items-center">
                        <span className='itemDishName'>
                          <span className='DishDetailSpan'>{item.foodName}</span>
                          <span className='DishDetailSpan'>Kes.{(item.price * item.quantity)}</span>
                        </span>
                        <div className="d-flex align-items-center">
                          <button className="btn btn-outline-secondary btn-sm me-2 minus-plus minus" onClick={() => handleDecreaseQuantity(item.foodCode)}>-</button>
                          <span className='menuDishQuantity'>{item.quantity}</span>
                          <button className="btn btn-outline-secondary btn-sm ms-2 minus-plus plus" onClick={() => handleIncreaseQuantity(item.foodCode)}>+</button>
                          <button className="btn btn-danger btn-sm ms-2 menuDelete" onClick={() => handleRemoveFromCart(item.foodCode)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <span className='itemTotal'>Total Price for {vendor}:</span> Ksh <span id="totalPrice">{groupedItems[vendor].reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
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
      <FoodLocationModal
        show={showLocationModal}
        handleClose={closeLocationModal}
        vendors={Object.values(groupedItems).flat()} // Pass all items in the cart as vendors
        orderedFoods={state.items}
      />

      {/* Cart Trigger */}
      <a href="#" id="cart2" onClick={handleCartClick}>
        <i className="fas fa-shopping-cart"></i><span id="cartCount2">{state.cartCount}</span>
      </a>
    </>
  );
};

export default FoodCart;
