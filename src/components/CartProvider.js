import React from "react";
import PropTypes from "prop-types";
import omit from "lodash/fp/omit";

import useLocalStorage from "./useLocalStorage";
import { StoreContext } from "./StoreProvider";

export const CartContext = React.createContext();

const CartProvider = ({ children }) => {
  const { variants } = React.useContext(StoreContext);
  const [isCartVisible, setCartVisibility] = React.useState(false);
  const [cartSummary, setCartSummary, resetCart] = useLocalStorage("cart", {});
  const [
    shippingAddress,
    setshippingAddress,
    resetShippingAddress,
  ] = useLocalStorage("shippingAddress", {});

  React.useEffect(() => setCartSummary(cartSummary), cartSummary);

  const cart =
    cartSummary &&
    Object.entries(cartSummary).map(([id, { quantity }]) => ({
      ...variants[id],
      quantity,
    }));

  const currency = Object.values(variants)[0].currency;
  const totalItems = cart.reduce((sum, o) => sum + o.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, o) => sum + o.retail_price * o.quantity,
    0
  );

  const addToCart = (id, quantity = 1) => {
    setCartSummary((state) => ({
      ...state,
      [id]: { quantity: quantity + (state[id] ? state[id].quantity : 0) },
    }));
  };

  const removeFromCart = (id) => setCartSummary((state) => omit(id)(state));

  const toggleCart = () => setCartVisibility((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        resetCart,
        toggleCart,
        currency,
        totalItems,
        totalAmount,
        isCartVisible,
        shippingAddress,
        setshippingAddress,
        resetShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.any.isRequired,
};

export default CartProvider;
