module.exports = function container (get, set) {
  return get('controller')()
    .get('/verify', function (req, res, next) {
      res.render('verify')
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}