const mongoose = require('mongoose')

//* individual document
const roverSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  position: { type: String, required: true, enum: ['N', 'E', 'S', 'W'] } 
}, {
  timestamps: true
})

module.exports = mongoose.model('Rover', roverSchema)
//* registers schema as model
//* this is what each individual document will be
//* mongo automatically pluralises for collection
//* each individual document in collection will have to follow the above rules
//* mongo also automatically creates an id for each document
//* all future communication will be done through mongoose.model
