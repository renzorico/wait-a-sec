/**
 * Zips the dist/ folder into wait-a-sec-chrome.zip for Chrome Web Store upload.
 * Run via: npm run package
 */
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "../dist");
const outputPath = path.join(__dirname, "../wait-a-sec-chrome.zip");

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Packaged: ${outputPath} (${archive.pointer()} bytes)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
