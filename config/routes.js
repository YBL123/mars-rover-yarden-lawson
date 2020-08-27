// * manage incoming requests here 

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



//* secureRoute - adding "security guards where needed"

// * Export your router! you will need to register this as middleware in "index.js" !