// Allows browsers on our site to upload files directly to the storage bucket.
// Run once per environment: npx tsx scripts/storage-cors.ts http://localhost:3001 https://your-domain
import { config } from "dotenv";
config({ path: ".env.local" });

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const origins = process.argv.slice(2);
if (origins.length === 0) throw new Error("Pass at least one allowed origin");

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
});

s3.send(
  new PutBucketCorsCommand({
    Bucket: process.env.S3_BUCKET!,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ["PUT", "GET", "HEAD"], AllowedHeaders: ["*"], ExposeHeaders: ["ETag"], MaxAgeSeconds: 3600 }],
    },
  }),
).then(() => console.log("CORS set for", origins.join(", ")));
