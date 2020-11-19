var hfc = require("fabric-client");
var helper = require("./helper.js");
var logger = helper.getLogger("Revoke");
hfc.setLogger(logger);

var revoke = async function (req, res) {
  let username = req.body.username;
  let userOrg = req.body.userOrg;
  let reason = req.body.reason || "Malicious Activity";
  var client = await helper.getClientForOrg(userOrg, username);
  var admins = hfc.getConfigSetting("admins");
  let adminUserObj = await client.setUserContext({
    username: admins[0].username,
    password: admins[0].secret,
  });
  console.log("1");
  let caClient = client.getCertificateAuthority();
  let request = {
    enrollmentID: username,
    reason: reason,
    serial: "85430329754815031980552012711518507950267240827",
  };

  let user = await client.getUserContext(username, true);
  var revoke = await caClient.revoke(request, adminUserObj);

  var gencrl = await caClient.generateCRL(
    { revokedBefore: new Date() },
    adminUserObj
  );

  res.send({ revoke, gencrl });
};

exports.revoke = revoke;
