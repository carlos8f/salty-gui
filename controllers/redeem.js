module.exports = function container (get, set) {
  return get('controller')()
    .get('/redeem', function (req, res, next) {
      if (!req.query.code) return next(new Error('Code required'))
      get('db.codes').load(req.query.code, function (err, code) {
        if (err) return next(err)
        if (!code) {
          return next(new Error('Invalid/expired code'))
        }
        get('db.codes').use(code, req, res, next)
      })
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}