const {
  optimize: {
    CommonsChunkPlugin,
    AggressiveMergingPlugin,
  },
  DefinePlugin,
} = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = (env) => [
  new DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(env === 'dev' ? 'development' : 'production'),
    },
  }),

  // new CommonsChunkPlugin({
  //   name: 'vendor',
  //   minChunks: ({ context }) => context && context.includes('node_modules'),
  // }),

  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'src/template.html',
    minify: {
      minifyJS: true,
      minifyCSS: true,
      removeComments: true,
      collapseWhitespace: true,
    },
  }),

  new ExtractTextPlugin('styles.[contenthash].css'),

  env !== 'dev' && new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        ecma: 6,
        warnings: true,
        dead_code: true,
        properties: true,
        unused: true,
        join_vars: true,
        drop_console: true,
      },
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
      },
    },
  }),

  env !== 'dev' && new AggressiveMergingPlugin(),

  env === 'analyze' && new BundleAnalyzerPlugin({
    analyzerPort: 7777,
  }),
].filter((item) => item)
