module.exports = function container (get, set) {
  return get('controller')()
    .get('/import', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.render('import')
    })
}