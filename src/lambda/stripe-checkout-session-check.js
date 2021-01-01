const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PrintfulClient = require("./util/printful").default;

const headers = {
  "Access-Control-Allow-Origin": "*",
};

/**
 * Returns list of skus with product fields expanded.
 * Doc: https://www.printful.com/docs
 */
module.exports.handler = async (event) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY is not defined" }),
    };
  }
  if (!process.env.PRINTFUL_API_KEY) {
    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ error: "PRINTFUL_API_KEY is not defined" }),
    };
  }

  const sessionId = event.queryStringParameters.session_id;
  if (!sessionId) {
    return {
      headers,
      statusCode: 500,
      body: JSON.stringify({ error: "param session_id is required" }),
    };
  }

  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  if (
    !stripeSession ||
    !stripeSession.payment_intent ||
    stripeSession.payment_intent.status !== "succeeded"
  ) {
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({ code: "order.not.paid" }),
    };
  }

  const printful = new PrintfulClient({
    apiKey: process.env.PRINTFUL_API_KEY,
  });

  try {
    const orderId = stripeSession.metadata.orderId;

    // https://www.printful.com/docs/orders#actionCreate
    // IMPORTANT NOTE: During development, don't add billing method
    // so that orders can be confirmed, and will have a failed status
    const result = await printful.confirmOrder(orderId);

    return {
      headers,
      statusCode: result.code,
      body: JSON.stringify({
        code: result.code === 200 ? "order.confirmed" : "error.confiming.order",
        result: { orderId, paymentId: stripeSession.payment_intent.id },
      }),
    };
  } catch (err) {
    return {
      headers,
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
