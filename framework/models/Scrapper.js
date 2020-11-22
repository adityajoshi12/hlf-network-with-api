const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Schema for the Blockstate
const ScrapperSchema = new Schema({
  latestBlock: Number,
  scrappedBlock: Number,
  visitorCounter: {
    default: 0,
    type: Number,
  },
});

module.exports = Scrapper = mongoose.model("scrappers", ScrapperSchema);
