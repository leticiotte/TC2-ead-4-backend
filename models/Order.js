const mongoose = require("mongoose");

const Order = mongoose.model("Order", {
  productId: String,
  userId: String,
  quantity: Number,
  zipCode: String,
  streetNumber: Number,
  complement: String,
  totalValue: Number,
  creationTimestamp: String,
  updatedTimestamp: String,
});

module.exports = Order;
