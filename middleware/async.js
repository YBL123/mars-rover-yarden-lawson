const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler

//* middleware that will wrap around a function. The function is expected to receive a req, res and next parameters
//* The middleware is essentially a try catch -> with the promise.resolve()
//* If there is any error within the Promise.resolve() it will catch the error with Catch(next) and move it next
//* next meaning passing it on to the errorHandler which will catch and handle the error

//!equivalent to ===>>
// const test = (func, req, res, next) => {
//   try {
//     return func(req, res, next)
//   } catch (err) {
//     next()
//   }
// }