const ExtractTextPlugin = require('extract-text-webpack-plugin')

const getCssLoader = global => global ? 'css-loader' : {
  loader: 'css-loader',
  options: {
    modules: true,
    importLoaders: 1,
    localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
  },
}

const getCssRule = (env, global) => env === 'dev' ? [
  'style-loader',
  getCssLoader(global),
  'postcss-loader',
] : ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [
    getCssLoader(global),
    'postcss-loader',
  ],
})

module.exports = (env) => [
  {
    test: /\.worker\.js$/,
    use: 'worker-loader',
    exclude: /node_modules/,
  },
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
    use: getCssRule(env, false),
    exclude: /node_modules/,
  },
  {
    test: /global\.css$/,
    use: getCssRule(env, true),
    exclude: /node_modules/,
  },
]
