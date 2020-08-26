const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
// const router = require('./config/routes')
// const errorHandler = require('./lib/errorHandler')
const { dbURI, port } = require('./config/environment')

dotenv.config({ path: './config/config.env' })
try {
  mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true  },)
  // (err) => {
  //   if (err) return console.log(err)
  //   console.log('Mongo is Connected!')
  // })
  console.log('Mongo is Connected!')
} catch (err) {
  console.log(err)
}


const app = express()

app.use(bodyParser.json())

// app.use('/api', router)

// app.use(errorHandler)

app.listen(port, () => console.log(`Express is listening on port ${port}`))
