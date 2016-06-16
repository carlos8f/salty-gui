module.exports = {
  // meta
  _ns: 'motley',

  'controllers[]': [
    require('./decrypt'),
    require('./download'),
    require('./encrypt'),
    require('./id'),
    require('./import'),
    require('./index'),
    require('./init'),
    require('./login'),
    require('./ls'),
    require('./restore'),
    require('./save'),
    require('./sign'),
    require('./verify')
  ]
}