var fs = require('fs')
  , path = require('path')
  , tmpDir = require('os').tmpDir()
  , crypto = require('crypto')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .add('/decrypt/*', '/decrypt/*/*', '/decrypt/*/*/*', function (req, res, next) {
      if (!req.user) return res.redirect('/login')
      res.vars.on_encryption = true
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
      var proc = salty(req.user.id).apply(null, args)
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
    .add('/decrypt/upload', function (req, res, next) {
      res.render('decrypt-upload')
    })
    .post('/decrypt/text', function (req, res, next) {
      var args = ['decrypt']
      args.push('-a')
      var inFile = path.join(tmpDir, crypto.randomBytes(32).toString('hex'))
      fs.writeFile(inFile, req.body.input, {mode: parseInt('0600', 8)}, function (err) {
        if (err) return next(err)
        args.push(inFile)
        var proc = salty.apply(null, args)
          .when('Wallet is encrypted.\nEnter passphrase: ').respond(req.user.passphrase + '\n')
          .end(function (code) {
            fs.unlinkSync(inFile)
            if (code) {
              res.flash('Decryption error', 'danger')
              return next()
            }
            res.vars.output = stdout.trim()
            var headers = {}
            stderr.split('\n\n')[1].trim().split('\n').forEach(function (line) {
              var l = line.split(/:\s*/)
              if (l.length === 2) {
                headers[l[0]] = l[1]
              }
            })
            res.vars.headers = headers
            res.render('decrypt-text')
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
    .add('/decrypt/text', function (req, res, next) {
      res.render('decrypt-text')
    })
    .get('/decrypt', function (req, res, next) {
      res.redirect('/decrypt/text')
    })
    .on('error', function (err, req, res) {
      res.flash(err.message, 'danger')
      res.redirect('/')
    })
}