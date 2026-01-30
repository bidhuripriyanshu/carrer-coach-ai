/**
 * One-off script to verify a PDF works with the ATS system.
 * Usage: node scripts/check-pdf.js "C:\path\to\resume.pdf"
 */

const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_TEXT_LENGTH = 20;

async function main() {
  const pdfPath = process.argv[2] || "C:\\Users\\ASUS\\Downloads\\resume-priyanshu (1).pdf";
  const resolved = path.resolve(pdfPath);

  console.log("Checking:", resolved);
  console.log("---");

  if (!fs.existsSync(resolved)) {
    console.error("ERROR: File not found.");
    process.exit(1);
  }

  const stat = fs.statSync(resolved);
  const size = stat.size;
  const sizeOK = size <= MAX_FILE_SIZE;

  console.log("1. File type: .pdf");
  console.log("2. File size:", (size / 1024).toFixed(1), "KB", sizeOK ? "(OK, under 2MB)" : "(FAIL: over 2MB)");

  if (!resolved.toLowerCase().endsWith(".pdf")) {
    console.error("ERROR: Only PDF and DOCX are allowed.");
    process.exit(1);
  }

  let pdfParse;
  try {
    pdfParse = require("pdf-parse");
  } catch (e) {
    console.error("ERROR: pdf-parse not installed. Run: npm install pdf-parse");
    process.exit(1);
  }

  const buffer = fs.readFileSync(resolved);
  let text = "";

  try {
    const data = await pdfParse(buffer);
    text = (data?.text || "").trim();
  } catch (e) {
    console.error("ERROR: Could not extract text from PDF:", e?.message || e);
    process.exit(1);
  }

  const textOK = text.length >= MIN_TEXT_LENGTH;
  console.log("3. Text extraction:", textOK ? "OK" : "FAIL (too short or image-only PDF)");
  console.log("   Extracted length:", text.length, "characters");
  if (text.length > 0 && text.length <= 200) {
    console.log("   Preview:", text.slice(0, 150) + (text.length > 150 ? "..." : ""));
  } else if (text.length > 200) {
    console.log("   Preview:", text.slice(0, 150) + "...");
  }

  console.log("---");
  if (sizeOK && textOK) {
    console.log("Result: Your resume is compatible with the ATS system. You can upload it on the ATS page.");
  } else {
    console.log("Result: Fix the issues above (size or text extraction) for the resume to work.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
