var crypto = require('crypto')
  , assert = require('assert')
  , zxcvbn = require('zxcvbn')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
    , validateUsername = get('utils.validateUsername')
  return get('controller')()
    .add('/init', '/init/*', '/init/*/*', function (req, res, next) {
      if (req.user) return res.redirect('/id')
      if (res.vars.isSetup && !req.session.can_init) return res.redirect('/login')
      next()
    })
    .post('/init', function (req, res, next) {
      try {
        validateUsername(req.body.username)
        assert.equal(req.body.passphrase, req.body.passphrase2, 'Passphrase confirm error')
        var result = zxcvbn(req.body.passphrase, [req.body.username])
        if (result.feedback.warning) {
          res.flash(result.feedback.warning, 'warning')
        }
        if (result.feedback.suggestions.length) {
          res.flash('Hint: ' + result.feedback.suggestions.join(' '), 'info')
        }
        switch (result.score) {
          case 0:
            res.flash('Error: Your passphrase is extremely guessable.', 'danger')
            return next()
            break;
          case 1:
            res.flash('Error: Your passphrase is guessable.', 'danger')
            return next()
            break;
          case 2:
            res.flash('Warning: Your passphrase is semi-guessable.', 'warning')
            break;
        }
      }
      catch (e) {
        res.flash(e.message, 'danger')
        return next()
      }
      var proc = salty(req.body.username)('init')
        .when('Creating wallet...\nYour name: ').respond('\n')
        .when('Your email address: ').respond('\n')
        .when('Create a passphrase: ').respond(req.body.passphrase + '\n')
        .when('Verify passphrase: ').respond(req.body.passphrase2 + '\n')
        .end(function (code) {
          if (code) {
            res.flash('Error creating wallet.', 'danger')
            return next()
          }
          res.flash('Wallet created!', 'success')
          get('db.users').login(req.body.username, req.body.passphrase, req, res, next)
        })
        .stderr.pipe(process.stderr)
    })
    .add('/init', function (req, res, next) {
      res.render('init', res.vars, {layout: 'layout-signin'})
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}