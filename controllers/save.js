var path = require('path')
  , tmpDir = require('os').tmpDir()
  , fs = require('fs')
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .post('/save', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      if (req.body.passphrase !== req.body.passphrase2) {
        res.flash('Bad passphrase confirmation', 'danger')
        return next()
      }
      var tmpP = path.join(tmpDir, crypto.randomBytes(32).toString('hex') + '.pem')
      salty(req.user.id)('save', get('conf.salty').wallet, tmpP)
        .when('Create a passphrase: ').respond(req.body.passphrase + '\n')
        .when('Verify passphrase: ').respond(req.body.passphrase + '\n')
        .end(function (code) {
          if (code) {
            res.flash('Export error', 'danger')
            return next()
          }
          get('db.tokens').make(tmpP, 'salty.pem', function (err, token) {
            if (err) {
              res.flash('Token error', 'danger')
              return next()
            }
            res.redirect(token.url)
          })
        })
    })
    .add('/save', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_id = true
      res.render('save')
    })
}