module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .add('/id/*', '/id/*/*', '/id/*/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      next()
    })
    .post('/id/refresh', function (req, res, next) {
      
    })
    .add('/id/refresh', function (req, res, next) {
      res.vars.on_id = true
      res.render('id-refresh')
    })
    .get('/id', function (req, res, next) {
      res.vars.on_id = true
      res.render('id')
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}