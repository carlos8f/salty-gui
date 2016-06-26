module.exports = function container (get, set) {
  return get('controller')()
    .add('/sign/upload', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.render('sign-upload')
    })
    .get('/sign', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.redirect('/sign/upload')
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}