<img align="left" width="50" height="50" src="NASA-logo.png" alt="NASA logo">

# Mars Rovers

## Overview
A squad of robotic rovers are to be landed by NASA on a plateau on Mars.

This plateau, which is curiously rectangular, must be navigated by the rovers so that their on board cameras can get a complete view of the surrounding terrain to send back to Earth.

A rover's position is represented by a combination of an x and y co-ordinates and a letter representing one of the four cardinal compass points.

The plateau is divided up into a grid to simplify navigation. An example position might be 0, 0, N, which means the rover is in the bottom left
corner and facing North.

In order to control a rover, NASA sends a simple string of letters. The possible letters are 'L', 'R' and 'M'. 'L' and 'R' makes the rover spin 90
degrees left or right respectively, without moving from its current spot.

'M' means move forward one grid point, and maintain the same heading.
Assume that the square directly North from (x, y) is (x, y+1).

## Deployment
The app is deployed on ...

## Built With
* React
* Node.js
* Express
* MongoDB
* Sass
* Axios
* Git
* Github

## Getting Started
To download the source code click the clone button. Run the following commands in the terminal:

To download the source code click the clone button. Run the following commands in the terminal:

* To install all packages listed in the package.json:
```terminal
npm i
```

* To run the app in your localhost:
* In both front and back:
```terminal
npm run start
```

# Backend:

### All backend requests:
![Insomnia all backend requests](mars-rovers-insomnia.png)

## created directories: 
* config -> config.env & routes.js
* controllers -> rovers.js
* db -> connect.js
* lib -> errorHandler.js & errorMessages.js
* middleware -> async.js & errorResponse.js
* models -> rover.js & rovermovement.js
* index.js
* frontend -> create reactapp

## config.env

### Created MongoDB Atlas Database -> stores Database in the Cloud:
![Atlas mongodb](cloud-mongodb-atlas.png)

Used URL given by Atlas and set it to variable, also storing the port here.

```javascript 
DB_CONNECT = mongodb+srv://ybl-rover:Password123@cluster0.blzrd.mongodb.net/roverdb?retryWrites=true&w=majority

PORT = 8000
```


## async.js
* const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler

//* middleware that will wrap around a function. The function is expected to receive a req, res and next parameters
//* The middleware is essentially a try catch -> with the promise.resolve()
//* If there is any error within the Promise.resolve() it will catch the error with Catch(next) and move it next
//* next meaning passing it on to the errorHandler which will catch and handle the error

## errorResponse.js
* class ErrorResponse extends Error {
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse

//* builds error messages and status codes
//* built an object which extends Error that passes 2 arguments -> message and statusCode

## index.js
* connectDB() //* calling connection here. Comes after dotenv as I am calling process.env within the connectDB function --->>> //* calling connection here. Comes after dotenv as I am calling process.env within the connectDB function
* const PORT = process.env.PORT || 8000 //* this is a fallback incase the process.env file doesn't work

const server = app.listen(PORT, () => console.log(`Express is listening on port ${PORT}`))

//* handle unhandled promise rejections: (node:44800) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated.
//* unhandled promise rejections cause the server to "hang" -> process.exit allows us to put an end to it
//* kills the server
process.on('unhandledRejection', (err, promise) => {
  console.log(`err: ${err.message}`)
  server.close(() => process.exit(1))
})

## rover.js (models diirectory)
* const mongoose = require('mongoose')

//* individual document
const roverSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  position: { type: String, required: true, enum: ['N', 'E', 'S', 'W'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('Rover', roverSchema)


## roverMovement.js (models directory)
* const mongoose = require('mongoose')

//* individual document
const roverMovementSchema = new mongoose.Schema({
  movement: { type: String, required: true, enum: ['r', 'R', 'l', 'L', 'm', 'M'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('RoverMovement', roverMovementSchema)

//* R + L = 90 degree spin in the same spot
//* M = movement


## createRover function in controllers 
* const roversCreate = asyncHandler(async(req, res, next) =>  {
  //* checking to see if req.body contains positions x & y & position or if it is undefined
  if (!req.body.x || req.body.x === undefined) {
    return next(new ErrorResponse('missing parameter x', 400))
  }
  if (!req.body.y || req.body.y === undefined) {
    //! res.status(400).json({ status: 'failed', error: 'missing position y' })
    return next(new ErrorResponse('missing parameter y', 400))
  }
  if (!req.body.position || req.body.position === undefined) {
    //! res.status(400).json({ status: 'failed', error: 'missing rover facing position' })
    return next(new ErrorResponse('missing rover facing position', 400))
  } 

  const newRover = {
    //* turning x and y into ints and turning position to upperCase
    x: parseInt(req.body.x),
    y: parseInt(req.body.y),
    position: req.body.position.toUpperCase() 
  }

  const createdRover = await Rover.create(newRover) 

  //* INVALID IF COORDINATES ARE OUTSIDE OF THE 5*5 GRID 
  if (req.body.x > 5 || req.body.x < 0) {
    return next(new ErrorResponse('Outside of grid parameters', 400))
  }
  if (req.body.y > 5 || req.body.y < 0) {
    return next(new ErrorResponse('Outside of grid parameters', 400))
  }

  res.status(201).json(createdRover)
  
})


## moveRover function in controllers 
* ENTER FUNCTION HERE AND DISCUSS
//* do these movements !include 'L, M, R,' -> ERROR 
//* IF YES THEN CONTINUE TO LOOP
//* for loop iterating over array.length to get movement
//* need immutable copy of rover that is found by id -> let roverInMovement = {x: rover.x, y: rover.y, position: rover.position}
//* at the end of the loop findByIdAndUpdate -> this will change the position of the rover
//* const movementOptions = {N: {L: 'E', R: 'W', M:'y+1'}, E:{L: 'S', R: 'N', M:'x-1'}, S:{L:'W', R:'E', M:'y-1'}, W:{L:'S', R:'N',  'x+1'}}
//* to imitate movement need to return array of positions -> each time I iterate over movement array -> pushed into position array. The rover needs to display:none from previous position and only appear in the new position

## routes.js (in config directory)
* // * manage incoming requests here 

const router = require('express').Router()
const rovers = require('../controllers/rovers')

router.route('/rovers') //* any route that comes in with that, if its a GET hand it off to index etc. Handing off to the correct one by verb.
  .get(rovers.index)
  .post(rovers.create)
  // .post(secureRoute, rovers.create)

router.route('/rovers/:id')
  .get(rovers.show)
  .delete(rovers.delete)

router.route('/rovers/movement')
  .post(rovers.movement)


module.exports = router //* export entire router


