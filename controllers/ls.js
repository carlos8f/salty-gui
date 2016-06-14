module.exports = function container (get, set) {
  return get('controller')()
    .get('/ls', function (req, res, next) {
      res.render('ls')
    })
}