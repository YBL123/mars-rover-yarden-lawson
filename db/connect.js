const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DB_CONNECT,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true  },)
    console.log('Mongo is Connected!')
  } catch (err) {
    console.log(err)
  }  
}

module.exports = connectDB