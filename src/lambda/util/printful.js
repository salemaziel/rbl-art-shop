import fetch from "node-fetch";
import round from "lodash/round";

import debug from "./debug";

const base64Encode = (string) => Buffer.from(string).toString("base64");

class PrintfulClient {
  constructor({ apiKey }) {
    this.printfulApiKey = apiKey;
  }

  async request(method, { path, body }) {
    try {
      const response = await fetch(`https://api.printful.com${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${base64Encode(this.printfulApiKey)}`,
        },
        ...{ body: body ? JSON.stringify(body) : null },
      });
      return response.json();
    } catch (err) {
      return { statusCode: 500, result: err.toString() };
    }
  }

  get(path) {
    debug(`GET ${path}`);
    return this.request("GET", { path });
  }

  post(path, body) {
    debug(`POST ${path}: ${JSON.stringify(body)}`);
    return this.request("POST", { path, body });
  }

  /**
   * https://www.printful.com/docs/shipping#actionRates
   * return shipping rates
   * @param {*} data
   */
  async getShippingRates(data) {
    let { code, ...rest } = await this.post("/shipping/rates", data);

    return {
      code,
      ...rest,
      result: Array.isArray(rest.result)
        ? rest.result.map((o) => ({
            ...o,
            rate: parseFloat(o.rate),
          }))
        : rest.result,
    };
  }

  /**
   * Get product and Skus
   */
  async getProductAndVariants() {
    const { code, ...result } = await this.get("/sync/products?limit=100");
    const variants = [];

    const products = await Promise.all(
      result.result.map(async ({ id }) =>
        this.get(`/sync/products/${id}`).then(
          ({
            result: { sync_product: syncProduct, sync_variants: syncVariants },
          }) => ({
            ...syncProduct,
            variants: syncVariants.map((variant) => {
              const newVariant = {
                ...variant,
                retail_price: parseFloat(variant.retail_price),
              };
              variants.push(newVariant);
              return newVariant;
            }),
          })
        )
      )
    );

    return { code, products, variants };
  }

  /**
   * Create order in Printful
   * https://www.printful.com/docs/orders
   *
   * There are two general ways to specify a product’s variant when creating, updating or estimating an order:
   * (A) If you have an existing product variant in your Printful store or warehouse,
   *     then you can refer to it by specifying its sync_variant_id or external_variant_id,
   *     or warehouse_product_variant_id.
   * (B) If you don’t have an existing product variant in your Printful store, then you can construct a variant on-the-fly
   *      by using the unique variant_id from our Product Catalog API together with print files and an additional options.
   *
   * @param {*} data
   */
  async createOrder(data) {
    return this.post("/orders", data);
  }

  /**
   * Confirm order
   * https://www.printful.com/docs/orders#actionConfirm
   *
   * @param {*} id
   */
  async confirmOrder(id) {
    return this.post(`/orders/${id}/confirm`);
  }
}

export default PrintfulClient;
