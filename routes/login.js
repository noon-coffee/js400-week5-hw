const { Router } = require("express");
const router = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDAO = require('../daos/user');
const utils = require('./utils');

const numSaltRounds = 12;

/*
 * Signup:
 * POST /login/signup
 */
router.post("/signup", async (req, res, next) => {
  try
  {
    const reqEmail = req.body.email;
    const reqPassword = req.body.password;
    if (!reqEmail || reqEmail === '') { 
      res.status(400).send('email is required'); 
      return; 
    }
    if (!reqPassword || reqPassword === '') { 
      res.status(400).send('password is required'); 
      return; 
    }

    // verify that email isn't already taken
    const doesEmailExist = await userDAO.getByEmail(reqEmail);
    if (doesEmailExist) {
      res.status(409).send('email is already taken'); 
      return;
    }

    // create and persist User using their signup creds
    // (e.g., email and hashed! password)
    const passwordHash = await bcrypt.hash(reqPassword, numSaltRounds);
    const userToCreate = { 
      email: reqEmail, 
      password: passwordHash,
      roles: ['user'] //default role upon signup
    };
    await userDAO.create(userToCreate);

    res.sendStatus(200);
  }
  catch(err)
  {
    next(err);
  }
});


/*
 * Login:
 * POST /login
 */
router.post("/", async (req, res, next) => { 
  try
  {
    const reqEmail = req.body.email;
    const reqPassword = req.body.password;
    if (!reqEmail || reqEmail === '') { 
      res.status(400).send('email is required'); 
      return; 
    }
    if (!reqPassword || reqPassword === '') { 
      res.status(400).send('password is required'); 
      return; 
    }

    // verify User creds - both email and password need to match
    const existingUser = await userDAO.getByEmail(reqEmail);
    if (!existingUser) {
      res.sendStatus(401); 
      return;
    }
    const doesPasswordMatch = await bcrypt.compare(reqPassword, existingUser.password);
    if (!doesPasswordMatch) {
      res.sendStatus(401); 
      return;
    }

    // issue JWT token
    const tokenData = {
      _id: existingUser._id,  
      email: existingUser.email,
      roles: [...existingUser.roles],
    };
    const tokenString = jwt.sign(tokenData, utils.jwtSecret, { expiresIn: '1h' });
    res.json( {token: tokenString} );
  }
  catch (err)
  {
    next(err);
  }
});


/*
 * Change Password:
 * POST /login/password
 */
router.post("/password", 
  utils.isUserAuthenticated, 
  async (req, res, next) => { 
    try
    {
      const reqPassword = req.body.password;
      if (!reqPassword || reqPassword === '') { 
        res.status(400).send('new password is required'); 
        return; 
      }

      // persist new User hashed! password cred
      const passwordHash = await bcrypt.hash(reqPassword, numSaltRounds);
      await userDAO.updatePassword(req.userId, passwordHash);

      res.sendStatus(200);
    }
    catch(err)
    {
      next(err);
    }
  }
);


module.exports = router;