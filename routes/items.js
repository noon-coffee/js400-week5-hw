const { Router } = require("express");
const router = Router();
const itemDAO = require('../daos/item');
const utils = require('./utils');


/*
 * Create: 
 * POST /items
 * Restricted to users with the "admin" role
 */
router.post("/", 
  utils.isUserAuthenticated, 
  utils.isAdmin, 
  async (req, res, next) => {
    try
    {
      const {title, price} = req.body;
      if (!title || title === '') { 
        res.status(400).send('title is required'); 
        return; 
      }
      if (!price || price === '') { 
        res.status(400).send('price is required'); 
        return; 
      }

      const createdItem = await itemDAO.create({ title, price });
      res.json(createdItem);
    }
    catch(err)
    {
      next(err);
    }
  }
);


/*
 * Update: 
 * PUT /items/:id 
 * Restricted to users with the "admin" role
 */
router.put("/:id", 
  utils.isUserAuthenticated, 
  utils.isAdmin, 
  async (req, res, next) => {
    try
    {
      const itemId = req.params.id;
      const item = req.body;

      if (!item || JSON.stringify(item) === '{}' ) {
        res.status(400).send('item is required"');
        return;
      }

      const isUpdated = await itemDAO.updateById(itemId, item);
      res.sendStatus(isUpdated ? 200 : 400); 
    }
    catch(err)
    {
      next(err);
    }
  }
);

// Get a single item:
// GET /items/:id
// Open to all users
router.get("/:id", 
  utils.isUserAuthenticated, 
  async (req, res, next) => {
  try 
  {
    const itemId = req.params.id;
    if (!itemId || itemId === '') { 
      res.status(400).send('id param value is required'); 
      return; 
    }

    const item = await itemDAO.getById(itemId);
    if (!item) {
      res.sendStatus(404); 
      return;
    }

    res.json(item);
  } 
  catch(err) 
  {
    next(err);
  }
});


/*
 * Get all items: 
 * GET /items
 * Open to all users
 */
router.get("/", 
  utils.isUserAuthenticated,  
  async (req, res, next) => {
    try
    {
      const items = await itemDAO.getAll();
      res.json(items);
    }
    catch(err)
    {
      next(err);
    }
  }
);


module.exports = router;