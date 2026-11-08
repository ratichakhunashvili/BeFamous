// File storage (Neon Object Storage, S3-compatible). Server only.
// Browsers upload straight to storage with a short-lived presigned URL, so large videos
// never pass through our server; we only store the object key in the database.
import "server-only";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET!;

const globalForS3 = globalThis as unknown as { s3?: S3Client };
const s3 =
  globalForS3.s3 ??
  new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    forcePathStyle: true, // Neon storage only supports path-style URLs
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
  });
if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;

export const UPLOAD_LIMITS = {
  maxBytes: 200 * 1024 * 1024, // 200 MB
  types: ["video/mp4", "video/quicktime", "image/jpeg", "image/png", "image/webp"],
};

/** URL the browser can PUT the file to for the next 10 minutes. */
export function presignUpload(key: string, contentType: string) {
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), { expiresIn: 600 });
}

/** URL to view a private file for the next hour. */
export function presignDownload(key: string) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
}

/** Size and type of an uploaded object, or null if it doesn't exist. */
export async function headObject(key: string) {
  try {
    const r = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { size: r.ContentLength ?? 0, contentType: r.ContentType ?? "" };
  } catch {
    return null;
  }
}
