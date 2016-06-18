var libSalty = require('salty')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return function handler (req, res, next) {
    var chunks = []
    salty('id')
      .end(function (code) {
        if (code) return next()
        var stdout = Buffer.concat(chunks).toString('utf8')
        try {
          res.vars.pubkey = libSalty.pubkey.parse(stdout.trim())
        }
        catch (e) {
          res.flash('Invalid pubkey', 'danger')
          req.logout()
          return res.redirect('/login')
        }
        next()
      })
      .stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
  }
}