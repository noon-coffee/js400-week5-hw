const { Router } = require("express");
const router = Router();


router.use("/login", require('./login'));
router.use("/items", require('./items'));
router.use("/orders", require('./orders'));

/*
 * Middleware for error handling
 */
router.use(async (err, req, res, next) => {
  if (err.message.includes("Cast to ObjectId failed")) //db: invalid ObjectId
  {    
    res.status(400).send('Invalid id provided.');
  }
  else if (err.message.includes("E11000 duplicate key error")) //db: unique index error
  {
    res.sendStatus(409);
  } 
  else if (err.message.includes('jwt malformed')) //jwt: invalid token
  {
    res.sendStatus(401);
  }
  else 
  {    
    console.log('500 error', err.message, err.stack);
    res.status(500).send('An unexpected error occurred.')  
  } 
});


module.exports = router;