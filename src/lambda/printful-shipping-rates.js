const get = require("lodash/fp/get");
const PrintfulClient = require("./util/printful").default;
const debug = require("./util/debug").default;

const headers = {
  "Access-Control-Allow-Origin": "*",
};

/**
 * Returns list of skus with product fields expanded.
 * Doc: https://www.printful.com/docs
 */
module.exports.handler = async (event) => {
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

  try {
    const data = JSON.parse(event.body);
    if (!get("recipient.country_code")(data)) {
      return {
        headers,
        statusCode: 400,
        body: JSON.stringify({
          error: "country_code required",
        }),
      };
    }

    debug(
      `get shipping rates for country ${get("recipient.country_code")(
        data
      )}: ${JSON.stringify(data)}`
    );

    let { code, ...result } = await printful.getShippingRates(data);

    return {
      headers,
      statusCode: code,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error(err);
    return {
      headers,
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
