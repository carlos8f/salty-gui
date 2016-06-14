module.exports = function container (get, set) {
  return get('controller')()
    .get('/save', function (req, res, next) {
      res.render('save')
    })
}