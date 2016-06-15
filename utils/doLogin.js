module.exports = function container (get, set) {
  return function doLogin (passphrase, req, res, next) {
    // save passphrase in memory. never stored.
    var user = {
      id: '_',
      passphrase: passphrase
    }
    get('db.users').save(user, function (err) {
      if (err) return next(err)
      req.login(user)
      res.redirect('/id')
    })
  }
}