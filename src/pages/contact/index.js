import React from "react";
import { navigate } from "gatsby-link";

import Layout from "../../components/Layout";
import Head from "../../components/Head";

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

const Contact = () => {
  const [inputs, setInputs] = React.useState({});

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": form.getAttribute("name"),
        ...inputs,
      }),
    })
      .then(() => navigate(form.getAttribute("action")))
      .catch((error) => alert(error));
  };

  const email = " hello@example.com";

  return (
    <Layout>
      <Head title="Contact us" />
      <div className="container lg:max-w-lg">
        <div className="flex content-center items-center justify-center h-64">
          <h1 className="text-white bg-primary leading-none p-6 shadow-xl text-5xl">
            Contact us
          </h1>
        </div>
        You can contact us by email on{" "}
        <a
          href={`mailto:${email}`}
          title={`email ${email}`}
          className="font-bold "
        >
          {email}
        </a>
        , or using the following form.
        <form
          name="contact"
          method="post"
          className="mt-10"
          action="/contact/thanks/"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          {/* The `form-name` hidden field is required to support form submissions without JavaScript */}
          <input type="hidden" name="form-name" value="contact" />
          <div hidden>
            <div className="mb-6">
              <label className="mb-2 block font-semibold" htmlFor="bot-field">
                Don’t fill this out:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-8"
                name="bot-field"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-semibold" htmlFor="name">
              Your name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-8"
              name="name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-semibold" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-8"
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block font-semibold" htmlFor="message">
              Message
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight h-12"
              name="message"
              onChange={handleChange}
              required
            />
          </div>
          <button
            className="w-full btn bg-primary-500 text-white hover:bg-primary-700"
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Contact;
