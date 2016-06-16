module.exports = function container (get, set) {
  return get('db.createCollection')('users', {
    load: function (obj, opts, cb) {
      // respond after the obj is loaded
      cb(null, obj);
    },
    save: function (obj, opts, cb) {
      // respond before the obj is saved
      cb(null, obj);
    },
    afterSave: function (obj, opts, cb) {
      // respond after the obj is saved
      cb(null, obj);
    },
    destroy: function (obj, opts, cb) {
      // respond after the obj is destroyed
      cb(null, obj)
    },
    methods: {
      login: function (passphrase, req, res, next) {
        // save passphrase in memory. never stored.
        var user = {
          id: '_',
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