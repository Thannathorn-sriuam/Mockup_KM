//utils/extractText.js
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let text = "";

  if (ext === ".txt") {
    text = fs.readFileSync(filePath, "utf-8");
  } else if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else {
    throw new Error("Unsupported file type: " + ext);
  }

  // Save extracted text to .txt file in uploads/
  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(path.dirname(filePath), `${baseName}_extracted.txt`);
  fs.writeFileSync(outputPath, text, "utf-8");

  return text;
};

module.exports = extractText;
