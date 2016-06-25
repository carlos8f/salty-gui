module.exports = function container (get, set) {
  var validateUsername = get('utils.validateUsername')
  return get('db.createCollection')('users', {
    save: function (obj, opts, cb) {
      try {
        validateUsername(obj.id)
      }
      catch (e) {
        return cb(null, e)
      }
      cb(null, obj)
    },
    methods: {
      login: function (username, passphrase, req, res, next) {
        // save passphrase in memory. never stored.
        var user = {
          id: username,
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