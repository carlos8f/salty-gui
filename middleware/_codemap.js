module.exports = {
  // meta
  _ns: 'motley',
  // named middleware
  'middleware.flash': require('./flash'),
  'middleware.isSetup': require('./isSetup'),
  'middleware.pubkey': require('./pubkey'),
  'middleware.vars': require('./vars'),
  'middleware[]': [
    '#middleware.flash',
    '#middleware.isSetup',
    '#middleware.pubkey',
    '#middleware.vars'
  ]
}