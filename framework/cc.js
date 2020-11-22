const path = require("path"),
  fs = require("fs");

exports.createCC = async (req, res) => {
  if (req.body.language === "node") {
    const pathStr = path.dirname(req.file.path) + "/package.json";
    // writePacakgeJson(req.body.name, req.file.originalname, pathStr);
  }
  const file = fs.readFileSync(req.file.path);

  res.json({ file: file, body: req.file });
};
