const jwt = require("jsonwebtoken"),
  ResponseMsgs = require("../config/response_msgs.json"),
  isEmpty = require("is-empty");

//Environment Config
require("dotenv").config();
const User = require("../models/User");
const ContractRepo = require("../models/ContractRepo");

let checkToken = async (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase

  if (token) {
    if (token.startsWith("Bearer ")) {
      //Remove Bearer from string
      token = token.slice(7, token.length);
    }
    try {
      const decoded = await jwt.verify(token, process.env.SECRET_OR_KEY);
      req.decoded = decoded;
      const user = await User.findById(decoded.id)
        .populate("roles")
        .populate("node")
        .exec();
      if (
        user.lastLoggedIn > user.lastLoggedOut &&
        Math.abs(new Date(user.lastLoggedIn).getTime() / 1000 - decoded.iat) < 2
      ) {
        const roleIds = user.roles.map((role) => role.roleId);
        req.decoded["name"] = "user.name";
        req.decoded["email"] = "user.email";
        req.decoded["account"] = "user.account";
        req.decoded["roles"] = roleIds;
        req.decoded["node"] = isEmpty(user.node[0])
          ? ""
          : user.node[0].httpProvider;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: ResponseMsgs.ALREADY_LOGGED_OUT,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: ResponseMsgs.TOKEN_INVALID,
      });
    }
  } else {
    return res.json({
      success: false,
      message: ResponseMsgs.AUTH_TOKEN_NOT_SUPPLIED,
    });
  }
};

let checkDappAuth = async (req, res, next) => {
  try {
    if (req.query.auth === "true") {
      const user = await User.findOne({
        account: { $regex: new RegExp(req.body.account, "i") },
      }).exec();

      const contract = await ContractRepo.findOne({
        contractAddress: { $regex: new RegExp(req.body.contractAddress, "i") },
      })
        .populate("mappedUsers")
        .exec();

      if (contract.mappedUsers.some((u) => u._id.equals(user._id))) {
        next();
      } else {
        return res.status(500).json({
          status: "Error",
          operation: ResponseMsgs.DAPP_CONTRACT_EXECUTION_OPERATION,
          msg: ResponseMsgs.CONTRACT_ACCESS_FAILURE,
        });
      }
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      operation: ResponseMsgs.DAPP_CONTRACT_EXECUTION_OPERATION,
      msg: error.message,
    });
  }
};

let allowNetworkAdmin = (req, res, next) => {
  try {
    if (isEmpty(req.decoded.roles) || !req.decoded.roles.includes("1")) {
      return res.status(403).json({
        status: "Error",
        msg: "Forbidden",
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      msg: error.message,
    });
  }
};
module.exports = {
  checkToken: checkToken,
  checkDappAuth: checkDappAuth,
  allowNetworkAdmin: allowNetworkAdmin,
};
