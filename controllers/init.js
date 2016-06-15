var crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
    , doLogin = get('utils.doLogin')
  return get('controller')()
    .add('/init', function (req, res, next) {
      if (res.vars.pubkey) return res.redirect('/login')
      next()
    })
    .post('/init', function (req, res, next) {
      var proc = salty('init')
        .when('Creating wallet...\nYour name: ').respond(req.body.name + '\n')
        .when('Your email address: ').respond(req.body.email + '\n')
        .when('Create a passphrase: ').respond(req.body.passphrase + '\n')
        .when('Verify passphrase: ').respond(req.body.passphrase2 + '\n')
        .end(function (code) {
          if (code) {
            res.flash('Error creating wallet.', 'danger')
            return next()
          }
          res.flash('Wallet created!', 'success')
          doLogin(req.body.passphrase, req, res, next)
        })
    })
    .add('/init', function (req, res, next) {
      res.render('init', res.vars, {layout: 'layout-signin'})
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}