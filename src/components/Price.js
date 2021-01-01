import React from "react";
import PropTypes from "prop-types";

function formatPrice({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
}) {
  const lang =
    (typeof navigator === "object" &&
      (navigator.language || navigator.userLanguage)) ||
    "en";

  if (value === undefined || value === null) {
    return null;
  }
  if (!currency) {
    return value;
  }
  const options = {
    style: "currency",
    currency,
  };
  if (value === Math.round(value)) {
    options.minimumFractionDigits = minimumFractionDigits || 0;
    options.maximumFractionDigits = maximumFractionDigits || 0;
  }

  try {
    return new Intl.NumberFormat(lang, options).format(value);
  } catch (err) {
    console.error(
      `Error formatting price with value ${value} and currency ${currency} for lang ${lang}`
    );
    return "NaN";
  }
}

function PriceFormatter({
  className,
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
}) {
  if (value === undefined || value === null) {
    return null;
  }
  const priceStr = formatPrice({
    value,
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return <span className={className}>{priceStr}</span>;
}

PriceFormatter.formatPrice = formatPrice;

PriceFormatter.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  currency: PropTypes.string,
  minimumFractionDigits: PropTypes.number,
  maximumFractionDigits: PropTypes.number,
};

PriceFormatter.defaultProps = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  className: null,
  value: null,
  currency: null,
};

export default PriceFormatter;
