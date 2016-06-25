var fs = require('fs')
  , validateUsername = require('../utils/validateUsername')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .post('/restore', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      if (res.vars.pubkey) return res.redirect('/login')
      if (!req.files['salty.pem']) {
        res.flash('Bad input', 'danger')
        return next()
      }
      try {
        validateUsername(req.body.username)
      }
      catch (e) {
        res.flash(e.message, 'danger')
        return next()
      }
      salty(req.body.username)('restore', req.files['salty.pem'].path)
        .when('Enter passphrase: ').respond(req.body.passphrase + '\n')
        .end(function (code) {
          try {
            fs.unlinkSync(req.files['salty.pem'].path)
          }
          catch (e) {}
          if (code) {
            res.flash('Restore error', 'danger')
            return next()
          }
          res.flash('Wallet restored!', 'success')
          res.redirect('/login')
        })
    })
    .add('/restore', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      if (res.vars.pubkey) return res.redirect('/login')
      res.render('restore', res.vars, {layout: 'layout-signin'})
    })
}