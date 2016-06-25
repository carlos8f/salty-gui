var fs = require('fs')
  , path = require('path')

module.exports = function container (get, set) {
  return function handler (req, res, next) {
    var p = path.join(get('conf.salty').wallet, 'users')
    fs.readdir(p, function (err, entries) {
      if (err) return next()
      res.vars.isSetup = !!entries.length
      next()
    })
  }
}