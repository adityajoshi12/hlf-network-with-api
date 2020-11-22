const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Creating schema
const NodeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    vpnIPAddress: {
      type: String,
    },
    httpProvider: String,
    status: {
      type: String,
      enum: ["Added", "Instantiated", "Started", "Stopped", "Removed"],
    },
    platforms: [
      {
        _id: false,
        name: String,
        status: String,
      },
    ],
    infraType: {
      type: Schema.Types.ObjectId,
      ref: "infraTypes",
    },
    masterNode: {
      type: Boolean,
      default: false,
    },
    domainName: {
      type: String,
      unique: true,
    },
    orgName: String,
    sshPort: {
      type: Number,
      default: 22,
    },
    sshKey: {
      file: {
        type: Buffer,
      },
      name: String,
      path: String,
    },
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      name: String,
    },
  },
  { timestamps: true }
);

module.exports = NodeModel = mongoose.model("nodes", NodeSchema);
