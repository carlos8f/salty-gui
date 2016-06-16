module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',

  // named collections
  'tokens': require('./tokens'),
  'users': require('./users'),

  'collections[]': [
    '#db.tokens',
    '#db.users'
  ]
}