module.exports = function container (get, set) {
  var loadRecipients = get('utils.loadRecipients')
  return get('controller')()
    .get('/ls', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_ls = true
      loadRecipients(req.user.id, function (err, recipients) {
        if (err) return next(err)
        res.vars.recipients = recipients.length ? recipients : null
        res.render('ls')
      })
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}