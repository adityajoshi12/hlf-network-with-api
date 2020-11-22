const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Schema for Contract Repo

const ContractRepoSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  contractFile: {
    file: {
      type: Buffer
    },
    name: String,
    path: String
  },
  contractAddress: String,
  contentHash: String,
  abi: String,
  bin: String,
  compilerVersion: String,
  status: {
    type: String,
    enum: ["Compiled", "Deployed"]
  },
  mappedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  usecases: [
    {
      type: Schema.Types.ObjectId,
      ref: "usecases"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    },
    name: String
  }
});

module.exports = ContractRepo = mongoose.model("contracts", ContractRepoSchema);
