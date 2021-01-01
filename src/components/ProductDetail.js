import React, { useContext } from "react";
import PropTypes from "prop-types";
import Img from "gatsby-image";
import get from "lodash/fp/get";
import truncate from "lodash/fp/truncate";

import { StoreContext } from "./StoreProvider";
import { CartContext } from "./CartProvider";
import Share from "./Share";
import Price from "./Price";
import Head from "./Head";

const ProductPage = ({ productId }) => {
  const { products } = useContext(StoreContext);
  const { addToCart, toggleCart } = useContext(CartContext);

  const product = products[productId];
  const [selectedVariant, setSelectedVariant] = React.useState(
    product.variants[0]
  );
  const selectedImage = get("variantImage.childImageSharp.fluid")(
    selectedVariant
  );

  return (
    <div className="container">
      <Head
        title={product.name}
        description={
          product.description
            ? truncate({
                length: 150,
              })(product.description)
            : null
        }
        image={selectedImage ? selectedImage.src : null}
      />
      <div className="flex flex-col sm:flex-row">
        <div className="sm:hidden px-4 py-2 m-2">
          <h1 className="text-4xl">{product.name}</h1>
          <h2>{product.caption}</h2>
        </div>
        <div className="flex-1 text-gray-700 text-center px-4 py-2 m-2 lg:max-w-lg">
          <>
            {selectedVariant && (
              <div className="p-2">
                <Img
                  fluid={{ ...selectedImage, aspectRatio: 1 }}
                  alt={product.name}
                  className="border border-gray-400 "
                  objectFit="cover"
                  objectPosition="50% 50%"
                />
              </div>
            )}

            <div className="flex">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="p-2 cursor-pointer"
                  onClick={() => setSelectedVariant(variant)}
                >
                  <Img
                    fluid={get("variantImage.childImageSharp.fluid")(variant)}
                    alt={variant.name}
                    className={`h-20 w-20 border ${
                      variant.id === selectedVariant.id
                        ? "shadow-md border-gray-500"
                        : "border-gray-400"
                    }`}
                    objectFit="cover"
                    objectPosition="50% 50%"
                  />
                </div>
              ))}
            </div>
          </>
        </div>
        <div className="flex flex-col flex-1 text-gray-700 text-left px-4 py-2 m-2">
          <h1 className="hidden sm:block text-4xl">{product.name}</h1>
          <div className="flex flex-col lg:max-w-xs">
            <h3 className="text-xl text-gray-500 ">Choose a variant</h3>
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 cursor-pointer flex border border-1 border-gray-500 text-lg mb-1 rounded-sm ${
                  variant.id === selectedVariant.id ? "bg-gray-200" : ""
                }`}
              >
                <div className="flex-1">{variant.name}</div>
                <Price
                  value={variant.retail_price}
                  currency={variant.currency}
                  minimumFractionDigits={2}
                  maximumFractionDigits={2}
                />
              </div>
            ))}
          </div>

          {selectedVariant && selectedVariant.id && (
            <button
              className="bg-primary text-white uppercase border border-primary-700 rounded-full py-3 my-5 lg:max-w-xs"
              onClick={() => {
                addToCart(selectedVariant.id);
                toggleCart(true);
              }}
            >
              Add To Cart
            </button>
          )}
          <div className="text-justify mt-5">{product.description}</div>
          <div className="flex flex-col mt-10">
            <span className="text-gray-500">Share your love.</span>
            {typeof window !== "undefined" && (
              <Share
                className="flex"
                title={product.name}
                image={selectedImage ? selectedImage.src : null}
                url={window.location.pathname}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductPage.propTypes = {
  productId: PropTypes.string.isRequired,
};

export default ProductPage;
