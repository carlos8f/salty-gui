var libSalty = require('salty')
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return function handler (req, res, next) {
    if (!req.user) return next()
    function withPubkey () {
      res.vars.pubkeyFingerprint = crypto
        .createHash('sha1')
        .update(res.vars.pubkey.toBuffer())
        .digest('hex')
        .toUpperCase()
        .match(/.{1,4}/g)
        .slice(-4)
        .join(' ')
      next()
    }
    if (req.session.pubkey) {
      res.vars.pubkey = libSalty.pubkey.parse(req.session.pubkey)
      withPubkey()
    }
    else {
      var chunks = []
      salty(req.user.id)('id')
        .end(function (code) {
          if (code) return next()
          var stdout = Buffer.concat(chunks).toString('utf8')
          try {
            res.vars.pubkey = libSalty.pubkey.parse(stdout.trim())
            req.session.pubkey = res.vars.pubkey.pubkey
          }
          catch (e) {}
          withPubkey()
        })
        .stdout.on('data', function (chunk) {
          chunks.push(chunk)
        })
    }
  }
}