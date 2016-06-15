var fs = require('fs')
  , path = require('path')
  , tmpDir = require('os').tmpDir()
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
    , doLogin = get('utils.doLogin')
  return get('controller')()
    .post('/restore', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      if (res.vars.pubkey) return res.redirect('/login')
      if (!req.body.input) {
        res.flash('Bad input', 'danger')
        return next()
      }
      var tmpP = path.join(tmpDir, crypto.randomBytes(32).toString('hex') + '.pem')
      fs.writeFileSync(tmpP, req.body.input)
      salty('restore', tmpP)
        .when('Enter passphrase: ').respond(req.body.passphrase + '\n')
        .end(function (code) {
          fs.unlinkSync(tmpP)
          if (code) {
            res.flash('Restore error', 'danger')
            return next()
          }
          res.flash('Wallet restored!', 'success')
          doLogin(req.body.passphrase, req, res, next)
        })
    })
    .add('/restore', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      if (res.vars.pubkey) return res.redirect('/login')
      res.render('restore', res.vars, {layout: 'layout-signin'})
    })
}