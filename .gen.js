const fs = require("fs");
const lines = [];
const p = (s) => lines.push(s);
p("export default Navbar;");
fs.writeFileSync("C:/Users/bruno/Documents/Second-Brain/knowledge/projects/foodlister/code/test_gen.txt", lines.join("\n"), "utf-8");
console.log("done");
