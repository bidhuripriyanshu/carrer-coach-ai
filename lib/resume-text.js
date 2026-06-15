const MAX_FILE_SIZE = 2 * 1024 * 1024;

async function extractTextFromPdf(buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return (data?.text || "").trim();
}

export async function extractResumeTextFromFile(file) {
  if (!file || !(file instanceof File)) {
    throw new Error("Please upload a resume file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be under 2MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";

  if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
    return await extractTextFromPdf(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  throw new Error("Unsupported file type. Use PDF or DOCX only.");
}

export function stripMarkdown(text) {
  return (text || "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`+/g, "")
    .trim();
}
