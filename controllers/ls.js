var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , tmpDir = require('os').tmpDir()
  , assert = require('assert')
  , libSalty = require('salty')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .get('/ls', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.on_ls = true
      var chunks = []
      salty('ls')
        .end(function (code) {
          if (code) return next(new Error('Wallet error'))
          var stdout = Buffer.concat(chunks).toString('utf8')
          var lines = stdout.split('\n').filter(function (line) {
            return !!line
          })
          res.vars.recipients = lines.map(libSalty.pubkey.parse)
          res.render('ls')
        })
        .stdout.on('data', function (chunk) {
          chunks.push(chunk)
        })
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}