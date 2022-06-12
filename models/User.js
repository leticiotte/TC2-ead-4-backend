const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  email: {
    type: String,
    unique: true,
  },
  cpf: String,
  password: String,
  creationTimestamp: String,
  updatedTimestamp: String,
});

module.exports = User;
