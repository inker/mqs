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
    test: /\.css$/,
    use: [
      'style-loader',
      'css-loader',
    ],
  },
]
