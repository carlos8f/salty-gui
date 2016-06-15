module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return function handler (req, res, next) {
    var chunks = []
    salty('id')
      .end(function (code) {
        if (code) return next()
        var stdout = Buffer.concat(chunks).toString('utf8')
        res.vars.pubkey = stdout.trim()
        next()
      })
      .stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
  }
}