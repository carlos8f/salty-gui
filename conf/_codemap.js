var walletDir = require('path').join(process.env.HOME, '.salty')

module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site overrides
  '@site.port': 3010,
  '@site.title': 'Salty',

  'salty': {
    wallet: walletDir,
    bin: 'salty'
  },

  // middleware overrides
  'middleware.session{}': {
    cookie: {
      maxAge: 0 // short term cookie
    },
    key: 'salty' // change this to customize the session cookie name
  },
  'middleware.templ{}': {
    watch: true // watch for template changes and auto-recompile
  },
  'middleware.buffet{}': {
    watch: true // watch for file changes and auto-clear cache
  }
}