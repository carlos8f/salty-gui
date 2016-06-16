var crypto = require('crypto')
  , bs58 = require('bs58')

module.exports = function container (get, set) {
  return function makeToken (p, cb) {
    var token = {
      id: bs58.encode(crypto.randomBytes(32)),
      path: p
    }
    token.url = '/download?token=' + token.id
    get('db.tokens').save(token, cb)
  }
}