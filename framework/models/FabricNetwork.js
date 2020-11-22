const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Schema for the transactions
const FabricNetworkSchema = new Schema({
  name: String,
  orderer: {
    type: Schema.Types.ObjectId,
    ref: "nodes"
  },
  orgPeers: [
    {
      _id: false,
      org: {
        type: Schema.Types.ObjectId,
        ref: "nodes"
      },
      orgName: String,
      noOfPeers: Number
    }
  ],
  channels: [
    {
      _id: false,
      name: String,
      orgs: [
        {
          type: Schema.Types.ObjectId,
          ref: "nodes"
        }
      ]
    }
  ],
  pushedVersion: {
    type: Number,
    default: 0
  },
  currentVersion: {
    type: Number,
    default: 0
  },
  services: {
    type: Object
  },
  startExitCode: Number,
  updateExitCode: Number,
  createdBy: {
    id: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    name: String
  }
});

module.exports = FabricNetwork = mongoose.model(
  "fabricnetworks",
  FabricNetworkSchema
);
