/**
 * Document parsing — extracts plain text from uploaded PDFs and DOCX files.
 *
 * Output is the canonical text representation the reviewing agents read.
 * We retain:
 *   - `text`       — full extracted text (used by Research Support / Professional Editor)
 *   - `excerpt`    — first ~1,500 characters (used by Lead Intake to classify the paper)
 *   - `wordCount`  — used for billing tier checks and submission readiness scoring
 *   - `pageCount`  — informational; preserved on the job ledger
 *   - `kind`       — "pdf" | "docx"
 */

export type DocumentKind = "pdf" | "docx";

export interface ParsedDocument {
  kind: DocumentKind;
  text: string;
  excerpt: string;
  wordCount: number;
  pageCount: number;
  rawLength: number;
}

const EXCERPT_LEN = 1500;

export async function parseDocument(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdf(buffer);
  if (lower.endsWith(".docx")) return parseDocx(buffer);
  throw new Error(`Unsupported document: ${filename}. Only .pdf and .docx are accepted.`);
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  // pdf-parse@2 exposes a PDFParse class (no default export). Dynamic import
  // keeps the heavy PDF.js init out of the cold path until a PDF arrives.
  const { PDFParse } = (await import("pdf-parse")) as {
    PDFParse: new (opts: { data: Buffer | Uint8Array }) => {
      getText(): Promise<{ text: string; numpages?: number; pages?: unknown[] }>;
    };
  };
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const text = normalise(result.text);
  const pageCount = result.numpages ?? result.pages?.length ?? 0;
  return {
    kind: "pdf",
    text,
    excerpt: text.slice(0, EXCERPT_LEN),
    wordCount: wordCountOf(text),
    pageCount,
    rawLength: result.text.length
  };
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const text = normalise(result.value);
  return {
    kind: "docx",
    text,
    excerpt: text.slice(0, EXCERPT_LEN),
    wordCount: wordCountOf(text),
    // DOCX has no inherent "page count"; approximate at ~280 words/page so
    // billing tiers and progress estimates have a credible number.
    pageCount: Math.max(1, Math.ceil(wordCountOf(text) / 280)),
    rawLength: result.value.length
  };
}

function normalise(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wordCountOf(s: string): number {
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
}
