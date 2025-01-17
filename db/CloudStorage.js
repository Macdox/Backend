import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.R2_BUCKET_NAME
const region = process.env.R2_BUCKET_REGION
const accessKeyId = process.env.R2_bucket_ACCESS_ID
const secretAccessKey = process.env.R2_bucket_SECRET_Key
const s3Client = new S3Client({region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });