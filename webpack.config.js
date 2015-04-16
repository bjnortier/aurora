module.exports = {
  entry: {
    'heightmap.test': './test/functional/src/heightmap.test.js',
    'gradients.test': './test/functional/src/gradients.test.js',
  },
  output: {
    path: 'test/functional/lib',
    filename: "[name].bundle.js"
  },
  devtool: "#inline-source-map"
};