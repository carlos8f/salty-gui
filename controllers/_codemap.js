module.exports = {
  // meta
  _ns: 'motley',

  'controllers[]': [
    require('./decrypt'),
    require('./encrypt'),
    require('./id'),
    require('./import'),
    require('./index'),
    require('./init'),
    require('./ls'),
    require('./restore'),
    require('./save'),
    require('./sign'),
    require('./verify')
  ]
}