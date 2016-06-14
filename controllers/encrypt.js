module.exports = function container (get, set) {
  return get('controller')()
    .get('/encrypt', function (req, res, next) {
      res.render('encrypt')
    })
}