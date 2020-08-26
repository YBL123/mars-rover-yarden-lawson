// * rename your file to reflect your resource
const Rover = require('../models/rover')
const { notFound, unauthorized } = require('../lib/errorMessages')

// * Create the controllers for your resouce here (index, create), (show, update delete optional)

async function roversIndex(req, res, next) {
  try {
    //* populate tells rover you're going to find a key called user. can you look it up and populate it. So instead of just the string it looks up the user and populates their user object in place of it
    const rovers = await Rover.find().populate('user').populate('comments.user')
    if (!rovers) throw new Error(notFound)
    res.status(200).json(rovers)
  } catch (err) {
    next(err)
  }
}

async function roversCreate(req, res, next) {
  try {
    req.body.user = req.currentUser // * attach the currentUser, to the request body data, it can now pass validation
    const createdRover = await Rover.create(req.body)
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
    const rover = await Rover.findById(roverId).populate('user')
    if (!rover) throw new Error(notFound)
    res.status(200).json(rover)
  } catch (err) {
    next(err)
  }
}

async function roversUpdate(req, res, next) {
  const roverId = req.params.id
  try {
    // * find the dog to be updated
    const rover = await Rover.findById(roverId)
    if (!rover) throw new Error(notFound)
    // * check if the request currentUser (learnt from the token) is the same as the user who created this rover
    if (!rover.user.equals(req.currentUser._id)) throw new Error(unauthorized)
    // * if it is, let them edit
    Object.assign(rover, req.body) // * merge the objects together to make the update
    await rover.save() // * then resave
    // * if they are not that creator, send them back an unauthorised response
    res.status(202).json(rover)
  } catch (err) {
    next(err)
  }
}

async function roversDelete(req, res, next) {
  const roverId = req.params.id
  try {
    const roverToDelete = await Rover.findById(roverId)
    if (!roverToDelete) throw new Error(notFound)
    // if (!roverToDelete.user.equals(req.currentUser._id)) throw new Error(unauthorized)
    await roverToDelete.remove()
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

// // * POST - body = { a valid comment object }
// // * URL - api/dogs/:id/comments
// async function dogsCommentCreate(req, res, next) {
//   console.log('comment created')
//   try {
//     // * Find the dog that we are creating a comment on
//     req.body.user = req.currentUser
//     const dogId = req.params.id
//     const dog = await Dog.findById(dogId)
//     if (!dog) throw new Error(notFound)
//     // * attach our comment object(sent in the request body) to that dog, pushing into its comments array
//     dog.comments.push(req.body)
//     // * resave that dog with the new comments
//     await dog.save()
//     // * send back that dog in response, with new comment present
//     res.status(201).json(dog)
//   } catch (err) {
//     next(err)
//   }
// }

// // * DELETE 
// // * URL = /dogs/:id/comments/commentId
// async function dogsCommentDelete(req, res, next) {
//   try {
//     // * find the dog to delete the comment from, find by id
//     const dogId = req.params.id
//     const commentId = req.params.commentId
//     const dog = await Dog.findById(dogId)
//     if (!dog) throw new Error(notFound)
//     // * delete the comment from that dog, using the commentId
//     const commentToRemove = dog.comments.id(commentId)
//     if (!commentToRemove) throw new Error(notFound)
//     if (!commentToRemove.user.equals(req.currentUser._id) || !dog.user.equals(req.currentUser._id)) {
//       throw new Error(unauthorized)
//     }
//     await commentToRemove.remove()
//     // * resave it again, with that comment deleted
//     await dog.save()
//     // * send no content to signfy deletion is complete
//     res.sendStatus(204)
//   } catch (err) {
//     next(err)
//   }
// }

// * export your controllers for use in the router

module.exports = {
  index: roversIndex,
  create: roversCreate,
  show: roversShow,
  update: roversUpdate,
  delete: roversDelete,
}