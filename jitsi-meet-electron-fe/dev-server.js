const path = require("path");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

// Create a custom webpack config by extending the dev config
const webpackConfig = require("./webpack.dev.js");

// Update entry to include our electron-mock.js
webpackConfig.entry = {
  electronMock: "./electron-mock.js", // Add our new mock
  app: "./app/index.js",
};

// Create a webpack compiler instance
const compiler = webpack(webpackConfig);

// Dev server options
const devServerOptions = {
  port: 3001,
  hot: true,
  historyApiFallback: true,
  static: {
    directory: path.join(__dirname, "build"),
  },
};

// Create the server
const server = new WebpackDevServer(devServerOptions, compiler);

// Start the server
server
  .start()
  .then(() => {
    console.log("Dev server is running at http://localhost:3001");
  })
  .catch((err) => {
    console.error("Failed to start dev server:", err);
  });
