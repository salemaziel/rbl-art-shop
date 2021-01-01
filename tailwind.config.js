module.exports = {
  purge: false, // purge is done by postcss
  theme: {
    extend: {
      colors: {
        // palette generated with https://javisperez.github.io/tailwindcolorshades/#/?Tolopea=2b0447&tv=1
        primary: {
          // default: "#8f9403",
          // "100": "#F4F4E6",
          // "200": "#E3E4C0",
          // "300": "#D2D49A",
          // "400": "#B1B44F",
          // "500": "#8F9403",
          // "600": "#818503",
          // "700": "#565902",
          // 800": "#404301",
          // "900": "#2B2C01",
          default: "#2b0447",
          "100": "#f5f5f5",
          "200": "#eeeeee",
          "300": "#e0e0e0",
          "400": "#bdbdbd",
          "500": "#9e9e9e",
          "600": "#757575",
          "700": "#616161",
          "800": "#424242",
          "900": "#2b0447",
        },
      },
      height: {
        "50vh": "50vh",
      },
      maxWidth: {
        "1/4": "25%",
        "1/3": "33%",
        "1/2": "50%",
        "3/4": "75%",
      },
    },
    fontFamily: {
      sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      serif: ["Georgia", "Cambria"],
      mono: ["SFMono-Regular", "Menlo"],
      display: ["Oswald"],
      body: ["Helvetica Neue", "Open Sans"],
    },
  },
  variants: {},
  plugins: [],
};
