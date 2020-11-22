const Response = function() {};

/**
 * Desc: All success responses will be processed using this function
 * @param {type} data
 * @param {type} res ,response object
 * @param {type} statusCode, response status code needs to be sent
 * @param {type} format , response format
 * @returns {response json object}
 */

Response.onSuccess = (data, res, statusCode = 200, format = "json") => {
  const message = {};
  message.status = "Success";
  message.data = data;
  return res.status(statusCode).json(message);
};

/**
 * Desc: All failure responses will be processed using this function
 * @param {type} data
 * @param {type} res
 * @param {type} statusCode
 * @param {type} format
 * @returns {unresolved}
 */
Response.onFailure = (data, res, statusCode = 500, format = "json") => {
  const message = {};
  message.status = "Error";
  message.data = data;
  return res.status(statusCode).json(message);
};

/**
 * Desc: All Validation failure responses will be processed using this function
 * @param {type} data
 * @param {type} res
 * @param {type} statusCode
 * @param {type} format
 * @returns {unresolved}
 */
Response.onValidationFailure = (
  data,
  res,
  statusCode = 400,
  format = "json"
) => {
  const message = {};
  message.message = data;
  message.status = "Validation Failure";
  return res.status(statusCode).json(message);
};

module.exports = Response;
