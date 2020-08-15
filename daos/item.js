const mongoose = require('mongoose');
const Item = require('../models/item');


module.exports.create = async(itemData) => {
  const created = await Item.create(itemData);
  return created;
}

module.exports.getById = async(itemId) => {
  return Item.findOne( { _id: itemId } );
}

module.exports.getAll = async() => {
  return Item.find().lean();
}

module.exports.updateById = async (itemId, newObj) => {
  await Item.updateOne({ _id: itemId }, newObj);
  return true;
}