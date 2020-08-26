const Rover = require('../models/rover')
const { notFound } = require('../lib/errorMessages')
// const { notFound, unauthorized } = require('../lib/errorMessages')

// * Create the controllers for your resouce here (index, create), (show, update delete optional)

async function roversIndex(req, res, next) {
  try {
    const rovers = await Rover.find()
    if (!rovers) throw new Error(notFound)
    res.status(200).json(rovers)
  } catch (err) {
    next(err)
  }
}

async function roversCreate(req, res, next) {
  try {
    const createdRover = await Rover.create(req.body)
    //* NEED TO CAPITALIZE NESW
    //* NEED TO CHECK BODY CONTAINS X, Y, POSITION
    //* OBJECT.KEYS
    //* INVALID IF COORDINATES ARE OUTSIDE OF THE 5*5 GRID
    res.status(201).json(createdRover)
  } catch (err) {
    next(err)
  }
}

async function roversShow(req, res, next) {
  //* this id is the object id
  //* whatever goes into /id: is referred to as the req.params.id
  const roverId = req.params.id
  //* if there's a valid mongo id but it's not a 'currently valid' one it will still error now. Forces it to go down to catch block. Throwing an error works in the same way as return so it shortcuts the circut. THROWING TO CATCH
  try {
    const rover = await Rover.findById(roverId)
    if (!rover) throw new Error(notFound)
    res.status(200).json(rover)
  } catch (err) {
    next(err)
  }
}

async function roversMovement(req, res, next) {
  if (!req.body.id || !req.body.movement) throw new Error(notFound)

  const roverId = req.body.id
  const movementsArray = req.body.movement.split('') //* splits the movement string to array
  try {
    // * find the rover to be moved
    const rover = await Rover.findById(roverId)
    if (!rover) throw new Error(notFound)
    Object.assign(rover, req.body) // * merge the objects together to make the update
    await rover.save() // * then resave
    // * if they are not that creator, send them back an unauthorised response
    res.status(202).json(rover)
  } catch (err) {
    next(err)
  }
  //* do these movements !include 'L, M, R,' -> ERROR 
  //* IF YES THEN CONTINUE TO LOOP
  //* for loop iterating over array.length to get movement
  //* need immutable copy of rover that is found by id -> let roverInMovement = {x: rover.x, y: rover.y, positiong: rover.position}
  //* at the end of the loop findByIdAndUpdate -> this will change the position of the rover
  //* to imitate movement need to return array of positions -> each time I iterate of movement array -> pushed into position array. The rover needs to display:none from previous position and only appear in the new position
}

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
  update: roversMovement,
  delete: roversDelete
}