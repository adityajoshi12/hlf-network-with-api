const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for the Infra Type

const InfraTypeSchema = new Schema({
  name: {
    type: String
  }
});

module.exports = InfraType = mongoose.model("infraTypes", InfraTypeSchema);
