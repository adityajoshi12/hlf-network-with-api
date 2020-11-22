const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  ethereum: {
    enabled: {
      type: Boolean,
      default: false
    },
    set: {
      type: Boolean,
      default: false
    }
  },
  fabric: {
    enabled: {
      type: Boolean,
      default: false
    },
    set: {
      type: Boolean,
      default: false
    }
  },
  node: [
    {
      type: Schema.Types.ObjectId,
      ref: "nodes"
    }
  ],
  password: String,
  keyphrase: String,
  account: String,
  status: {
    type: String,
    enum: ["Registered", "Active", "Disabled", "Removed"]
  },
  identifierToken: String,
  messageId: String,
  createdUsers: [
    {
      type: String,
      ref: "users"
    }
  ],
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: "roles"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokenExpiresAt: {
    type: Date,
    //default: new Date(new Date().getTime() + 15 * 60000) //15 min
  },
  lastLoggedIn: Date,
  lastLoggedOut: Date
});

module.exports = User = mongoose.model("users", UserSchema);
