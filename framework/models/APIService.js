const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const APIServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  protocol: String,
  host: {
    type: String,
    required: true
  },
  port: String,
  path: String,
  query: [
    {
      key: String,
      value: String
    }
  ],
  body: [
    {
      key: String,
      value: String
    }
  ],
  method: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    name: String
  },
  allowedUsers: [
    {
      _id: false,
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      limit: {
        type: Number,
        default: 1000
      },
      hits: {
        type: Number,
        default: 0
      }
    }
  ],
  analytics: {
    totalHits: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = APIService = mongoose.model("apiservice", APIServiceSchema);
