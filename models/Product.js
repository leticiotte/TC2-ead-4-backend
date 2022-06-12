const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  name: String,
  brand: String,
  size: String,
  url: String,
  price: Number,
  creationTimestamp: String,
  updatedTimestamp: String,
});

module.exports = Product;
