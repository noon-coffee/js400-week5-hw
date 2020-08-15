const mongoose = require('mongoose');
const Order = require('../models/order');
const Item = require('../models/item');
// const { init } = require('../models/order');


module.exports.create = async(userId, itemObjs) => {
  // FIRST ATTEMPT: probably not as performant because a DB call is made for each item...?
  // let items = itemObjs.map(it => mongoose.Types.ObjectId(it));
  // for (let idx = 0; idx < items.length; idx++) {
  //   result = await Item.findOne({ _id: mongoose.Types.ObjectId(items[idx]) }, { _id: 0, price: 1} );
  //   total += result.price;
  // }

  let total = 0;
  let items = itemObjs.map(it => mongoose.Types.ObjectId(it));

  const result = (await Item.find( { _id: { $in: items } }))
    .map(function(doc) { return { id: doc._id.toString(), price: doc.price }; });

  for(let i = 0; i < itemObjs.length; i++) {
    const foundItem = result.find(doc => doc.id === itemObjs[i]);
    if (foundItem === undefined) {
      throw new BadDataError('Invalid item id.');
    } else {
      total += foundItem.price;
    }
  }

  const created = await Order.create( { userId, items, total } );
  return created;
}

module.exports.getAll = async() => {
  return Order.find().lean();
}

module.exports.getAllByUserId = async(userId) => {
  return Order.find( { userId } ).lean();
}

module.exports.getById = async(orderId) => {
  const query = [
    { $match: { _id: mongoose.Types.ObjectId(orderId) } },
    { $lookup: {
      from: "items",
      let: { "itemsArr": "$items" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$itemsArr"] } } },
        { $project: { _id: 0, price: 1, title: 1 } }
      ],
      as: "itemsArr"
    }},
    { $project: { items: "$itemsArr", _id: 0, total: 1, userId: 1, }},
  ];

  return (await Order.aggregate(query))[0];
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;