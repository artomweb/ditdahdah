const path = require("path");

module.exports = {
  entry: "./src/index.js", // Entry point
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production", // Enables optimizations like tree-shaking
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Optional, for ES6+ support
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"), // Serve files from the 'dist' directory
    },
    compress: false, // Enable gzip compression for better performance
    port: 9000, // Choose a port
    open: true, // Automatically open the browser
  },
};
