const { notFound, unauthorized } = require('./errorMessages')
const ErrorResponce = require('../middleware/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err } //* spreading to copy err
  error.message = err.message
  if (err.name === 'Validation Error') {

    const customErrors = {} 

    for (const key in err.errors) {
      customErrors[key] = err.errors[key].message
    }
    
    error = new ErrorResponce(customErrors, 423)
  }

  if (err.message === notFound) {
    error = new ErrorResponce('Not Found', 404)
  }

  if (err.message === unauthorized) {
    error = new ErrorResponce('Unauthorized', 401)
  }
  
  //* if there's a status code display, if not display 500. Also error message = 'server error'
  res.status(error.statusCode || 500).json({ message: error.message || 'Server Error' })
  next()
}

module.exports = errorHandler