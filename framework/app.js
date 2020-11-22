const express = require("express"),
  mongoose = require("mongoose"),
  logger = require("./logger/advlogger")(module),
  { v4: uuidv4, v4 } = require("uuid"),
  httpContext = require("express-http-context"),
  swaggerUi = require("swagger-ui-express"),
  swaggerJSDoc = require("swagger-jsdoc");

const app = express();

const chaincodeManagementRoutes = require("./routes/api/fabric/chaincodeManagement");
//swagger config
var swaggerDefinition = {
  info: {
    title: "Blockchain Sandbox API",
    version: "1.0.0",
    description:
      "Sandbox api for Node Provisiong, User Management and Usecase Management",
  },
  host: process.env.SWAGGER_HOST,
  basePath: "/",
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      scheme: "bearer",
      in: "header",
    },
  },
};

const swaggerJSDocOptions = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    "./routes/api/*.js",
    "./routes/api/auth/*.js",
    "./routes/api/ethereum/*.js",
    "./routes/api/fabric/*.js",
    "./routes/api/gateway/*.js",
    "./models/*.js",
  ],
  validatorUrl: null,
};

const swaggerSpec = swaggerJSDoc(swaggerJSDocOptions);
const docsJsonPath = "/swagger.json";
const swaggerUiHandler = swaggerUi.setup(swaggerSpec);
app.get(docsJsonPath, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, (req, res, next) => {
  swaggerUiHandler(req, res, next);
});
//winston and morgan configuration
app.use(httpContext.middleware);
// Run the context for each request. Assign a unique identifier to each request
app.use((req, res, next) => {
  httpContext.set("reqId", v4());
  next();
});
var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//
//DB Configuration
const options = {
  autoIndex: false, // Don't build indexes
  // reconnectTries: 30, // Retry up to 30 times
  // reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const connectWithRetry = () => {
  logger.info("MongoDB connection with retry");
  mongoose
    .connect(process.env.MONGODB_URI, options)
    .then(() => {
      logger.info("MongoDB is connected");
    })
    .catch((err) => {
      logger.info("MongoDB connection unsuccessful, retry after 5 seconds.");
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

//to suppress the deprecated warning during fineOneAndUpdate() method
mongoose.set("useFindAndModify", false);
//to suppress the warning of ensureIndex is deprecated
mongoose.set("useCreateIndex", true);
//to use the new Server Discover and Monitoring Engine
mongoose.set("useUnifiedTopology", true);

app.use("/api/fabric/chaincode", chaincodeManagementRoutes);

app.listen(process.env.SERVER_PORT, () =>
  logger.debug(
    `PwC Blockchain Infra app listening on port ${process.env.SERVER_PORT}`
  )
);
const cc = require("./cc");

var fs = require("fs"),
  path = require("path"),
  multer = require("multer"),
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let dir = "";
      console.log("resdsdsdasd");
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
        console.log(dir);
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
  upload = multer({ storage: storage });

app.post("/cc", upload.single("chaincodeFile"), cc.createCC);
