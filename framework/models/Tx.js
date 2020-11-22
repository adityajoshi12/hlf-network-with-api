const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Schema for the transactions

const TxSchema = new Schema({
  contractAddress: String,
  contractName: String,
  txType: {
    type: String,
    default: "Transaction",
    enum: ["Transaction", "Contract Creation", "Fund Transfer"]
  },
  blockNumber: Number,
  txhash: String,
  fromAddress: String,
  fromName: String,
  gasUsed: Number,
  createdAt: {
    type: Date
  }
});

module.exports = Tx = mongoose.model("txs", TxSchema);
