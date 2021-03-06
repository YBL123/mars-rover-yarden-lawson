const ErrorResponse = require('../middleware/errorResponse')
const Rover = require('../models/rover')
const { notFound } = require('../lib/errorMessages') 
const asyncHandler = require('../middleware/async')

// * Create the controllers for your resouce here (index, create), (show, update delete optional)

const roversIndex = asyncHandler(async(req, res, next) => {
  //* returns every document existing inside collection of rovers (array)
  //* In larger databases/future it would be better to add pagination and limit the number of documents returned. 
  const rovers = await Rover.find() 
  
  if (!rovers) {
    return next(new ErrorResponse(notFound, 404))
  }
  res.status(200).json(rovers)
})

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
    //* Turning x and y into ints and turning position to upperCase
    //* By assigning these keys to the newRover const I am making sure that these are the only 3 params that will be accepted when creating a new Rover, regardless of whatever the req.body may contain 
    x: parseInt(req.body.x),
    y: parseInt(req.body.y),
    position: req.body.position.toUpperCase() 
  }


  //* INVALID IF COORDINATES ARE OUTSIDE OF THE 5*5 GRID 
  if (req.body.x > 5 || req.body.x < 0) {
    return next(new ErrorResponse('Outside of grid parameters', 400))
  }
  if (req.body.y > 5 || req.body.y < 0) {
    return next(new ErrorResponse('Outside of grid parameters', 400))
  }

  //* CREATE ROVER
  const createdRover = await Rover.create(newRover) 

  res.status(201).json(createdRover)
  
})

const roversShow = asyncHandler(async(req, res, next) => {
  //* this id is the object id
  //* whatever goes into /:id is referred to as the req.params.id
  const roverId = req.params.id
  //* if there's a valid mongo id but it's not a 'currently valid' one it will still error now
  const rover = await Rover.findById(roverId)
  if (!rover) {
    return next(new ErrorResponse(notFound, 404))
  }
  res.status(200).json(rover)
})

const roversMovement = asyncHandler(async(req, res, next) => {
  if (!req.body.id || !req.body.movement) {
    return next(new ErrorResponse('missing movement assignement or Rover ID', 400))
  }
  const roverId = req.body.id 
  
  // * find the rover to be moved by id
  //* assigning the rover document found by id to the const rover ---> this document is immutable as it's a model
  const rover = await Rover.findById(roverId)
  if (!rover){
    return next(new ErrorResponse(notFound, 404))
  }

  //* turns the movement string to uppercase then splits the movement string that is inputed into an array
  const moveRoverCommandsArray = req.body.movement.toUpperCase().split('') 

  const movementsArray = []

  //* This will be a copy of the rover model at this stage. This will be updated with every movement assigned to the rover.
  //* This copy will be mutable
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
        if (rover.y !== 5) {
          return rover.y++
        } else {
          return 
        }
      } },
    E: { L: 'N', R: 'S',
      M: function(rover){
        if (rover.x !== 5) {
          return rover.x++
        } else {
          return
        }
      } },
    S: { L: 'E', R: 'W', 
      M: function(rover){
        if (rover.y !== 0) {
          return rover.y--
        } else {
          return
        }
      }  },
    W: { L: 'S', R: 'N',
      M: function(rover){
        if (rover.x !== 0) {
          return rover.x--
        } else {
          return
        }
      } } 
  }

  //* Mapping through the movement commands within the array. 
  moveRoverCommandsArray.map((movement) => {
    if (movement === 'L' || movement === 'R') { 
      //* 'L' & 'R' are only 90 degree angle roataions
      //* Updating rover's current position through the movementOptions 
      //* Each [] attached to an object represents the set of keys. If there are more keys inside the key it will represent those.
      //* Finding current rover position through roverInMotion.position -> this is the first set of keys for movemntOptions. The second [] are the keys nested within the first keys of movementOptions -> according to movement L, R or M the new position is received
      //* even though roverInMotion is a const it still remains an object and the keys remain the same -> therefore the value can still be changed
      roverInMotion.position = movementOptions[`${roverInMotion.position}`][`${movement}`]

    } else if (movement === 'M') {
      //* The rover will be updated with every movement assigned to the rover
      //* calling the M function from movementOptions and passsing the roverInMotion object as a param
      //* The M function then mutates the roverInMotion object by altering the x or y with the given movement input
      movementOptions[`${roverInMotion.position}`].M(roverInMotion)
    }
    //* pushing the new movement assignment into movementsArray -> this saves the history of the movement within the array of objects
    movementsArray.push({ x: roverInMotion.x, y: roverInMotion.y, position: roverInMotion.position })
  })
  //* newPosition: roverInMotion = returning the end position once the movements have been completed
  //* movementsArray: movementsArray = returning an array of all of the movement positions 
  //* roverId: rover._id = returning rover's id
  //* updating to the new postion of the rover and saving to database
  //* new: true --->  mongoose indicator to return the updated document --> in this case it is irrelevant because I am not saving the updated document in any variable. However I may like to in the future

  await Rover.findByIdAndUpdate(rover._id, roverInMotion, { new: true })

  //* Sending back a json object consisting of the roverId, newPosition and movementsArray
  res.status(200).json({ roverId: rover._id, newPosition: roverInMotion, movementsArray: movementsArray }) 

})

//* finds rover by id by params as the id is already contained within the url used by the delete request.
//* if roverToDelete = true await roverToDelete.remove()
const roversDelete = asyncHandler(async(req, res, next) => {
  const roverId = req.params.id
  const roverToDelete = await Rover.findById(roverId)
  if (!roverToDelete){
    return next(new ErrorResponse(notFound, 404))
  }
  await roverToDelete.remove()
  res.sendStatus(204)
})

// const sayHello = async () => {
//   const string = 'hello'
//   return string
// }

// * export your controllers for use in the router

module.exports = {
  index: roversIndex,
  create: roversCreate,
  show: roversShow,
  movement: roversMovement,
  delete: roversDelete
  // sayHello: sayHello
}