import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import {getEnv} from "../config";
import {logger} from "../logger";

const s3Client = new S3Client({
  region: getEnv("AWS_S3_BUCKET_REGION"),
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

export async function uploadFile(filename: string, content: string): Promise<void> {
  const uploadParams = {
    Bucket: getEnv("AWS_S3_BUCKET_NAME"),
    Key: filename,
    Body: content,
  };
  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    logger.info(`${filename} susccessfuly uploaded to S3`)
  } catch (err) {
    logger.debug('Error uploading file:', err);
  }
}