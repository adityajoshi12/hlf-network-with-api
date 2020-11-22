const express = require("express"),
  router = express.Router(),
  response = require("../../../lib/response"),
  ResponseMsgs = require("../../../config/response_msgs.json"),
  chaincodeLib = require("../../../fabric/chaincode"),
  { checkToken } = require("../../../middleware/index"),
  fs = require("fs"),
  path = require("path"),
  multer = require("multer"),
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let dir = "";
      //making src folder
      dir = path.join(`${process.env.FABRIC_SDK_DIR}`, "src");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      //making github.com folder
      dir = path.join(`${process.env.FABRIC_SDK_DIR}`, "src", "github.com");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (req.body.language === "golang") {
        dir = path.join(
          `${process.env.FABRIC_SDK_DIR}`,
          "src",
          "github.com",
          `${req.body.name}_cc`
        );
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
          dir = path.join(dir, "go");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
        } else {
          dir = `${process.env.FABRIC_SDK_DIR}/src/github.com/${req.body.name}_cc/go/`;
        }
      } else if (req.body.language === "node") {
        dir = path.join(
          `${process.env.FABRIC_SDK_DIR}`,
          "src",
          "github.com",
          `${req.body.name}_cc`
        );
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
          dir = path.join(dir, "node");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
        } else {
          dir = `${process.env.FABRIC_SDK_DIR}/src/github.com/${req.body.name}_cc/node/`;
        }
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  upload = multer({ storage: storage }),
  logger = require("../../../logger/advlogger")(module);

/**
 * @route POST /api/fabric/chaincode/
 * @desc creating a new chaincode
 * @access Application Admin
 */
router.post(
  "/",
  //   checkToken,
  upload.single("chaincodeFile"),
  async (req, res) => {
    try {
      logger.info("End point: POST /api/fabric/chaincode/");
      logger.debug(`Username: ${req.decoded.name}`);
      const result = await chaincodeLib.createNewChaincode(req);
      logger.debug(`The new chaincode creation request result is ${result}`);
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_CREATION_OPERATION,
        msg: result,
      };
      return response.onSuccess(responseData, res);
    } catch (error) {
      logger.error(
        `Failed to create new chaincode for user: ${req.decoded.name} with error ${error.stack}`
      );
      return response.onFailure(error.message, res, 500);
    }
  }
);

/**
 * @route POST /api/fabric/chaincode/update/:id
 * @desc Update the version of the chaincode
 * @access Application Admin
 */
router.post(
  "/update/:id",
  checkToken,
  upload.single("chaincodeFile"),
  async (req, res) => {
    try {
      logger.info("End point: POST /api/fabric/chaincode/update/:id");
      logger.debug(`Username: ${req.decoded.name}`);
      const result = await chaincodeLib.updateChaincode(req);
      logger.debug(
        `The chaincode version update with id ${req.params.id} request result is ${result}`
      );
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_UPDATE_OPERATION,
        msg: result,
      };
      return response.onSuccess(responseData, res);
    } catch (error) {
      logger.error(
        `Failed to update chaincode with id ${req.params.id} for user: ${req.decoded.name} with error ${error.stack}`
      );
      return response.onFailure(error.message, res, 500);
    }
  }
);

/**
 * @route GET /api/fabric/chaincode/
 * @desc Gives the list of chaincode
 * @access Application Admin
 */
router.get("/", checkToken, async (req, res) => {
  try {
    logger.info("End point: GET /api/fabric/chaincode/");
    logger.debug(`Username: ${req.decoded.name}`);
    const chaincodes = await chaincodeLib.getChaincodes(req);
    logger.debug(`The size is chaincode list is ${chaincodes.length}`);
    const responseData = {
      operation: ResponseMsgs.CHAINCODE_FETCH_OPERATION,
      chaincodes: chaincodes,
    };
    return response.onSuccess(responseData, res);
  } catch (error) {
    logger.error(
      `Failed to get the list of chaincode for user: ${req.decoded.name} with error ${error.stack}`
    );
    return response.onFailure(error.message, res, 500);
  }
});
/**
 * @route GET /api/fabric/chaincode/install/:id
 * @desc Installing the chaincode
 * @access Application Admin
 */
router.get("/install/:id", checkToken, async (req, res) => {
  try {
    logger.info("End point: GET /api/fabric/chaincode/install/:id");
    logger.debug(`Username: ${req.decoded.name}`);
    const result = await chaincodeLib.installChaincode(req);
    logger.debug(
      `The chaincode with id ${
        req.params.id
      } installation result is ${JSON.stringify(result)}`
    );
    if (result.success) {
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_INSTALLATION_OPERATION,
        msg: response.message,
      };
      return response.onSuccess(responseData, res);
    } else {
      logger.info("The chaincode installation has failed");
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_INSTALLATION_OPERATION,
        msg: response.message,
      };
      return response.onFailure(responseData, res, 500);
    }
  } catch (error) {
    logger.error(
      `Failed to install chaincode with id ${req.params.id} for user: ${req.decoded.name} with error ${error.stack}`
    );
    return response.onFailure(error.message, res, 500);
  }
});

/**
 * @route POST /api/fabric/chaincode/instantiate/:id
 * @desc Instantiate the chaincode
 * @access Application Admin
 */
router.post("/instantiate/:id", checkToken, async (req, res) => {
  try {
    logger.info("End point: GET /api/fabric/chaincode/instantiate/:id");
    logger.debug(`Username: ${req.decoded.name}`);
    const result = await chaincodeLib.instantiateChaincode(req);
    logger.debug(
      `The chaincode instantiation with id ${
        req.params.id
      } result is ${JSON.stringify(result)}`
    );
    if (result.success) {
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_INSTANTIATE_OPERATION,
        msg: response.message,
      };
      return response.onSuccess(responseData, res);
    } else {
      logger.info("The chaincode instantiation has failed");
      const responseData = {
        operation: ResponseMsgs.CHAINCODE_INSTANTIATE_OPERATION,
        msg: response.message,
      };
      return response.onFailure(responseData, res, 500);
    }
  } catch (error) {
    logger.error(
      `Failed to instantiate chaincode with id ${req.params.id} for user: ${req.decoded.name} with error ${error.stack}`
    );
    return response.onFailure(error.message, res, 500);
  }
});

module.exports = router;
