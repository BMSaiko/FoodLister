const fs = require("fs");
function writeLines(p, lines) { fs.writeFileSync(p, lines.join("
"), "utf-8"); console.log("Written: " + p); }

// ======= NAVBAR =======
const nav = [];
const n = (s) => nav.push(s);
