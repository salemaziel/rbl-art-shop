import React from "react";
import { MdShoppingBasket } from "react-icons/md";
import { StaticQuery, graphql } from "gatsby";
import { loadStripe } from "@stripe/stripe-js";
import get from "lodash/fp/get";
import PropTypes from "prop-types";
import Img from "gatsby-image";
import { FaRegTrashAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import Price from "./Price";

import { CartContext } from "./CartProvider";

const CartItem = ({ sku, quantity }) => {
  const { removeFromCart } = React.useContext(CartContext);
  const image = get("variantImage.childImageSharp.fixed")(sku);

  return (
    <div key={sku.id} className="flex justify-between my-1">
      {image && (
        <Img
          fixed={image}
          alt={sku.name}
          className="flex-initial border border-gray-400 mr-2 p-2"
        />
      )}
      <div className="flex-auto flex-grow flex-col">
        <div className="flex content-between">
          <div className="font-bold whitespace-no-wrap">{sku.name}</div>
          <div className="flex-1 font-semibold text-right">
            <Price
              value={sku.retail_price * quantity}
              currency={sku.currency}
            />
          </div>
        </div>
        <div className="flex content-between">
          <div className="flex-auto">
            <Price value={sku.retail_price} currency={sku.currency} />$ &times;{" "}
            {quantity}
          </div>
        </div>
        <div className="flex-auto cursor-pointer text-gray-500 hover:text-gray-600">
          <FaRegTrashAlt size={20} onClick={() => removeFromCart(sku.id)} />
        </div>
      </div>
    </div>
  );
};
CartItem.propTypes = {
  sku: PropTypes.object.isRequired,
  quantity: PropTypes.number.isRequired,
};

const Cart = ({ countries }) => {
  const {
    cart,
    currency,
    totalItems,
    totalAmount,
    isCartVisible,
    toggleCart,
    shippingAddress,
    setshippingAddress,
  } = React.useContext(CartContext);
  const [shippingRates, setShippingRates] = React.useState([]);

  const { register, handleSubmit, errors, watch } = useForm({
    defaultValues: { ...shippingAddress, shipping: "STANDARD" },
  }); // initialise the hook
  const watchAllFields = watch();

  const selectedCountry = countries.find(
    (o) => o.code === watchAllFields.country_code
  );

  React.useEffect(() => {
    const fetchData = async () => {
      if (
        shippingAddress &&
        watchAllFields.country_code &&
        cart &&
        cart.length > 0
      ) {
        const { data } = await axios
          .post("/.netlify/functions/printful-shipping-rates", {
            items: cart.map((o) => ({
              variant_id: o.variant_id,
              quantity: o.quantity,
            })),
            recipient: watchAllFields,
          })
          .catch((error) => {
            console.error(error);
            return {};
          });
        setShippingRates(get("result")(data) || []);
      }
    };
    fetchData();
  }, [watchAllFields.country_code, watchAllFields.state_code]);

  const totalAmountWithShipping =
    totalAmount +
    (watchAllFields.shipping
      ? (
          shippingRates.find((o) => o.id === watchAllFields.shipping) || {
            rate: 0,
          }
        ).rate
      : 0);

  const onSubmit = async ({ shipping, ...input }) => {
    setshippingAddress(input);
    const data = {
      payment_method_types: ["card"],
      cart: cart.map((o) => ({ id: o.id, quantity: o.quantity })),
      recipient: input,
      shipping,
      success_url: `${window.location.origin}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}${window.location.pathname}?cancelled=true`,
    };

    try {
      const response = await axios
        .post("/.netlify/functions/stripe-checkout-session-create", data)
        .catch((error) => {
          console.error(error);
          return {};
        });

      const sessionId = get("data.data.id")(response);
      const apiKey = get("data.data.apiKey")(response);
      if (!apiKey || !sessionId) {
        console.error("Oups,an error occured", { sessionId, apiKey });
        return;
      }
      const stripe = await loadStripe(apiKey);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button
        onClick={toggleCart}
        className="relative inline-flex justify-center content-center items-center"
      >
        <span className="text-3xl lg:hidden">
          My Cart
          {totalItems > 0 && (
            <span className="rounded-full bg-primary px-3 mx-2 text-1xl text-white">
              {totalItems}
            </span>
          )}
        </span>
        <div className="hidden lg:block">
          <MdShoppingBasket size={38} />
          <div
            className="absolute text-white font-bold text-center m-0 bg-black text-base"
            style={{
              top: "18px",
              right: "6px",
              height: "10px",
              lineHeight: "10px",
              width: "24px",
            }}
          >
            {totalItems > 0 && totalItems}
          </div>
        </div>
      </button>

      {isCartVisible && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="main-modal fixed w-full h-100 inset-0 z-50 overflow-hidden flex justify-center items-center animated fadeIn faster">
            <div className="absolute w-full h-full opacity-75  bg-white z-0 right-0 top-0"></div>

            <div className="flex flex-col border border-teal-500 shadow-lg modal-container bg-white w-11/12 md:max-w-3xl mx-auto rounded shadow-lg z-50 overflow-y-auto">
              <div className="modal-content py-4 text-left px-6">
                <div className="flex justify-between items-center pb-3">
                  <p className="text-2xl font-bold uppercase">
                    Your shopping cart
                  </p>
                  <div
                    className="modal-close cursor-pointer z-50"
                    onClick={toggleCart}
                  >
                    <svg
                      className="fill-current text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                    >
                      <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="my-5 flex flex-row">
                    <div className="w-2/5 pr-10 border-r-2 border-gray-200">
                      {[
                        { name: "name", label: "Your full name" },
                        { name: "address1", label: "Your address" },
                        { name: "city", label: "City" },
                        { name: "zip", label: "Zip" },
                      ].map(({ name, label }) => (
                        <div className="mb-2" key={name}>
                          <label
                            className="mb-0 block text-gray-600 text-xs h-4"
                            htmlFor={name}
                          >
                            {watchAllFields[name] ? label : ""}
                          </label>
                          <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-10"
                            name={name}
                            ref={register({ required: true })}
                            placeholder={label}
                          />
                          {errors[name] && "Required."}
                        </div>
                      ))}

                      <div className="mb-4">
                        <label
                          className="mb-0 block text-gray-600 text-xs h-4"
                          htmlFor="country_code"
                        >
                          Country
                        </label>
                        <select
                          name="country_code"
                          ref={register({ required: true })}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-10"
                        >
                          <option value=""></option>
                          {countries.map((o) => (
                            <option key={o.code} value={o.code}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                        {errors.country_code && "Required."}
                      </div>
                      {selectedCountry && selectedCountry.states && (
                        <div className="mb-6">
                          <label
                            className="mb-0 block text-gray-600 text-xs h-4"
                            htmlFor="state_code"
                          >
                            State
                          </label>
                          <select
                            name="state_code"
                            ref={register({ required: true })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-10"
                          >
                            {selectedCountry &&
                              selectedCountry.states &&
                              selectedCountry.states.map((o) => (
                                <option key={o.code} value={o.code}>
                                  {o.name}
                                </option>
                              ))}
                          </select>
                          {errors.state_code && "Required."}
                        </div>
                      )}
                    </div>
                    <div className="w-3/5 pl-10">
                      {totalItems === 0 && <span>No items in your cart.</span>}
                      {cart.map((item) => (
                        <CartItem
                          key={item.id}
                          sku={item}
                          quantity={item.quantity}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex content-between mt-4 text-gray-500">
                  <div className=" text-right w-4/5">Subtotal</div>
                  <div className=" text-right w-1/5">
                    <Price value={totalAmount} currency={currency} />
                  </div>
                </div>

                {shippingRates && (
                  <div className="flex">
                    <div className="flex lg:w-1/3" />
                    <div className="flex flex-col flex-grow">
                      {shippingRates && shippingRates.length > 1 && (
                        <span className="text-gray-500">
                          Choose your shipping method
                        </span>
                      )}
                      {shippingRates.map((shippingRate) => (
                        <div
                          key={shippingRate.id}
                          className="flex content-between "
                        >
                          <div className="flex-1">
                            <input
                              className="mr-2"
                              type="radio"
                              name="shipping"
                              value={shippingRate.id}
                              ref={register({ required: true })}
                            />
                            {shippingRate.name}
                          </div>
                          <div className="flex text-right">
                            <Price
                              value={shippingRate.rate}
                              currency={shippingRate.currency}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex content-between mt-4">
                  <div className=" text-right font-semibold w-4/5">Total</div>
                  <div className=" text-right font-semibold w-1/5">
                    <Price
                      value={totalAmountWithShipping}
                      currency={currency}
                    />
                  </div>
                </div>
                <div
                  className={`flex pt-2 ${
                    totalAmount > 0 ? "justify-between" : "justify-end"
                  }`}
                >
                  <button
                    className="bg-transparent hover:bg-primary-300 text-primary font-semibold hover:text-white py-2 px-4 border border-primary hover:border-transparent rounded mr-2"
                    onClick={toggleCart}
                  >
                    Close
                  </button>
                  {totalAmount > 0 && (
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-400 text-white font-semibold py-2 px-4 border border-primary rounded"
                    >
                      {shippingRates && shippingRates.length
                        ? `Checkout`
                        : "Calculate shipping"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};
Cart.propTypes = {
  countries: PropTypes.any.isRequired,
};

const countriesQuery = graphql`
  query {
    allPrintfulCountry {
      edges {
        node {
          name
          id
          code
          states {
            code
            name
          }
        }
      }
    }
  }
`;

const CartWithQuery = (props) => (
  <StaticQuery
    query={countriesQuery}
    render={(data) => (
      <Cart
        {...props}
        countries={get("allPrintfulCountry.edges")(data).map((o) => o.node)}
      />
    )}
  />
);

export default CartWithQuery;
