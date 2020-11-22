const axios = require("../config/axios"),
  fs = require("fs"),
  qs = require("qs"),
  path = require("path"),
  logger = require("../logger/advlogger")(module),
  { writePacakgeJson } = require("../utils/utilFunc");

//Loading the model
const Chaincode = require("../models/Chaincode");
const User = require("../models/User");
const FabricNetwork = require("../models/FabricNetwork");

const chaincodeLib = function () {};
/**
 * Desc: creating a new chaincode
 * @returns {response object}
 */
chaincodeLib.createNewChaincode = async (req) => {
  try {
    logger.debug(
      `Inside createNewChaincode()=> The request body is ${JSON.stringify(
        req.body
      )}`
    );
    logger.debug(
      `Inside createNewChaincode()=> The chaincode file path is ${req.file.path}`
    );
    //writing package.json file when chaincode language is nodejs
    if (req.body.language === "node") {
      const pathStr = path.dirname(req.file.path) + "/package.json";
      writePacakgeJson(req.body.name, req.file.originalname, pathStr);
    }

    //converting the file into buffer
    const file = fs.readFileSync(req.file.path);
    const encodedFile = file.toString("base64");
    const author = {
      id: req.decoded.id,
      name: req.decoded.name,
    };
    //preparing obj for participating org
    const fabricNetwork = await FabricNetwork.findOne({
      name: "PwC Fabric Network",
    }).exec();
    logger.debug(
      `Inside createNewChaincode()=> The found fabric network config is ${fabricNetwork}`
    );
    theChannelObj = fabricNetwork.channels.find(
      (o) => o.name === req.body.channel
    );
    logger.debug(
      `Inside createNewChaincode()=> The channel object is ${theChannelObj}`
    );
    const participatingOrg = theChannelObj.orgs.map((el) => {
      return {
        org: el,
        status: "New",
      };
    });
    logger.debug(
      `Inside createNewChaincode()=> The participating orgs are ${participatingOrg}`
    );
    const newChaincode = new Chaincode({
      name: req.body.name,
      language: req.body.language,
      chaincodeFile: {
        file: new Buffer(encodedFile, "base64"),
        path: req.file.path,
        name: req.file.originalname,
      },
      participatingOrg: participatingOrg,
      version: req.body.version,
      channel: req.body.channel,
      author: author,
    });
    logger.info("Inside createNewChaincode()=> The new chaincode is saved");
    return await newChaincode.save();
  } catch (error) {
    logger.error("Inside createNewChaincode()=> The error occurred");
    throw error;
  }
};

/**
 * Desc: update the chaincode
 * @returns {response object}
 */
chaincodeLib.updateChaincode = async (req) => {
  try {
    //converting the file into buffer
    const file = fs.readFileSync(req.file.path);
    const encodedFile = file.toString("base64");
    const chaincode = await Chaincode.findById(req.params.id).exec();
    logger.debug(
      `Inside updateChaincode()=> The old chaincode is ${chaincode}`
    );
    const author = {
      id: req.decoded.id,
      name: req.decoded.name,
    };
    logger.debug(
      `Inside updateChaincode()=> The updated chaincode file path is ${req.file.paths}`
    );
    //preparing obj for participating org
    const fabricNetwork = await FabricNetwork.findOne({
      name: "PwC Fabric Network",
    }).exec();
    logger.debug(
      `Inside updateChaincode()=> The fabric network config is ${fabricNetwork}`
    );
    theChannelObj = fabricNetwork.channels.find(
      (o) => o.name === chaincode.channel
    );
    logger.debug(
      `Inside updateChaincode()=> The channel object is ${theChannelObj}`
    );
    const participatingOrg = theChannelObj.orgs.map((el) => {
      return {
        org: el,
        status: "New",
      };
    });
    logger.debug(
      `Inside updateChaincode()=> The participatory orgs are ${participatingOrg}`
    );
    if (chaincode) {
      chaincode.name = req.body.name;
      chaincode.author = author;
      chaincode.participatingOrg = participatingOrg;
      //chaincode.version = `v${parseInt(chaincode.version.substring(1)) + 1}`;
      chaincode.version = req.body.version;
      chaincode.chaincodeFile = {
        file: new Buffer(encodedFile, "base64"),
        path: req.file.path,
        name: req.file.originalname,
      };
      logger.debug(
        `Inside updateChaincode()=> The updated chaincode is ${chaincode}`
      );
      logger.info(
        `Inside updateChaincode()=> The chaincode with id ${req.params.id} has been updated`
      );
      return await chaincode.save();
    } else {
      return "Chaincode not found";
    }
  } catch (error) {
    logger.error(
      `Inside updateChaincode()=> The error has occurred in chaincode update with id ${req.params.id}`
    );
    throw error;
  }
};

/**
 * Desc: Gives the list of chaincode
 * @returns {response object}
 */
chaincodeLib.getChaincodes = async (req) => {
  try {
    const user = await User.findById(req.decoded.id).populate("node").exec();
    logger.debug(
      `Inside getChaincodes()=> The get chaincode list is requested by ${user.name}`
    );
    return await Chaincode.find({ "participatingOrg.org": user.node[0]._id })
      .populate({
        path: "participatingOrg.org",
        select: "_id name ipAddress platforms",
      })
      .exec();
  } catch (error) {
    logger.error(`Inside getChaincodes()=> The error occurred`);
    throw error;
  }
};

/**
 * Desc: installs the chaincode
 * @returns {response object}
 */
chaincodeLib.installChaincode = async (req) => {
  try {
    const user = await User.findById(req.decoded.id).populate("node").exec();
    const chaincode = await Chaincode.findById(req.params.id)
      .populate("participatingOrg.org")
      .exec();
    logger.debug(
      `Inside installChaincode()=> The chaincode is to be installed is ${req.params.id}`
    );
    if (
      chaincode.participatingOrg.find(
        (theOrg) =>
          theOrg.org._id.equals(user.node[0]._id) && theOrg.status === "New"
      )
    ) {
      //regstering the user
      const regRes = await axios({
        method: "post",
        url: "users",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        data: qs.stringify({
          //username: user.node[0].name,
          username: user.name,
          orgName: user.node[0].orgName,
        }),
      });
      logger.debug(
        `Inside installChaincode()=> The user registration response is ${JSON.stringify(
          regRes.data
        )}`
      );
      //installing the chaincode
      if (regRes.data.success) {
        const fabricNetwork = await FabricNetwork.findOne({
          name: "PwC Fabric Network",
        })
          .populate("orgPeers.org")
          .exec();
        logger.debug(
          `Inside installChaincode()=> The fabric network config is ${fabricNetwork}`
        );
        const theOrg = fabricNetwork.orgPeers.find((el) =>
          el.org.equals(user.node[0]._id)
        );
        const peers = [];
        for (let j = 0; j < theOrg.noOfPeers; j++) {
          peers.push(`peer${j}.${theOrg.org.domainName}`);
        }
        logger.debug(`Inside installChaincode()=> The peers array is ${peers}`);
        let dir = "";
        let chaincodePath = "";
        if (chaincode.language === "golang") {
          dir = "go";
          chaincodePath = `github.com/${chaincode.name}_cc/${dir}`;
        } else if (chaincode.language === "node") {
          dir = "node";
          chaincodePath = `${process.env.FABRIC_SDK_DIR}/src/github.com/${chaincode.name}_cc/${dir}`;
        }
        const installRes = await axios({
          method: "post",
          url: `chaincodes`,
          headers: {
            authorization: `Bearer ${regRes.data.token}`,
          },
          data: {
            peers: peers,
            chaincodeName: chaincode.name,
            chaincodePath: chaincodePath,
            chaincodeType: chaincode.language,
            chaincodeVersion: chaincode.version,
          },
        });
        logger.debug(
          `Inside installChaincode()=> The chaincode installtion response is ${JSON.stringify(
            installRes.data
          )}`
        );
        if (installRes.data.success) {
          //changing the status of the chaincode
          const index = chaincode.participatingOrg.findIndex((obj) =>
            obj.org.equals(user.node[0]._id)
          );
          chaincode.participatingOrg[index].status = "Installed";
          await chaincode.save();
        }
        return installRes.data;
      } else {
        logger.info(
          `Inside installChaincode()=> User registration failed while chaincode installtion with id ${req.params.id}`
        );
        return {
          success: false,
          message: "User registeration failed",
        };
      }
    } else {
      return {
        success: false,
        message:
          "Either chaincode doesn't belongs to you or chaincode is already installed",
      };
    }
  } catch (error) {
    logger.error(
      `Inside installChaincode()=> Error occurred while installing chaincode with id ${req.params.id}`
    );
    throw error;
  }
};

/**
 * Desc: instantiate the chaincode
 * @returns {response object}
 */
chaincodeLib.instantiateChaincode = async (req) => {
  try {
    const user = await User.findById(req.decoded.id).populate("node").exec();
    const chaincode = await Chaincode.findById(req.params.id).exec();
    logger.debug(
      `Inside instantiateChaincode()=> The chaincode is to be instantiate is ${req.params.id}`
    );
    if (
      chaincode.participatingOrg.find(
        (theOrg) =>
          theOrg.org.equals(user.node[0]._id) && theOrg.status === "Installed"
      )
    ) {
      //regstering the user
      const regRes = await axios({
        method: "post",
        url: "users",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        data: qs.stringify({
          //username: user.node[0].name,
          username: user.name,
          orgName: user.node[0].orgName,
        }),
      });
      logger.debug(
        `Inside instantiateChaincode()=> The user registration response is ${JSON.stringify(
          regRes.data
        )}`
      );
      if (regRes.data.success) {
        //instantiate chaincode
        const instantiateRes = await axios({
          method: "post",
          url: `channels/${chaincode.channel}/chaincodes`,
          headers: {
            authorization: `Bearer ${regRes.data.token}`,
          },
          data: {
            chaincodeName: chaincode.name,
            chaincodeVersion: chaincode.version,
            chaincodeType: chaincode.language,
            args: req.body.args,
          },
        });
        logger.debug(
          `Inside instantiateChaincode()=> The chaincode instantiation response is ${JSON.stringify(
            instantiateRes.data
          )}`
        );
        if (instantiateRes.data.success) {
          //changing the status of the chaincode
          for (let i = 0; i < chaincode.participatingOrg.length; i++) {
            chaincode.participatingOrg[i].status = "Instantiated";
          }
          await chaincode.save();
        }
        return instantiateRes.data;
      } else {
        logger.info(
          `Inside instantiateChaincode()=> User registration failed while chaincode instantiate with id ${req.params.id}`
        );
        return {
          success: false,
          message: "User registeration failed",
        };
      }
    } else {
      return {
        success: false,
        message:
          "Either chaincode doesn't belongs to you or chaincode is already instaintiated",
      };
    }
  } catch (error) {
    logger.error(
      `Inside instantiateChaincode()=> Error occurred while instantiating chaincode with id ${req.params.id}`
    );
    throw error;
  }
};

module.exports = chaincodeLib;
