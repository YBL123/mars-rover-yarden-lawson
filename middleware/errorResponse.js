class ErrorResponse extends Error {
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse

//* builds error messages and status codes
//* built an object which extends Error that passes 2 arguments -> message and statusCode