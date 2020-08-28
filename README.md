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

# backend / server:

# insert image of all insomnia requests once completed for visual representaion 

### started off with back end:

### created mongo database in the cloud using mongod Atlas:
* using mongodb Atlas -> AWS -> ireland
* Created a config directory in app root
* created a config.env file inside the config director
* npm i dotenv
* npm i express
* npm i mongoose
* npm i nodemon 
* npm i body-parser
*   “scripts”: {
    “test”: “echo /\”/Error: no test specified/\”/ && exit 1”,
    “start”: “nodemon”
  }
* added “start”: “nodemon” -> so nodemon will always relaunch the backend (server) whenever it exits/collapses
* connect.js file in db directory:
* const mongoose = require(‘mongoose’)

const connectDB = /async/ () => {
  /try/ {
    /await/ mongoose.connect(
      process.env.DB_CONNECT,
      { useNewUrlParser: /true/, useUnifiedTopology: /true/, useCreateIndex: /true/  },)
    console.log(‘Mongo is Connected!’)
  } /catch/ (err) {
    console.log(err)
  }  
}

module.exports = connectDB

## created directories: 
* config -> config.env & routes.js
* controllers -> rovers.js
* db -> connect.js
* lib -> errorHandler.js & errorMessages.js
* middleware -> async.js & errorResponse.js
* models -> rover.js & rovermovement.js
* index.js
* frontend -> create reactapp

## config.env (---> mongo atlas cloud database, used url given by atlas db and set it to variable, also storing the port here)

* DB_CONNECT = mongodb+srv://ybl-rover:Mistyface123@cluster0.blzrd.mongodb.net/roverdb?retryWrites=true&w=majority

PORT = 8000


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









<!-- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify -->
