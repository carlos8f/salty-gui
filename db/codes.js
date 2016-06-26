var crypto = require('crypto')
  , bs58 = require('bs58')

module.exports = function container (get, set) {
  return get('db.createCollection')('codes', {
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
      make: function (cb) {
        var code = {
          id: bs58.encode(crypto.randomBytes(32)),
          purpose: 'init'
        }
        code.url = '/redeem?code=' + code.id
        this.save(code, cb)
      },
      use: function (code, req, res, next) {
        var coll = this
        if (code.purpose !== 'init') return next(new Error('not an init code'))
        coll.destroy(code.id, function (err) {
          if (err) return next(err)
          req.session.can_init = true
          res.redirect('/init')
        })
      }
    }
  })
}