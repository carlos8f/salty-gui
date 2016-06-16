var fs = require('fs')

module.exports = function container (get, set) {
  return get('controller')()
    .add('/download', function (req, res, next) {
      get('db.tokens').load(req.query.token, function (err, token) {
        if (err) return next(err)
        if (!token) return next(new Error('Invalid token'))
        get('db.tokens').use(token, req, res, next)
      })
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}