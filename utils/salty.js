var suppose = require('suppose')
  , path = require('path')
  , validateUsername = require('./validateUsername')
  , mkdirp = require('mkdirp')

module.exports = function container (get, set) {
  return function salty (username) {
    validateUsername(username)
    return function () {
      var args = [].slice.call(arguments)
      var p = path.join(get('conf.salty').wallet, 'users', username)
      mkdirp.sync(p, {mode: parseInt('0700', 8)})
      args.push('--wallet', p)
      return suppose(get('conf.salty').bin, args)
    }
  }
}