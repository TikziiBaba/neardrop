import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const isR2Configured = () => {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
};

export const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Prevent AWS SDK v3 from automatically calculating empty checksums (CRC32)
    // for presigned PUT URLs, which causes Cloudflare R2 to reject browser uploads.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
};

export async function createPresignedUploadUrl(
  r2ObjectKey: string,
  _contentType?: string,
  _contentLength?: number,
  expiresInSeconds = 10800
) {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "neardrop";

  // Note: We omit ContentLength and ContentType from PutObjectCommand so AWS SDK does not sign
  // them in X-Amz-SignedHeaders, preventing SignatureDoesNotMatch errors during direct browser
  // uploads of diverse file types (such as .jar, .mca, archives, and custom binaries).
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2ObjectKey,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function createPresignedDownloadUrl(
  r2ObjectKey: string,
  filename: string,
  expiresInSeconds = 900
) {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "neardrop";
  const downloadName = filename.split("/").pop() || filename;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: r2ObjectKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(downloadName)}"`,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function createPresignedPreviewUrl(
  r2ObjectKey: string,
  filename: string,
  contentType: string,
  expiresInSeconds = 900
) {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "neardrop";
  const displayName = filename.split("/").pop() || filename;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: r2ObjectKey,
    ResponseContentDisposition: `inline; filename="${encodeURIComponent(displayName)}"`,
    ResponseContentType: contentType || "application/octet-stream",
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function uploadR2Buffer(
  r2ObjectKey: string,
  buffer: Buffer,
  contentType: string
) {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "neardrop";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2ObjectKey,
    Body: buffer,
    ContentType: contentType || "image/png",
  });

  return await s3.send(command);
}

export async function deleteR2Object(r2ObjectKey: string) {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "neardrop";

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: r2ObjectKey,
  });

  return await s3.send(command);
}
