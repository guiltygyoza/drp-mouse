const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    content: './src/content.ts',
    background: './background.js',
    popup: './popup/popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@ts-drp/node': path.resolve(__dirname, 'node_modules/@ts-drp/node/dist/src/index.js'),
      '@ts-drp/object': path.resolve(__dirname, 'node_modules/@ts-drp/object/dist/src/index.js'),
      'process/browser': require.resolve('process/browser.js')
    },
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "events": require.resolve("events/"),
      "assert": require.resolve("assert/"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "constants": require.resolve("constants-browserify"),
      "vm": require.resolve("vm-browserify"),
      "process": require.resolve("process/browser")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: require.resolve('process/browser')
    }),
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    })
  ]
};