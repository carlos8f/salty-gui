module.exports = function container (get, set) {
  var usernameToUserId = get('utils.usernameToUserId')
  return get('db.createCollection')('users', {
    methods: {
      login: function (username, passphrase, req, res, next) {
        // save passphrase in memory. never stored.
        var user = {
          id: ,
          passphrase: passphrase
        }
        this.save(user, function (err) {
          if (err) return next(err)
          req.login(user)
          res.redirect('/id')
        })
      }
    }
  })
}