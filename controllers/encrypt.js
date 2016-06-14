module.exports = function container (get, set) {
  return get('controller')()
    .get('/encrypt', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.render('encrypt')
    })
}