var crypto = require('crypto')
  , bs58 = require('bs58')

module.exports = function container (get, set) {
  return function usernameToUserId (username) {
    return bs58.encode(crypto.createHash('sha256').update(username).digest())
  }
}