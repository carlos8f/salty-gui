module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'db',

  // named collections
  'users': require('./users'),

  'collections[]': [
    '#db.users'
  ]
}