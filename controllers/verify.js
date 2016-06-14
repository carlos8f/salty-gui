module.exports = function container (get, set) {
  return get('controller')()
    .get('/verify', function (req, res, next) {
      res.render('verify')
    })
}