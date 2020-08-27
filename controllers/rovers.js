const ErrorResponse = require('../middleware/errorResponse')
const Rover = require('../models/rover')
const { notFound } = require('../lib/errorMessages') //! may comment out also get rid of errorMessages.js
const asyncHandler = require('../middleware/async')

// * Create the controllers for your resouce here (index, create), (show, update delete optional)

async function roversIndex(req, res, next) {
  try {
    const rovers = await Rover.find()
    if (!rovers) throw new Error(notFound)
    //! return next(new ErrorResponse('not found', 404))
    res.status(200).json(rovers)
  } catch (err) {
    next(err)
  }
}

const roversCreate = asyncHandler(async(req, res, next) =>  {
  //* checking to see if req.body contains positions x & y & position or if it is undefined
  if (!req.body.x || req.body.x === undefined) {
    return next(new ErrorResponse('missing parameter x', 400))
  }
  if (!req.body.y || req.body.y === undefined) {
    res.status(400).json({ status: 'failed', error: 'missing position y' })
  }
  if (!req.body.position || req.body.position === undefined) {
    res.status(400).json({ status: 'failed', error: 'missing rover facing position' })
  } 

  const newRover = {
    //* turning x and y into ints and turning position to upperCase
    x: parseInt(req.body.x),
    y: parseInt(req.body.y),
    position: req.body.position.toUpperCase() 
  }

  const createdRover = await Rover.create(newRover) 
  //! INVALID IF COORDINATES ARE OUTSIDE OF THE 5*5 GRID //! first thing tomorrow
  //! if x > 5 || x < 0 throw error 'outside of grid parameters statuscode 400
  //! if y > 5 || y < 0 throw error 'outside of grid parameters statuscode 400

  res.status(201).json(createdRover)
  
})

async function roversShow(req, res, next) {
  //* this id is the object id
  //* whatever goes into /id: is referred to as the req.params.id
  const roverId = req.params.id
  //* if there's a valid mongo id but it's not a 'currently valid' one it will still error now. Forces it to go down to catch block. Throwing an error works in the same way as return so it shortcuts the circut. "THROWING TO CATCH"
  try {
    const rover = await Rover.findById(roverId)
    if (!rover) throw new Error(notFound)
    res.status(200).json(rover)
  } catch (err) {
    next(err)
  }
}

async function roversMovement(req, res, next) {
  // if (!req.body.id || !req.body.movement) throw new Error(notFound)

  // const roverId = req.body.id 
  // const movementsArray = req.body.movement.toUpperCase().split('') //* turns the movement string to uppercase then splits the movement string to an array
  // try {
  //   // * find the rover to be moved
  //   const rover = await Rover.findById(roverId)
  //   if (!rover) throw new Error(notFound)
  //   Object.assign(rover, req.body) // * merge the objects together to make the update
  //   await rover.save() // * then resave
  //   // * if not then send them back an unauthorised response
  //   res.status(202).json(rover)
  // } catch (err) {
  //   next(err)
  // }
  // if (movementsArray.includes('L' || 'R' || 'M')) {
  //   const roverInMovement = { x: rover.x, y: rover.y, position: rover.position }
  //   const movementOptions = { N: { L: 'E', R: 'W', M: 'y+1' }, E: { L: 'S', R: 'N', M: 'x-1' }, S: { L: 'W', R: 'E', M: 'y-1' }, W: { L: 'S', R: 'N', M: 'x+1' } }
  //   let i
  //   for (i = 0; i < movementsArray.length; i++) {
      
  //   }
  //   findByIdAndUpdate()
  // }
}
//* do these movements !include 'L, M, R,' -> ERROR 
//* IF YES THEN CONTINUE TO LOOP
//* for loop iterating over array.length to get movement
//* need immutable copy of rover that is found by id -> let roverInMovement = {x: rover.x, y: rover.y, position: rover.position}
//* at the end of the loop findByIdAndUpdate -> this will change the position of the rover
//* to imitate movement need to return array of positions -> each time I iterate of movement array -> pushed into position array. The rover needs to display:none from previous position and only appear in the new position
//* const movementOptions = {N: {L: 'E', R: 'W', M:'y+1'}, E:{L: 'S', R: 'N', M:'x-1'}, S:{L:'W', R:'E', M:'y-1'}, W:{L:'S', R:'N',  'x+1'}}

async function roversDelete(req, res, next) {
  const roverId = req.params.id
  try {
    const roverToDelete = await Rover.findById(roverId)
    if (!roverToDelete) throw new Error(notFound)
    await roverToDelete.remove()
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

// * export your controllers for use in the router

module.exports = {
  index: roversIndex,
  create: roversCreate,
  show: roversShow,
  movement: roversMovement,
  delete: roversDelete
}