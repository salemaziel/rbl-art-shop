const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const get = require("lodash/fp/get");

const debug = require("./util/debug").default;
const PrintfulClient = require("./util/printful").default;

const headers = {
  "Access-Control-Allow-Origin": "*",
};

/**
 * Returns list of skus with product fields expanded.
 */
module.exports.handler = async (event) => {
  const { cart, recipient, shipping, ...requestBody } = JSON.parse(event.body);

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

  const printful = new PrintfulClient({
    apiKey: process.env.PRINTFUL_API_KEY,
  });

  const { variants } = await printful.getProductAndVariants();

  debug(`Create Printful order for cart ${JSON.stringify(cart)}`);
  // Note: id in cart is external_id, and we need the sync_variant_id to create the order,
  // which is the id in printful vaiant.
  let orderRequest;
  try {
    orderRequest = {
      recipient,
      shipping,
      items: cart.map((cartItem) => {
        const variant = variants.find(
          (o) => o.id.toString() === cartItem.id.toString()
        );
        if (!variant) {
          throw new Error(`variant with id ${cartItem.id} not found`);
        }
        return {
          sync_variant_id: variant.id,
          quantity: cartItem.quantity,
          retail_price: variant.retail_price,
        };
      }),
    };
  } catch (err) {
    return {
      headers,
      statusCode: 400,
      body: JSON.stringify({ error: err.toString() }),
    };
  }

  // https://www.printful.com/docs/orders#actionCreate
  const { code: createOrderCode, result: order } = await printful.createOrder(
    orderRequest
  );
  if (createOrderCode !== 200) {
    console.error(`Order not created: code ${createOrderCode}`);
    return {
      headers,
      statusCode: createOrderCode,
      body: JSON.stringify({
        code: "error.during.stripe.session.creation",
        data: order,
      }),
    };
  }

  debug(`Order created: ${JSON.stringify(order)}`);

  try {
    requestBody.line_items = cart.map(({ id, quantity }) => {
      const variant = variants.find((o) => o.id.toString() === id.toString());

      const image = variant.files.find((o) => o.type === "preview");
      return {
        name: variant.name,
        amount: Math.round(variant.retail_price * 100),
        currency: variant.currency,
        images: image ? [image.thumbnail_url] : null,
        quantity,
      };
    });

    // add shipping cost
    requestBody.line_items.push({
      name: order.shipping_service_name,
      amount: Math.round(order.costs.shipping * 100),
      currency: order.costs.currency,
      quantity: 1,
    });

    requestBody.metadata = { orderId: order.id };

    debug(`Create Stripe session: ${JSON.stringify(requestBody)}`);

    const data = await stripe.checkout.sessions.create(requestBody);

    debug(`Stripe session created: ${JSON.stringify(data)}`);

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        code: "stripe.session.created",
        data: {
          id: get("id")(data),
          apiKey: process.env.STRIPE_PUBLISHABLE_KEY,
        },
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
