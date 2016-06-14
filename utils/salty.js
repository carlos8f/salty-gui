var suppose = require('suppose')

module.exports = function container (get, set) {
  return function salty () {
    var args = [].slice.call(arguments)
    args.push('--wallet', get('conf.salty').wallet)
    return suppose(get('conf.salty').bin, args)
  }
}