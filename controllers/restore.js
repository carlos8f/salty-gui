module.exports = function container (get, set) {
  return get('controller')()
    .get('/restore', function (req, res, next) {
      res.render('restore')
    })
}