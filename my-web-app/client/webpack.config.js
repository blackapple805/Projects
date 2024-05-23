const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',  // Entry point for your React application
  output: {
    path: path.resolve(__dirname, 'build'),  // Output directory for the bundled files
    filename: 'bundle.js'  // Output bundle file name
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,  // Regular expression to match JavaScript and JSX files
        exclude: /node_modules/,  // Exclude the node_modules directory
        use: {
          loader: 'babel-loader',  // Use babel-loader to transpile JavaScript and JSX files
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']  // Babel presets for ES6 and React
          }
        }
      },
      {
        test: /\.css$/,  // Regular expression to match CSS files
        use: ['style-loader', 'css-loader']  // Use style-loader and css-loader to handle CSS files
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // Path to your HTML template
      filename: 'index.html'  // Name of the output HTML file (optional)
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']  // Automatically resolve these extensions
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),  // Directory to serve static files from
    },
    compress: true,  // Enable gzip compression for everything served
    port: 9000,  // Port number for the webpack dev server
  },
};
