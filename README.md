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

I began by building the backend first. I set up the routes, controllers, middleware, errorhandlers, models, database and tested the requests using Insomnia.

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

### Created MongoDB Atlas Database 
![Atlas mongodb](cloud-mongodb-atlas.png)
Stores database in the cloud.

Used URL given by Atlas and set it to variable, also storing the port here.

```javascript 
DB_CONNECT = mongodb+srv://<username>:<password>@cluster0.blzrd.mongodb.net/roverdb?retryWrites=true&w=majority

PORT = 8000
```

## async.js
```javascript
* const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
````

This is middleware that will wrap around a function. The function is expected to receive a req, res and next parameters.

The middleware is essentially a try catch (promise.resolve()).

If there is any error within the Promise.resolve() it will catch the error with Catch(next) and move it next.

Next() meaning passing it on to the errorHandler which will catch and handle the error.

## errorResponse.js
```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode){
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse
````

This class builds error messages and status codes. This is done by building an object which extends the Error class and passes two arguments; message and statusCode.

## index.js
```javascript
dotenv.config({ path: './config/config.env' })
connectDB() 
````
Calling connection here. ConnectDB comes after dotenv as I am calling process.env within the connectDB function.

```javasscript
const PORT = process.env.PORT || 8000
````
This is a fallback incase the process.env file doesn't work.

```javascript
const server = app.listen(PORT, () => console.log(`Express is listening on port ${PORT}`))
```
```javascript
process.on('unhandledRejection', (err, promise) => {
  console.log(`err: ${err.message}`)
  server.close(() => process.exit(1))
})
```
An example of an unhandled promise rejections: (node:44800) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated.

The unhandled promise rejections cause the server to "hang". Using process.exit allows us to put an end to it/kill the server.


## rover.js (models directory)
```javascript
const mongoose = require('mongoose')

const roverSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  position: { type: String, required: true, enum: ['N', 'E', 'S', 'W'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('Rover', roverSchema)
```
This roverSchema includes the x and y positions that will be returned as numbers and are required. It also includes the position which the rover wil face using enum to check for 'N', 'E', 'S' and 'W'.

## roverMovement.js (models directory)
```javascript
const mongoose = require('mongoose')

const roverMovementSchema = new mongoose.Schema({
  movement: { type: String, required: true, enum: ['r', 'R', 'l', 'L', 'm', 'M'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('RoverMovement', roverMovementSchema)
```
The roverMovementSchema includes only a movement key which will accept the strings included in the enum. I included both lower and upper case so that the enum will be case Insensitive.
'R' & 'L' = 90 degree rotation in the same spot. 'M' = movement.


## createRover function in controllers directory
```javascript
const roversCreate = asyncHandler(async(req, res, next) =>  {
  //* checking to see if req.body contains positions x & y & position or if it is undefined
  if (!req.body.x || req.body.x === undefined) {
    return next(new ErrorResponse('missing position x', 400))
  }
  if (!req.body.y || req.body.y === undefined) {
    return next(new ErrorResponse('missing position y', 400))
  }
  if (!req.body.position || req.body.position === undefined) {
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
```

## moveRover function in controllers directory
```javascript
const roversMovement = asyncHandler(async(req, res, next) => {
  if (!req.body.id || !req.body.movement) {
    return next(new ErrorResponse('missing movement assignement or Rover ID', 400))
  }
  const roverId = req.body.id 
  
  // * find the rover to be moved
  const rover = await Rover.findById(roverId)
  if (!rover){
    return next(new ErrorResponse(notFound, 404))
  }

  //* turns the movement string to uppercase then splits the movement string that is inputed into an array
  const moveRoverCommandsArray = req.body.movement.toUpperCase().split('') 

  const movementsArray = []

  //* this will be a copy of the rover model at this stage. This will be updated with every movement assigned to the rover.
  const roverInMotion = { 
    x: rover.x, 
    y: rover.y, 
    position: rover.position 
  }

  //* object which contains movement possibilities
  //* adding the function to M: to receive current position and manipulate it according to the movement input
  const movementOptions = {
    N: { L: 'W', R: 'E', 
      M: function(rover){
        return rover.y++
      } },
    E: { L: 'N', R: 'S',
      M: function(rover){
        return rover.x++
      } },
    S: { L: 'E', R: 'W', 
      M: function(rover){
        return rover.y--
      }  },
    W: { L: 'S', R: 'N',
      M: function(rover){
        return rover.x--
      } } 
  }

  //* Mapping through the movement commands within the array. 
  moveRoverCommandsArray.map((movement) => {
    if (movement === 'L' || movement === 'R') { 
      //* 'L' & 'R' are only 90 degree angle roataions
      //* Updating rover's current position through the movementOptions 
      roverInMotion.position = movementOptions[`${roverInMotion.position}`][`${movement}`]
    } else if (movement === 'M') {
      //* The rover will be updated with every movement assigned to the rover
      movementOptions[`${roverInMotion.position}`].M(roverInMotion)
    }
    //* pushing the new movement assignment into movementsArray
    movementsArray.push({ x: roverInMotion.x, y: roverInMotion.y, position: roverInMotion.position })
  })
  //* newPosition: roverInmotion = returning the end position once the movements have been completed
  //* movementsArray: movementsArray = returning an array of all of the movement positions 
  res.status(200).json({ newPosition: roverInMotion, movementsArray: movementsArray }) 
})
```

# Frontend:

As the name would suggest Main.js contains the "main" content of the app. 

```javascript
 const [gridState, setGridState] = useState([])
  const [roversState, setRoversState] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [clickedRoverId, setClickedRoverId] = useState({})

  useEffect(() => {
    const gridWidth = 6
    const gridHeight = 6
    let grid = []


    //* creating a 2 dimentional grid. x and y. 
    //* creating arrays within an array. The first array represents the y axis and the arrays nested within represent the x axis.
    for (let i = 0; i < gridHeight; i++) {
      //* This loop will create the number of rows representing the y axis as arrays. This will loop 6 times as stated in cellsHeight. 
      grid.push([])
      for (let ii = 0; ii < gridWidth; ii++) {
        grid[i].push({
          //* i represents the first loop which creates the y axis array. ii represents the second loop which creates the x axis arrays
          x: ii, y: i, active: false
        })
      }
    }

    //* reversing the order of the cells so that the bottom left corner will start at 0,0
    //* setting the reversed cells to state
    setGridState(grid.reverse())
  }, [])
```

This first useEffect is used to create the 2 dimentional grid with x and y. 

```javascript
useEffect(() => {
    const fetchRovers = async () => {
      try {
        const res = await getAllRovers()
        let rovers = []
        //* mapping through array of rovers, and pushing the roverId, currentPosition and the empty roverMovements into the rovers array
        res.data.map(rover => {
          rovers.push({
            roverId: rover._id,
            currentPosition: {
              x: rover.x,
              y: rover.y,
              position: rover.position
            },
            roverMovements: []
          })
          setRoversState(rovers) //* setting the rovers array to state
        })

        setIsLoading(false) //! Now that the grid is ready and the fetch of the rovers is completed and are set to state with setRoversState
      } catch (err) {
        console.log(err)
      }
    }
    //* if gridstate's length is larger than 1 then call fetchRovers function
    if (gridState.length > 1) {
      fetchRovers()
    }
  }, [gridState]) //* now every time gridState changes the function will run again
```
This second useEffect is used to fetch all the rovers.

I set the variable res to getAllRovers which sends a request to the backend and returns an array of all rovers. 

I then mapped through the array of rovers using res.data.map and pushed the roverId, current position and roverMovement as an object into the rovers array.
I Also included an empty roverMovements array which will be used later. The rovers array is then set to state.

The if statement is asking if the gridState's length is greater than one is true then call the fetchRovers function. I added gridState into the dependency array so that every time gridState changes the function will run again.


```javascript
  //* aquiring the rover id on click
  const handleClick = (e) => {
    const clickedRover = {
      roverId: e.target.getAttribute('rover_id'),
      x: e.target.getAttribute('cell_x'),
      y: e.target.getAttribute('cell_y'),
    }
    setClickedRoverId(clickedRover)
  }
```

This handleClick function is listening to the event.target. The event.target are then sored in the variable clickedRover and set to state with setClickedRoverId



## Wins

blablabla

## Challenges

blablabla

## Future Improvements

* Make grid's size adjustable
* Fine-tune styling
* Add Error messages on forms to let user's know what the issue is

## Key Learnings

blablabla