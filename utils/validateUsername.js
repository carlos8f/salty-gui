function validateUsername (username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Username required')
  }
  if (!username.match(/^[a-zA-Z0-9_]{3,30}$/)) {
    throw new Error('Invalid username')
  }
}
module.exports = validateUsername