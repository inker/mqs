const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = () => [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    options: {
      cacheDirectory: true,
    },
  },
  {
    test: path => path.endsWith('.css') && !path.endsWith('global.css'),
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
          },
        },
        'postcss-loader',
      ],
    }),
    exclude: /node_modules/,
  },
  {
    test: /global\.css$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: 'css-loader',
    }),
    exclude: /node_modules/,
  },
]
