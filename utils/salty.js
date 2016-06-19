var suppose = require('suppose')
  , path = require('path')

module.exports = function container (get, set) {
  return function salty (user) {
    return function () {
      var args = [].slice.call(arguments)
      args.push('--wallet', path.join(get('conf.salty').wallet, 'users', user.id))
      return suppose(get('conf.salty').bin, args)
    }
  }
}