module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .post('/id/edit', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
    })
    .add('/id/edit', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_id = true
      res.render('id-edit')
    })
    .get('/id', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_id = true
      res.render('id')
    })
}