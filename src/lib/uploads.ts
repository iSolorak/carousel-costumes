import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB

export function getUploadsDir() {
  const dir = process.env.UPLOADS_DIR ?? "./uploads";
  return path.isAbsolute(dir)
    ? dir
    : path.join(/* turbopackIgnore: true */ process.cwd(), dir);
}

export async function saveUpload(file: File): Promise<string> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 12MB).");
  }

  const dir = getUploadsDir();
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ dir, filename), buffer);

  return filename;
}

export async function deleteUpload(filename: string) {
  if (!filename) return;
  const dir = getUploadsDir();
  const safeName = path.basename(filename);
  try {
    await unlink(path.join(dir, safeName));
  } catch {
    // already gone — nothing to do
  }
}

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export function contentTypeForFilename(filename: string) {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return EXTENSION_CONTENT_TYPES[ext] ?? "application/octet-stream";
}
