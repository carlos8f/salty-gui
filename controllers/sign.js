module.exports = function container (get, set) {
  return get('controller')()
    .get('/sign', function (req, res, next) {
      res.render('sign')
    })
}