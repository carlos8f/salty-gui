module.exports = {
  // meta
  _ns: 'motley',
  // named middleware
  'middleware.vars': require('./vars'),
  'middleware[]': [
    '#middleware.vars'
  ]
}