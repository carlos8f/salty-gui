var path = require('path')
var walletDir = 

module.exports = {
  // meta
  _ns: 'motley',
  _folder: 'conf',

  // site overrides
  '@site.port': 3010,
  '@site.title': 'Salty',

  'salty': {
    wallet: path.join(process.env.HOME, '.salty'),
    bin: path.resolve(__dirname, '..', 'node_modules', '.bin', 'salty')
  },

  // middleware overrides
  'middleware.session{}': {
    cookie: {
      maxAge: null,
      expires: null // session cookie
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