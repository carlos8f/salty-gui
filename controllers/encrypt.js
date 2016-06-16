var fs = require('fs')
  

module.exports = function container (get, set) {
  var loadRecipients = get('utils.loadRecipients')
    , salty = get('utils.salty')
    , makeToken = get('utils.makeToken')
  return get('controller')()
    .add('/encrypt/*', '/encrypt/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      loadRecipients(function (err, recipients) {
        if (err) return next(err)
        res.vars.recipients = recipients
        next()
      })
    })
    .post('/encrypt/file/upload', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      if (!req.files.file) {
        res.flash('File upload error', 'danger')
        return next()
      }
      var args = ['encrypt']
      if (req.body.to) args.push('-t', req.body.to)
      if (req.body.sign) args.push('-s')
      if (req.body.armor) args.push('-a')
      if (req.body.gist) args.push('-g')
      var outFile = req.files.file.path + '.salty'
      args.push(req.files.file.path, outFile)
      var e = salty.apply(null, args)
      if (req.body.sign) {
        e.when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
      }
      var proc = e.end(function (code) {
        fs.unlinkSync(req.files.file.path)
        makeToken(outFile, function (err, token) {
          if (err) return next(err)
          res.json(token)
        })
        if (code) {
          return next(new Error('Encryption error'))
        }
        if (req.body.armor) {
          // write to file
        }
        console.error('stdout', stdout)
        console.error('stderr', stderr)
        res.json({stdout: stdout, stderr: stderr})
      })
      var stderr = '', stdout = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })
    })
    .get('/encrypt', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.redirect('/encrypt/file')
    })
    .get('/encrypt/file', function (req, res, next) {
      res.render('encrypt-file')
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}