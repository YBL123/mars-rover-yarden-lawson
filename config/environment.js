const dbURI = 'mongodb://localhost/rovers-db' //* name of db
//* connects to mongo board. name after slash is the name given to the overall board database. This is the connection string.
const port = 8000
// const secret = 'shhhh its a secret' // * the secret we encode the token with

module.exports = {
  dbURI,
  port,
  // secret
}

//* exporting all the above