import React from "react";
import PropTypes from "prop-types";
import { FiCheckCircle } from "react-icons/fi";
import { CartContext } from "../../components/CartProvider";

import Layout from "../../components/Layout";
import Head from "../../components/Head";

const ResetCart = () => {
  const { resetCart } = React.useContext(CartContext);
  React.useEffect(resetCart);
  return null;
};

const ThanksPage = ({ location }) => {
  const [payment, setPayment] = React.useState({
    code: null,
    orderId: null,
    paymentId: null,
    loading: true,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const { error, code, result } = (await fetch(
        `/.netlify/functions/stripe-checkout-session-check${location.search}`
      )
        .then((response) => response.json())
        .catch((error) => console.error(error))) || {
        error: "oups, an unknown error occured",
      };
      if (error) {
        console.error(error);
      }
      setPayment({ code, loading: false, ...result });
    };
    fetchData();
  });

  if (payment.loading) {
    return (
      <Layout>
        <div className="mx-auto text-center w-full">loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head title="Thanks for your purchase">
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ResetCart />
      <div className="flex flex-col justify-center content-center items-center text-2xl pt-4">
        <FiCheckCircle color="green" size={80} />

        {payment.code === "order.confirmed" && (
          <>
            <h1>Thanks for your order!</h1>
            <p>We've sent you an email with the recap of your purchase.</p>
          </>
        )}

        {payment.code !== "order.confirmed" && (
          <>
            <h1>Your order has not been confirmed yet!</h1>
            <p>Your order is still processing. Wait.</p>
          </>
        )}

        {payment.orderId && <p>Your order ID: {payment.orderId}</p>}
        {payment.paymentId && <p>Your payment ID: {payment.paymentId}</p>}
      </div>
    </Layout>
  );
};

ThanksPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

export default ThanksPage;
