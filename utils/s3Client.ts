import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "AKIAVNX4GFWHCV4H2YWU",
    secretAccessKey: "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",
  },
});

export default s3Client;
