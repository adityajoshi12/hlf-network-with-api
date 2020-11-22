const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//create Schema
const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    solutionName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    messageId: String,
  },
  { timestamps: true }
);

module.exports = Contact = mongoose.model("contacts", ContactSchema);
