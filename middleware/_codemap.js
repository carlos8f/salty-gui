module.exports = {
  // meta
  _ns: 'motley',
  // named middleware
  'middleware.flash': require('./flash'),
  'middleware.pubkey': require('./pubkey'),
  'middleware.vars': require('./vars'),
  'middleware[]': [
    '#middleware.flash',
    '#middleware.pubkey',
    '#middleware.vars'
  ]
}