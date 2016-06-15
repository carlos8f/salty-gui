module.exports = {
  // meta
  _ns: 'motley',
  // named middleware
  'middleware.flash': require('./flash'),
  'middleware.vars': require('./vars'),
  'middleware[]': [
    '#middleware.flash',
    '#middleware.vars'
  ]
}