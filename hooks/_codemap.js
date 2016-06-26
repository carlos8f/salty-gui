module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'hooks',

  // core hook registration
  'boot[]': function container (get, set) {
    var salty = get('utils.salty')
    return function task (cb) {
      var chunks = []
      salty('anonymous')('--version')
        .end(function (code) {
          if (code) return cb(new Error('Salty not installed'))
          var stdout = Buffer.concat(chunks).toString('utf8')
          set('@conf.saltyVersion', stdout.trim())
          get('console').log('running salty v' + get('conf.saltyVersion'))
          cb()
        })
        .stdout.on('data', function (chunk) {
          chunks.push(chunk)
        })
    }
  },
  'listen[]': function container (get, set) {
    return function task (cb) {
      get('console').log('listening on http://localhost:' + get('site.server').address().port + '/')
      setImmediate(cb)
    }
  },
  'close[1]': function container (get, set) {
    return function task (cb) {
      process.exit()
    }
  }
}