export const MAX_VERIFICATION_DOCUMENT_BYTES = 500 * 1024;

const ACCEPTED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export interface PreparedDocument {
  documentUrl: string;
  documentName: string;
  documentSize: number;
}

export function isAcceptedVerificationDocumentType(mimeType: string): boolean {
  return ACCEPTED.has(mimeType);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We couldn't read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("We couldn't read that image. Please try a different file."));
    img.src = src;
  });
}

function toDataUrl(img: HTMLImageElement, quality: number): string {
  const MAX_DIM = 1600;
  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("We couldn't prepare that image. Please try again.");
  }

  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;

  let padding = 0;
  if (base64.endsWith("==")) padding = 2;
  else if (base64.endsWith("=")) padding = 1;

  return Math.floor((base64.length * 3) / 4) - padding;
}

export async function prepareVerificationDocument(
  file: File,
): Promise<PreparedDocument> {
  if (!isAcceptedVerificationDocumentType(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or PDF file.");
  }
  if (file.size === 0) {
    throw new Error("That file appears to be empty. Please choose another one.");
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_VERIFICATION_DOCUMENT_BYTES) {
      throw new Error("That PDF is larger than 500 KB. Please upload a smaller file.");
    }
    const documentUrl = await readAsDataUrl(file);
    return { documentUrl, documentName: file.name, documentSize: file.size };
  }

  const raw = await readAsDataUrl(file);
  const img = await loadImage(raw);

  for (const quality of [0.82, 0.7, 0.6, 0.5]) {
    const documentUrl = toDataUrl(img, quality);
    const documentSize = dataUrlByteLength(documentUrl);
    if (documentSize <= MAX_VERIFICATION_DOCUMENT_BYTES) {
      return { documentUrl, documentName: file.name, documentSize };
    }
  }

  throw new Error(
    "That image is too large even after compressing. Please upload a smaller photo (max 500 KB).",
  );
}