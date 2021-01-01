import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import keyBy from "lodash/fp/keyBy";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import map from "lodash/fp/map";
import filter from "lodash/fp/filter";
import round from "lodash/round";

export const StoreContext = React.createContext();

const StoreProvider = ({ data, children }) => {
  const products = flow(
    get("allPrintfulProduct.nodes"),
    map(({ variants, ...product }) => ({
      ...product,
      variants,
      currency: get("[0].currency")(variants),
      priceStartingAt: round(
        Math.min(...variants.map((variant) => variant.retail_price)),
        2
      ),
      image: get("productImage.childImageSharp")(product),
      images: variants.map((variant) =>
        get("variantImage.childImageSharp")(variant)
      ),
    })),
    filter((o) => !!o.variants.length),
    keyBy("id")
  )(data);

  const variants = flow(
    get("allPrintfulVariant.nodes"),
    map(({ product, ...variant }) => ({
      ...variant,
      product: product.product_id,
      retail_price: round(variant.retail_price, 2),
    })),
    keyBy("id")
  )(data);

  return (
    <StoreContext.Provider value={{ products, variants }}>
      {children}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  data: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
};

const productsQuery = graphql`
  query {
    allPrintfulProduct {
      nodes {
        id
        name
        slug
        thumbnail_url
        synced
        variants {
          id
          variant_id
          currency
          retail_price
          sku
          slug
          synced
          name
          variantImage {
            absolutePath
            url
            childImageSharp {
              fixed(width: 100, height: 100) {
                ...GatsbyImageSharpFixed
              }
              fluid(maxWidth: 300, quality: 92) {
                ...GatsbyImageSharpFluid_withWebp_tracedSVG
              }
            }
          }
        }
        productImage {
          absolutePath
          url
          childImageSharp {
            fixed(width: 100, height: 100) {
              ...GatsbyImageSharpFixed
            }
            fluid(maxWidth: 300, quality: 92) {
              ...GatsbyImageSharpFluid_withWebp_tracedSVG
            }
          }
        }
      }
    }
    allPrintfulVariant {
      nodes {
        id
        variant_id
        slug
        sku
        retail_price
        sync_product_id
        synced
        name
        currency
        files {
          preview_url
          thumbnail_url
          size
          status
          type
          width
          height
          id
        }
        product {
          product_id
          name
        }
        variantImage {
          id
          url
          size
          childImageSharp {
            fixed(width: 100, height: 100) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    }
  }
`;

const StoreProviderWithQuery = ({ children }) => (
  <StaticQuery
    query={productsQuery}
    render={(data) => <StoreProvider data={data}>{children}</StoreProvider>}
  />
);

StoreProviderWithQuery.propTypes = {
  children: PropTypes.any.isRequired,
};

export default StoreProviderWithQuery;
