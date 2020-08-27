const { notFound, unauthorized } = require('./errorMessages')

function errorHandler(err, req, res) {
  const error = { ...err }
  error.message = err.message
  if (err.name === 'ValidationError') {

    const customErrors = {} 

    for (const key in err.errors) {
      customErrors[key] = err.errors[key].message
    }
    
    return res.status(422).json(customErrors)
  }

  if (err.message === notFound) {
    return res.status(404).json({ message: 'Not Found' })
  }

  if (err.message === unauthorized) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  return res.status(error.statusCode || 500).json({ message: error.message || 'server error' })
}

module.exports = errorHandler