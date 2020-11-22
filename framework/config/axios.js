const axios = require("axios");

module.exports = axios.create({
  baseURL: process.env.FABRIC_SDK_HOST,
  headers: { "content-type": "application/json" },
});
