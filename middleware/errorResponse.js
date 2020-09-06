class ErrorResponse extends Error {
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse

//* ErrorResponse extends the class Error

//* This class builds a constructor which passes two params -> message and statusCode

