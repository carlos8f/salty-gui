var fs = require('fs')
  , send = require('send')

module.exports = function container (get, set) {
  return get('db.createCollection')('tokens', {
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
      use: function (token, req, res, next) {
        var coll = this
        coll.destroy(token, function (err) {
          if (err) return next(err)
          var fileStream = send(req, token.path)
          res.once('error', function () {
            try {
              fs.unlinkSync(token.path)
            }
            catch (e) {}
          })
          res.once('finish', function () {
            try {
              fs.unlinkSync(token.path)
            }
            catch (e) {}
          })
          fileStream.pipe(res)
        })
      }
    }
  })
}