const httpContext = require("express-http-context"),
  { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
require("dotenv").config();
const fs = require("fs"),
  isEmpty = require("is-empty");
// Create the log directory if it does not exist
if (!fs.existsSync("logfile")) {
  fs.mkdirSync("logfile");
}

//function for writing the module name
const getLabel = (callingModule) => {
  const parts = callingModule.filename.split("/");
  return parts[parts.length - 2] + "/" + parts.pop();
};

//function for getting continuation id format
const continuationIdFormat = format((info, opts) => {
  const reqId = httpContext.get("reqId");
  info.reqId = isEmpty(reqId) === false ? reqId : "non-http-log";
  return info;
});
// instantiate a new Winston Logger with the settings defined above
const logger = (callingModule) => {
  return createLogger({
    transports: [
      new transports.DailyRotateFile({
        level: process.env.LOGGER_LEVEL,
        filename: `logfile/%DATE%-results.log`,
        datePattern: "YYYY-MM-DD",
        format: format.combine(
          format.label({
            label: getLabel(callingModule),
          }),
          format.simple(),
          format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          continuationIdFormat(),
          format.printf(
            (info) =>
              `[Req ID: ${info.reqId}]: ${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
          )
        ),
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        maxDays: "10d",
        colorize: false,
      }), //configuration for the daily log file rotation
      new transports.Console({
        level: process.env.LOGGER_LEVEL,
        format: format.combine(
          format.label({ label: getLabel(callingModule) }),
          format.colorize(),
          format.simple(),
          format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          continuationIdFormat(),
          format.printf(
            (info) =>
              `[Req ID: ${info.reqId}]: ${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
          )
        ),
        handleExceptions: true,
        colorize: true,
      }),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });
};

module.exports = logger;
