module.exports = function container (get, set) {
  return function handler (req, res, next) {
    res.vars.title = get('conf.site.title')
    res.vars.post = req.body
    res.vars.user = req.user
    res.vars.saltyVersion = get('conf.saltyVersion')
    next()
  }
}