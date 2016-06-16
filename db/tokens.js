var fs = require('fs')
  , send = require('send')
  , crypto = require('crypto')
  , bs58 = require('bs58')

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
      make: function makeToken (p, cb) {
        if (p.indexOf('https') === 0) {
          return cb(null, {
            id: '_',
            path: null,
            headers: {},
            url: p
          })
        }
        var filename = crypto.randomBytes(4).toString('hex') + (p.match(/\.pem$/) ? '.pem' : '.salty')
        var token = {
          id: bs58.encode(crypto.randomBytes(32)),
          path: p,
          headers: {
            'Content-Type': p.match(/\.pem$/) ? 'text/plain' : 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="' + filename + '"'
          }
        }
        token.url = '/download?token=' + token.id
        this.save(token, cb)
      },
      use: function (token, req, res, next) {
        var coll = this
        coll.destroy(token.id, function (err) {
          if (err) return next(err)
          Object.keys(token.headers).forEach(function (k) {
            res.setHeader(k, token.headers[k])
          })
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