const _ = require("lodash");
const path = require("path");
const slugify = require("slugify");
const { fmImagesToRelative } = require("gatsby-remark-relative-images");
const { createFilePath } = require("gatsby-source-filesystem");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              tags
              templateKey
            }
          }
        }
      }
      allPrintfulProduct(limit: 1000) {
        nodes {
          id
          name
          slug
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      Promise.reject(result.errors);
    }

    // CREATE PRODUCT PAGES
    const products = result.data.allPrintfulProduct.nodes;
    const productPage = path.resolve("src/templates/ProductPage.js");
    products.forEach((product) => {
      const id = product.id;
      createPage({
        path: "shop/" + product.slug,
        component: productPage,
        context: { id },
      });
    });

    // CREATE BLOG PAGES
    const posts = result.data.allMarkdownRemark.edges;

    posts.forEach((edge) => {
      const id = edge.node.id;
      if (!edge.node.frontmatter.templateKey) {
        return;
      }
      createPage({
        path: edge.node.fields.slug,
        tags: edge.node.frontmatter.tags,
        component: path.resolve(
          `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
        ),
        // additional data can be passed via context
        context: {
          id,
        },
      });
    });

    // Tag pages:
    let tags = [];
    // Iterate through each post, putting all found tags into `tags`
    posts.forEach((edge) => {
      if (_.get(edge, `node.frontmatter.tags`)) {
        tags = tags.concat(edge.node.frontmatter.tags);
      }
    });
    // Eliminate duplicate tags
    tags = _.uniq(tags);

    // Make tag pages
    const tagsPage = path.resolve(`src/templates/TagsPage.js`);
    tags.forEach((tag) => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: tagsPage,
        context: {
          tag,
        },
      });
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  fmImagesToRelative(node); // convert image paths for gatsby images
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: "slug",
      node,
      value,
    });
  } else if (node.internal.type === "PrintfulProduct") {
    createNodeField({
      node,
      name: "slug",
      value: slugify(node.name, { lower: true }),
    });
  }
};

exports.onCreateWebpackConfig = ({ actions, stage }) => {
  if (stage === "build-javascript") {
    // turn off source-maps
    actions.setWebpackConfig({
      devtool: false,
    });
  }
};
