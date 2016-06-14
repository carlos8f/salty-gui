module.exports = function container (get, set) {
  return get('controller')()
    .get('/id', function (req, res, next) {
      res.render('id')
    })
}