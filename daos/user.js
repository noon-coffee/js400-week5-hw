const mongoose = require('mongoose');
const User = require('../models/user');


module.exports.create = async(userData) => {
  const created = await User.create(userData);
  return created;
}

module.exports.getByEmail = async(email) => {
  return User.findOne( { email: email } ).lean();
}

module.exports.updatePassword = async(userId, newPassword) => {
  await User.updateOne( { _id: userId }, { $set: {password: newPassword} } );
  return true;
}