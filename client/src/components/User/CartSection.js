import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faPlus,
  faMinus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import './CartSection.css';
import styles from '../Menu/MenuPage.module.css';
import { AuthContext } from '../../contexts/AuthContext';
import CheckoutModal from './CheckoutModal';
import { CartContext } from '../../contexts/CartContext';
import { faTruck } from '@fortawesome/free-solid-svg-icons';


const CartSection = () => {
    const { cart, setCart, addToCart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [showCheckout, setShowCheckout] = useState(false);

  const getLocationText = () => {
    if (!user) return 'Fetching delivery location...';

    const { town, location } = user;

    if (!location) return `Delivering to ${town || 'your area'}`;

    const normalizedLocation = location.toLowerCase();
    const normalizedTown = (town || '').toLowerCase();

    const containsTown = normalizedLocation.includes(normalizedTown);
    const finalLocation = containsTown ? location : `${location}, ${town}`;

    return `Delivering to ${finalLocation}`;
  };

  const handleIncrement = (index) => {
    const newCart = [...cart];
    newCart[index].quantity = (newCart[index].quantity || 1) + 1;
    setCart(newCart);
  };

  const handleDecrement = (index) => {
    const newCart = [...cart];
    if ((newCart[index].quantity || 1) > 1) {
      newCart[index].quantity -= 1;
      setCart(newCart);
    }
  };

  const handleRemove = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const quantity = item.quantity || 1;
      return total + item.price * quantity;
    }, 0);
  };
  const total = calculateTotal();
  return (
    <section className={styles.cartSection}>
          <div className={styles.deliveryPointDiv}>
          <p className={styles.deliveringP}>
              <FontAwesomeIcon icon={faTruck} className={styles.deliveryTruck} />
              to 
              <span className={styles.locationChoice}>{getLocationText()}</span>
              </p>
              <FontAwesomeIcon icon={faCaretDown} className={styles.deliveringIcon} />
      </div>

      <div className={styles.cartWrapperDiv}>
            <div className={styles.cartListDiv}>
              {cart.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <p className={styles.cartItemName}>{item.name}</p>
             
              <div className="cartQuantityControls">
                <button onClick={() => handleDecrement(index)} className="quantityBtn">
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span className="cartItemQty">{item.quantity || 1}</span>
                <button onClick={() => handleIncrement(index)} className="quantityBtn">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
                <button onClick={() => handleRemove(index)} className="quantityBtn removeBtn">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <p className={styles.cartItemPrice}>
                KSH {item.price * (item.quantity || 1)}
              </p>
            </div>
          ))}
        </div>

        <div className={styles.cartTotal}>
              <p className={styles.totalP}>Total</p>
              <p className={styles.totalfigure}>KSH {calculateTotal()}</p>
        </div>
      </div>

      <div className={styles.doneButtonDiv} onClick={() => setShowCheckout(true)}>
        Check Out
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        total={total}
      />
    </section>
  );
};

export default CartSection;
