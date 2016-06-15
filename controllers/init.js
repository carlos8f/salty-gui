var crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
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
          var user = {
            id: '_',
            passphrase: req.body.passphrase
          }
          get('db.users').save(user, function (err) {
            if (err) return next(err)
            req.login(user)
            res.flash('Wallet created!', 'success')
            res.redirect('/id')
          })
        })
    })
    .add('/init', function (req, res, next) {
      res.render('init', res.vars, {layout: 'layout-signin'})
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}