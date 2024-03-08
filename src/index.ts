import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { createReadStream, createWriteStream } from "fs";

type Credentials = {
  key: string;
  secret: string;
  region: string;
};

type options = {
  defaultBucket?: string;
};

export class SimpleAWS {
  s3Client: S3Client;
  defaultBucket: string | null;

  constructor(credentials: Credentials, options?: options) {
    if (!credentials.key || !credentials.secret || !credentials.region) {
      throw new Error(
        "S3 key, secret and region are all required when constructing a simple AWS instance"
      );
    }
    this.s3Client = new S3Client({
      region: credentials.key,
      credentials: {
        secretAccessKey: credentials.secret,
        accessKeyId: credentials.key,
      },
    });
    this.defaultBucket = options?.defaultBucket || null;
  }

  async uploadFileFromURL({
    url,
    key,
    localPath,
    bucket,
  }: {
    url: string;
    key: string;
    localPath?: string;
    bucket?: string;
  }) {
    const response = await fetch(url);

    if (localPath) {
      // Save file to local and upload to S3
      const body = response.body;
      const path = localPath;
      const localFile = createWriteStream(path);
      const fileStream = new WritableStream({
        write(chunk) {
          localFile.write(chunk);
        },
      });
      await body?.pipeTo(fileStream);

      localFile.end();
      const vm = this;
      const result = await new Promise((res, rej) => {
        localFile.on("finish", async () => {
          // console.log("Local file finished!");
          const result = await vm.uploadFileFromPath({ path, key, bucket });
          res(result);
        });
        localFile.on("error", (e) => {
          rej(e);
        });
      });

      return result;
    } else {
      // only upload to S3
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const putToS3 = new PutObjectCommand({
        Bucket: this._getBucket(bucket),
        Key: key,
        Body: buffer,
      });
      const result = await this.s3Client.send(putToS3);

      return result;
    }
  }

  async uploadFileFromPath({
    path,
    key,
    bucket,
  }: {
    path: string;
    key: string;
    bucket?: string;
  }) {
    const putToS3 = new PutObjectCommand({
      Bucket: this._getBucket(bucket),
      Key: key,
      Body: createReadStream(path),
    });
    const result = await this.s3Client.send(putToS3);

    return result;
  }

  async downloadFileTo({
    key,
    path,
    bucket,
  }: {
    key: string;
    path: string;
    bucket?: string;
  }) {
    const command = new GetObjectCommand({
      Bucket: this._getBucket(bucket),
      Key: key,
    });
    const item = await this.s3Client.send(command);
    const file = createWriteStream(path);
    const fileStream = new WritableStream({
      write(chunk) {
        file.write(chunk);
      },
    });
    await item.Body?.transformToWebStream().pipeTo(fileStream);

    file.end();

    const result = await new Promise((res, rej) => {
      file.on("finish", async (result: any) => {
        // console.log("Download file finished");
        res(result);
      });

      file.on("error", (e) => {
        rej(e);
      });
    });

    return result;
  }

  async listFiles(bucket?: string) {
    const command = new ListObjectsCommand({
      Bucket: this._getBucket(bucket),
    });
    const { Contents } = await this.s3Client.send(command);
    // const contentsList = Contents?.map((c) => ` • ${c.Key}`).join("\n");
    // console.log("\nHere's a list of files in the bucket:");
    // console.log(contentsList + "\n");
    return Contents;
  }

  _getBucket(bucket?: string) {
    if (bucket) return bucket;
    if (this.defaultBucket) return this.defaultBucket;
    throw new Error("Please specify a bucket or set a default bucket");
  }
}

export default SimpleAWS;
