const { Router } = require("express");
const router = Router();
const orderDAO = require('../daos/order');
const utils = require('./utils');


/*
 * Create: 
 * POST /orders
 * Open to all users
 * Takes an array of item _id values (repeat values can appear). Order should 
 * be created with a total field with the total cost of all the items from 
 * the time the order is placed (as the item prices could change). The order 
 * should also have the userId of the user placing the order.
 */
router.post("/", 
  utils.isUserAuthenticated, 
  async (req, res, next) => {
    try
    {
      const userId = req.userId;
      const items = req.body;
      if (!items || !items.length) { 
        res.status(400).send('order requires at least 1 item'); 
        return; 
      }

      const createdOrder = await orderDAO.create(userId, items);
      res.json(createdOrder);
    }
    catch(err)
    {
      if (err instanceof orderDAO.BadDataError) {
        res.status(400).send(err.message);
      } else {
        next(err);
      }
    }
  }
);

 
/*
 * Get an order: 
 * GET /orders/:id
 * Return an order with the items array containing the full item objects rather 
 * than just their _id. If the user is a normal user return a 404 if they did 
 * not place the order. An admin user should be able to get any order.
 */
router.get("/:id", 
  utils.isUserAuthenticated, 
  async (req, res, next) => {
    try 
    {
      const orderId = req.params.id;
      if (!orderId || orderId === '') { 
        res.status(400).send('id param value is required'); 
        return; 
      }

      const order = await orderDAO.getById(orderId);
      if (!order) {
        res.sendStatus(404); 
        return;
      }
      //if neither an admin nor the user's order
      if (!req.user.roles.includes(utils.roleNameAdmin) && String(order.userId) !== req.userId) {
        res.sendStatus(404);
        return;
      }

      res.json(order);
  } 
  catch(err) 
  {
    next(err);
  }
});


/*
 * Get my orders: 
 * GET /orders
 * Return all the orders made by the user making the request
 */
router.get("/", 
  utils.isUserAuthenticated, 
  async (req, res, next) => {
    try
    {
      let orders;
      if (req.user.roles.includes(utils.roleNameAdmin)) { 
        orders = await orderDAO.getAll();
      } else {
        orders = await orderDAO.getAllByUserId(req.userId);
      }

      res.json(orders);
    }
    catch(err)
    {
      next(err);
    }
});


module.exports = router;