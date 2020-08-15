const jwt = require('jsonwebtoken');


const jwtSecret = 'my super secret';
const roleNameAdmin = 'admin';
module.exports = { jwtSecret, roleNameAdmin }

/*
 * Middleware to enforce authentication on protected routes
 * You'll want to write an isAuthorized middleware function that can be reused. It 
 * should verify the JWT provided in req.headers.authorization and put the decoded 
 * value on the req object.
 */
module.exports.isUserAuthenticated = (async (req, res, next) => { 
  try
  {
    // User should already have user auth token (already be authenticated)
    const reqToken = req.headers.authorization;
    if (!reqToken || reqToken === '') {
      res.sendStatus(401); // 401 Unauthorized
      return;
    }

    // remove "Bearer " prefix from auth request header
    const tokenString = reqToken.replace('Bearer ', ''); 

    // verify token; error handling middleware should handle invalid token error
    const decodedToken = jwt.verify(tokenString, jwtSecret);

    // identify user using decoded token
    req.userId = decodedToken._id;
    req.user = {
      userId: decodedToken._id,
      email: decodedToken.email,
      roles: [...decodedToken.roles],
    }

    // call next middleware function
    next();
  }
  catch(err)
  {
    next(err)
  }
});

/*
 * You'll want to write an isAdmin middleware function that can be reused. If the user 
 * making the request is not an admin it should respond with a 403 Forbidden error.
 */
module.exports.isAdmin = (async (req, res, next) => {
  // assumes Request.user exists, so use after authentication middleware
  if (req.user.roles.includes(roleNameAdmin)) { 
    next(); 
  } else { 
    res.sendStatus(403); // 403 Forbidden 
  }
});