var fs = require('fs')

module.exports = function container (get, set) {
  return get('controller')()
    .get('/download', '/download/*', function (req, res, next) {
      get('db.tokens').load(req.query.token, function (err, token) {
        if (err) return next(err)
        if (!token) {
          res.flash('Invalid token', 'danger')
          return res.redirect('/')
        }
        res.vars.token = token
        next()
      })
    })
    .get('/download/file', function (req, res, next) {
      get('db.tokens').use(res.vars.token, req, res, next)
    })
    .get('/download', function (req, res, next) {
      res.render('download', {layout: 'layout-signin'})
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}