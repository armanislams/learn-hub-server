const fs = require("fs");
const key = fs.readFileSync("./learn-hub.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
(base64);
