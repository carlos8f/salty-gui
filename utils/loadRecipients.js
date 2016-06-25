var libSalty = require('salty')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return function loadRecipients (username, cb) {
    var chunks = []
    salty(username)('ls')
      .end(function (code) {
        if (code) return cb(new Error('Wallet error'))
        var stdout = Buffer.concat(chunks).toString('utf8')
        var lines = stdout.split('\n').filter(function (line) {
          return !!line
        })
        var recipients = lines.map(libSalty.pubkey.parse)
        cb(null, recipients)
      })
      .stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
  }
}