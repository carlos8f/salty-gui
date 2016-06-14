module.exports = function container (get, set) {
  return get('controller')()
    .get('/init', function (req, res, next) {
      res.render('init')
    })
}