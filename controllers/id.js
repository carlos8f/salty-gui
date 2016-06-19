module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .add('/id/*', '/id/*/*', '/id/*/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      next()
    })
    .post('/id/edit', function (req, res, next) {
      
    })
    .add('/id/edit', function (req, res, next) {
      res.vars.on_id = true
      res.render('id-edit')
    })
    .get('/id', function (req, res, next) {
      res.vars.on_id = true
      res.render('id')
    })
}