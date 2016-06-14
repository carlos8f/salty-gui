module.exports = function container (get, set) {
  return get('controller')()
    .get('/decrypt', function (req, res, next) {
      res.render('decrypt')
    })
}