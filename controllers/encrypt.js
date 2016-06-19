var fs = require('fs')
  , path = require('path')
  , tmpDir = require('os').tmpDir()
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var loadRecipients = get('utils.loadRecipients')
    , salty = get('utils.salty')
  return get('controller')()
    .add('/encrypt/*', '/encrypt/*/*', '/encrypt/*/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      loadRecipients(function (err, recipients) {
        if (err) return next(err)
        res.vars.recipients = recipients
        res.vars.on_encrypt = true
        res.vars.recipients.forEach(function (pubkey) {
          if (pubkey.pubkey === req.query.to || pubkey.pubkey === req.body.to) {
            pubkey.selected = true
          }
        })
        res.vars.to = req.query.to
        next()
      })
    })
    .post('/encrypt/upload', function (req, res, next) {
      if (!req.files.file) {
        res.flash('File upload error', 'danger')
        return next()
      }
      var args = ['encrypt']
      if (req.body.to) args.push('-t', req.body.to)
      if (req.body.sign) args.push('-s')
      if (req.body.armor) args.push('-a')
      if (req.body.gist) args.push('-g')
      var outFile
      args.push(req.files.file.path)
      if (!req.body.armor && !req.body.gist) {
        outFile = req.files.file.path + '.salty'
        args.push(outFile)
      }
      var e = salty(req.user).apply(null, args)
      if (req.body.sign) {
        e.when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
      }
      var proc = e.end(function (code) {
        fs.unlinkSync(req.files.file.path)
        if (code) {
          console.error('stderr', stderr)
          console.error('stdout', stdout)
          return next(new Error('Encryption error'))
        }
        function withOutfile (outFile) {
          get('db.tokens').make(outFile, function (err, token) {
            if (err) return next(err)
            res.json(token)
          })
        }
        if (!outFile) {
          if (req.body.gist) {
            withOutfile(stdout.trim())
          }
          else {
            // write to file
            outFile = req.files.file.path + '.pem'
            fs.writeFile(outFile, stdout, {mode: parseInt('0600', 8)}, function (err) {
              if (err) return next(err)
              withOutfile(outFile)
            })
          }
        }
        else withOutfile(outFile)
      })
      var stderr = '', stdout = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })
    })
    .add('/encrypt/upload', function (req, res, next) {
      res.render('encrypt-upload')
    })
    .post('/encrypt/local', function (req, res, next) {
      var args = ['encrypt']
      if (req.body.to) args.push('-t', req.body.to)
      if (req.body.sign) args.push('-s')
      if (req.body.armor) args.push('-a')
      if (req.body.gist) args.push('-g')
      var inFile = req.body.input
      var outFile
      args.push(inFile)
      if (!req.body.armor && !req.body.gist) {
        outFile = path.join(tmpDir, crypto.randomBytes(32).toString('hex'))
        args.push(outFile)
      }
      var e = salty(req.user).apply(null, args)
      if (req.body.sign) {
        e.when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
      }
      var proc = e.end(function (code) {
        if (code) {
          res.flash('Encryption error', 'danger')
          return res.redirect('/encrypt/local')
        }
        function withOutfile (outFile) {
          get('db.tokens').make(outFile, function (err, token) {
            if (err) return next(err)
            if (req.body.gist) {
              res.flash('Upload to gist: <a href="' + token.url + '" target="_blank">' + token.url + '</a>', 'success')
              res.render('encrypt-local')
            }
            else res.redirect(token.url)
          })
        }
        if (!outFile) {
          if (req.body.gist) {
            withOutfile(stdout.trim())
          }
          else {
            // write to file
            outFile = path.join(tmpDir, crypto.randomBytes(32).toString('hex')) + '.pem'
            fs.writeFile(outFile, stdout, {mode: parseInt('0600', 8)}, function (err) {
              if (err) return next(err)
              withOutfile(outFile)
            })
          }
        }
        else withOutfile(outFile)
      })
      var stderr = '', stdout = ''
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })
      proc.stdout.on('data', function (chunk) {
        stdout += chunk
      })
    })
    .add('/encrypt/local', function (req, res, next) {
      res.render('encrypt-local')
    })
    .post('/encrypt/text', function (req, res, next) {
      var args = ['encrypt']
      if (req.body.to) args.push('-t', req.body.to)
      if (req.body.sign) args.push('-s')
      args.push('-a')
      var inFile = path.join(tmpDir, crypto.randomBytes(32).toString('hex'))
      fs.writeFile(inFile, req.body.input, {mode: parseInt('0600', 8)}, function (err) {
        if (err) return next(err)
        args.push(inFile)
        var e = salty(req.user).apply(null, args)
        if (req.body.sign) {
          e.when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
        }
        var proc = e.end(function (code) {
          fs.unlinkSync(inFile)
          if (code) {
            return next(new Error('Encryption error'))
          }
          res.vars.output = stdout.trim()
          res.render('encrypt-text')
        })
        var stderr = '', stdout = ''
        proc.stderr.on('data', function (chunk) {
          stderr += chunk
        })
        proc.stdout.on('data', function (chunk) {
          stdout += chunk
        })
      })
    })
    .add('/encrypt/text', function (req, res, next) {
      res.render('encrypt-text')
    })
    .get('/encrypt', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.redirect('/encrypt/upload' + (req.query.to ? '?to=' + req.query.to : ''))
    })
    .on('error', function (err, req, res) {
      res.send(500, err.message)
    })
}