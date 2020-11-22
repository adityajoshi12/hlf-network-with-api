const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const ChaincodeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  participatingOrg: [
    {
      _id: false,
      org: {
        type: Schema.Types.ObjectId,
        ref: "nodes"
      },
      status: {
        type: String,
        enum: ["New", "Installed", "Instantiated"]
      }
    }
  ],
  chaincodeFile: {
    file: {
      type: Buffer
    },
    name: String,
    path: String
  },
  version: {
    type: String,
    required: true
  },
  channel: {
    type: String
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    name: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("chaincodes", ChaincodeSchema);
