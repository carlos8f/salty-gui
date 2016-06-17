var fs = require('fs')
  , path = require('path')
  , tmpDir = require('os').tmpDir()
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var loadRecipients = get('utils.loadRecipients')
    , salty = get('utils.salty')
  return get('controller')()
    .add('/decrypt/*', '/decrypt/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_decrypt = true
      next()
    })
    .post('/decrypt/upload', function (req, res, next) {
      if (!req.files.file) {
        res.flash('File upload error', 'danger')
        return next()
      }
      var args = ['decrypt']
      var outFile
      if (req.files.file.name.match(/\.pem$/)) {
        args.push('-a')
        req.body.armor = true
      }
      args.push(req.files.file.path)
      if (!req.body.armor) {
        outFile = req.files.file.path + '.out'
        args.push(outFile)
      }
      var proc = salty.apply(null, args)
        .when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
        .end(function (code) {
          fs.unlinkSync(req.files.file.path)
          var stdout = Buffer.concat(chunks)
          if (code) {
            return next(new Error('Decryption error'))
          }
          function withOutfile (outFile) {
            get('db.tokens').make(outFile, req.files.file.name.replace(/\.(pem|salty)$/, ''), function (err, token) {
              if (err) return next(err)
              res.json(token)
            })
          }
          if (!outFile) {
            // write to file
            outFile = req.files.file.path + '.out'
            fs.writeFile(outFile, stdout, {mode: parseInt('0600', 8)}, function (err) {
              if (err) return next(err)
              withOutfile(outFile)
            })
          }
          else withOutfile(outFile)
        })
      var stderr = ''
      var chunks = []
      proc.stderr.on('data', function (chunk) {
        stderr += chunk
      })
      proc.stdout.on('data', function (chunk) {
        chunks.push(chunk)
      })
    })
    .get('/decrypt/upload', function (req, res, next) {
      res.render('decrypt-upload')
    })
    .post('/decrypt/local', function (req, res, next) {
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
      var e = salty.apply(null, args)
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
    .get('/decrypt/local', function (req, res, next) {
      res.render('decrypt-local')
    })
    .post('/decrypt/text', function (req, res, next) {
      var args = ['decrypt']
      if (req.body.to) args.push('-t', req.body.to)
      if (req.body.sign) args.push('-s')
      args.push('-a')
      var inFile = path.join(tmpDir, crypto.randomBytes(32).toString())
      fs.writeFile(inFile, req.body.input, {mode: parseInt('0600', 8)}, function (err) {
        if (err) return next(err)
        args.push(inFile)
        var e = salty.apply(null, args)
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
    .get('/decrypt/text', function (req, res, next) {
      res.render('decrypt-text')
    })
    .get('/decrypt', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.redirect('/decrypt/upload')
    })
    .on('error', function (err, req, res) {
      res.send(500, err.message)
    })
}