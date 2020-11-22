const bcrypt = require("bcryptjs"),
  crypto = require("crypto"),
  fs = require("fs");

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Desc: For encrypting string with help of bcrypt package
 * @param {object} str
 * @returns {response string}
 */
const encryptString = async (str) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(str, salt);
  } catch (error) {
    throw error;
  }
};

/**
 * Desc: Compare the two encrypted string
 * @param {object} text
 * @param {object} hash
 * @returns {response boolean}
 */
const compareString = async (text, hash) => {
  try {
    return await bcrypt.compare(text, hash);
  } catch (error) {
    throw error;
  }
};

/**
 * Desc: Hash the String
 * @param {object} text
 * @returns {response string}
 */
const hashString = (text) => {
  try {
    return crypto.createHash("sha1").update(text).digest("base64");
  } catch (error) {
    throw error;
  }
};

/**
 * Desc: Generates the random no between the range
 * @param {Number} max
 * @param {Number} min
 * @returns {response string}
 */
const randomNumber = (max, min) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Desc: Generates package.json for nodejs chaincode
 * @param {string} name
 * @param {string} fileName
 * @param {string} path
 * @returns {response string}
 */
const writePacakgeJson = (name, fileName, path) => {
  const packageJson = {
    name: name,
    version: "1.0.0",
    description: `node-js version of ${name} chaincode`,
    engines: {
      node: ">=8.4.0",
      npm: ">=5.3.0",
    },
    scripts: { start: `node ${fileName}` },
    "engine-strict": true,
    license: "Apache-2.0",
    dependencies: {
      "fabric-shim": "~1.4.0",
    },
  };

  const packageStr = JSON.stringify(packageJson);
  fs.writeFileSync(path, packageStr);
};

module.exports = {
  randomString,
  encryptString,
  compareString,
  hashString,
  randomNumber,
  writePacakgeJson,
};
