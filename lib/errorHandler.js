const { notFound, unauthorized } = require('./errorMessages')
const ErrorResponce = require('../middleware/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err } //* spreading to copy err
  //* 'Validation Error' is an inbuilt mongoose error message that can be referred to and recognised by name
  error.message = err.message
  if (err.name === 'Validation Error') {

    const customErrors = {} 

    for (const key in err.errors) {
      //* assigning err.errors[key].message to the empty customErrors object
      customErrors[key] = err.errors[key].message
    }
    
    //* As the error keys of name = Validation Error are unknown at this point -> I will use the customErrors object to save the messages and return as a json
    res.status(423).json(customErrors)
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