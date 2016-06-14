var fs = require('fs')
  , path = require('path')
  , crypto = require('crypto')
  , tmpDir = require('os').tmpDir()
  , assert = require('assert')

module.exports = function container (get, set) {
  var salty = get('utils.salty')
  return get('controller')()
    .post('/login', function (req, res, next) {
      var key = crypto.randomBytes(32)
      assert.equal(req.sessionID.length, 32)
      var challenge = crypto.createHmac('sha256', key).update(req.sessionID).digest()
      var shasum = crypto.createHash('sha256').update(challenge).digest()
      var tmpP = path.join(tmpDir, challenge.toString('hex'))
      fs.writeFileSync(tmpP, challenge)
      salty('sign', tmpP)
        .when('Wallet is encrypted.\nEnter passphrase: ').respond(req.body.passphrase + '\n')
        .end(function (code) {
          if (code) return next(new Error('Invalid login'))
          salty('verify', tmpP)
            .end(function (code) {
              if (code) return next(new Error('Invalid login'))
              var buf = fs.readFileSync(tmpP)
              assert.deepEqual(buf, challenge)
              fs.unlinkSync(tmpP)
              fs.unlinkSync(tmpP + '.salty-sig')
              // save passphrase in memory. never stored.
              var user = {
                id: challenge.toString('hex'),
                passphrase: req.body.passphrase
              }
              get('db.users').save(user, function (err) {
                if (err) return next(err)
                req.login(user)
                res.redirect('/')
              })
            })
        })
    })
    .get('/logout', function (req, res, next) {
      req.logout()
      res.redirect('/')
    })
    .get('/', function (req, res, next) {
      if (req.user) {
        res.render('dashboard')
      }
      else {
        res.render('login', res.vars, {layout: 'layout-signin'})
      }
    })
    .on('error', function (err, req, res) {
      res.json(500, {err: err.message})
    })
}