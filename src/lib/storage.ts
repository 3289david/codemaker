// 업로드 파일은 public/ 밖의 uploads/ 디렉터리에 저장하고,
// 다운로드는 항상 소유권을 검증하는 라우트 핸들러를 통해서만 내려준다.
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export type UploadKind = "references" | "attachments" | "deliverables" | "messages" | "revisions" | "reviews" | "portfolio";

export async function saveUploadedFile(file: File, kind: UploadKind): Promise<{ key: string; name: string; size: number }> {
  const ext = path.extname(file.name) || "";
  const key = `${kind}/${randomUUID()}${ext}`;
  const fullPath = path.join(UPLOAD_ROOT, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);
  return { key, name: file.name, size: buffer.length };
}

export function resolveUploadPath(key: string): string {
  const normalized = path.normalize(key).replace(/^([.]{2}[/\\])+/, "");
  return path.join(UPLOAD_ROOT, normalized);
}

export async function readUploadedFile(key: string): Promise<Buffer> {
  return fs.readFile(resolveUploadPath(key));
}

export function guessContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".txt": "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

export function isImageFile(fileName: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);
}
