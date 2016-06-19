var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , tmpDir = require('os').tmpDir()
  , assert = require('assert')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .add('/login', function (req, res, next) {
      if (!res.vars.pubkey) return res.redirect('/init')
      if (req.user) return res.redirect('/id')
      next()
    })
    .post('/login', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      var challenge = crypto.randomBytes(32)
      var tmpP = path.join(tmpDir, challenge.toString('hex'))
      fs.writeFileSync(tmpP, challenge)
      salty('sign', tmpP)
        .when('Wallet is encrypted.\nEnter passphrase: ').respond(req.body.passphrase + '\n')
        .end(function (code) {
          if (code) {
            res.flash('Login failed', 'danger')
            return next()
          }
          salty('verify', tmpP)
            .end(function (code) {
              if (code) {
                try {
                  fs.unlinkSync(tmpP)
                }
                catch (e) {}
                res.flash('Login failed', 'danger')
                return next()
              }
              var buf = fs.readFileSync(tmpP)
              try {
                fs.unlinkSync(tmpP)
                fs.unlinkSync(tmpP + '.salty-sig')
              }
              catch (e) {}
              assert.deepEqual(buf, challenge)
              get('db.users').login(req.body.username, req.body.passphrase, req, res, next)
            })
        })
    })
    .add('/login', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      res.render('login', res.vars, {layout: 'layout-signin'})
    })
    .get('/logout', function (req, res, next) {
      req.logout()
      res.redirect('/login')
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}