module.exports = function container (get, set) {
  return get('controller')()
    .get('/', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.redirect('/id')
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}