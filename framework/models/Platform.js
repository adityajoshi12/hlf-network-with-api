const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Creating Schema
const PlatformSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Platform = mongoose.model("platforms", PlatformSchema);
