var libSalty = require('salty')
  , request = require('micro-request')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .post('/import', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      var input = req.body.input
      if (input.indexOf('http') === 0) {
        request(input, function (err, resp, body) {
          if (err || resp.statusCode !== 200) {
            res.flash('Failed to fetch')
            return next()
          }
          if (Buffer.isBuffer(body)) body = body.toString('utf8')
          withInput(body)
        })
      }
      else withInput(input)
      function withInput (input) {
        try {
          var pubkey = libSalty.pubkey.parse(input)
        }
        catch (e) {
          res.flash('Invalid pubkey', 'danger')
          return next()
        }
        res.vars.pubkey = pubkey
        res.render('import-complete')
      }
    })
    .post('/import/complete', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      salty('import', req.body.pubkey)
        .when('Enter name: ').respond(req.body.name + '\n')
        .when('Enter email: ').respond(req.body.email + '\n')
        .end(function (code) {
          if (code) {
            res.flash('Import error', 'danger')
            return next()
          }
          res.redirect('/ls')
        })
    })
    .add('/import', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.on_import = true
      res.render('import')
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}