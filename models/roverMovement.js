const mongoose = require('mongoose')

//* individual document
const roverMovementSchema = new mongoose.Schema({
  movement: { type: String, required: true, enum: ['r', 'R', 'l', 'L', 'm', 'M'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('RoverMovement', roverMovementSchema)

//* R + L = 90 degree spin in the same spot
//* M = movement