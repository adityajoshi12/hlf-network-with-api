const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//create Schema
const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ["Network Admin", "Application Admin", "End User"]
  },
  roleId: {
      type: String,
      required: true,
      enum:["1", "2", "3"]
  }
});

module.exports = Role = mongoose.model("roles", RoleSchema);
