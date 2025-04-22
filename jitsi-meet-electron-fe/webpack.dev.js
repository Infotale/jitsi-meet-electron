const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const ELECTRON_VERSION = require("./package.json").devDependencies.electron;

module.exports = {
  // Mode: development for local dev
  mode: "development",
  target: "web",

  // Entry point for your app
  entry: "./app/index.js",

  // Where to output the bundles
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },

  // Enable source-maps for debugging
  devtool: "eval-cheap-module-source-map",

  // Configure how modules are resolved
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [path.resolve("./node_modules")],
    alias: {
      "@atlaskit/avatar": path.resolve("./node_modules/@atlaskit/avatar"),
      "@atlaskit/blanket": path.resolve("./node_modules/@atlaskit/blanket"),
      "@atlaskit/button": path.resolve("./node_modules/@atlaskit/button"),
      "@atlaskit/css-reset": path.resolve("./node_modules/@atlaskit/css-reset"),
      "@atlaskit/droplist": path.resolve("./node_modules/@atlaskit/droplist"),
      "@atlaskit/field-text": path.resolve("./node_modules/@atlaskit/field-text"),
      "@atlaskit/icon": path.resolve("./node_modules/@atlaskit/icon"),
      "@atlaskit/navigation": path.resolve("./node_modules/@atlaskit/navigation"),
      "@atlaskit/onboarding": path.resolve("./node_modules/@atlaskit/onboarding"),
      "@atlaskit/page": path.resolve("./node_modules/@atlaskit/page"),
      "@atlaskit/spinner": path.resolve("./node_modules/@atlaskit/spinner"),
      "@atlaskit/theme": path.resolve("./node_modules/@atlaskit/theme"),
      "@atlaskit/toggle": path.resolve("./node_modules/@atlaskit/toggle"),
    },
    fallback: {
      buffer: require.resolve("buffer/"),
      process: require.resolve("process/browser"),
    },
  },

  // Loaders for different file types
  module: {
    noParse: /external_api\\.js/,
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: [
              [
                require.resolve("@babel/preset-env"),
                {
                  modules: false,
                  targets: {
                    electron: ELECTRON_VERSION,
                  },
                },
              ],
              require.resolve("@babel/preset-flow"),
              require.resolve("@babel/preset-react"),
            ],
            plugins: [
              require.resolve("@babel/plugin-transform-flow-strip-types"),
              require.resolve("@babel/plugin-proposal-class-properties"),
              require.resolve("@babel/plugin-proposal-export-namespace-from"),
            ],
          },
        },
      },
      {
        test: /\/node_modules\/@atlaskit\/.*\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            sourceType: "unambiguous",
            presets: [
              [
                require.resolve("@babel/preset-env"),
                {
                  modules: "commonjs",
                  targets: {
                    electron: ELECTRON_VERSION,
                  },
                },
              ],
              require.resolve("@babel/preset-react"),
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: "file-loader",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              dimensions: false,
              expandProps: "start",
            },
          },
        ],
      },
    ],
  },

  // Plugins
  plugins: [
    // Generates the index.html
    new HtmlWebpackPlugin({
      template: "./app/index.html",
      inject: "body",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.REACT_APP_API_URL": JSON.stringify("http://localhost:3001"),
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],

  // Optionally disable performance hints
  performance: {
    hints: false,
  },

  externals: [
    {
      "@jitsi/electron-sdk": "window.JitsiMeetElectronAPI",
    },
  ],

  stats: {
    warningsFilter: [
      // Ignore warnings about named exports
      /export '(version|packageName|packageVersion)'/,
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    port: 3001,
    historyApiFallback: true,
    hot: true,
    proxy: {
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        withCredentials: true,
      },
    },
  },
};
