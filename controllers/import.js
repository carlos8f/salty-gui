module.exports = function container (get, set) {
  return get('controller')()
    .get('/import', function (req, res, next) {
      res.render('import')
    })
}