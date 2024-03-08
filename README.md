# simple-AWS

A simple wrapper around AWS S3 client for common use cases.

## Documentation

- [Installation](#installation)
- [Usage](#usage)
  - [Initialize](#initialize)
  - [Upload file from a URL](#upload-file-from-a-URL)
  - [Upload file at local path](#upload-file-at-local-path)
  - [Download file to local path](#download-file-to-local-path)

## Installation

This package has a peer dependency with `@aws-sdk/client-s3: 3.x`. Please make sure your aws client version meet the requirement.

```shell
npm install @xsfish/simple-s3
```

## Usage

### Initialize

AWS S3 key, secret and region must be provided to create a SimpleAWS instance.

```js
import SimpleAWS from '@xsfish/simple-s3';

const s3client = new SimpleAWS({
  key: 'S3-key';
  secret: 'S3-secret';
  region: 'S3-region';
})
```

You can also provide a default bucket on the second argument when creating a SimpleAWS instance.

```js
import SimpleAWS from '@xsfish/simple-s3';

const s3client = new SimpleAWS({
  key: 'S3-key';
  secret: 'S3-secret';
  region: 'S3-region';
}, {
  defaultBucket: 'default-S3-bucket-name'
})
```

### Upload file from a URL

Download the file from a URL and upload it to S3.

```js
await s3client.uploadFileFromURL({
  url: "https://example.com/path-to-file", // URL of the file
  key: "s3-file-key", // the s3 key you want to save for the uploaded file
  localPath: "path/to/save/file", // [Optional] if provided, will also save a copy of the file to the specified path
  bucket: "s3-bucket", // [Optional] if provided, will use this bucket instead of the default bucket.
});
```

### Upload file at local path

Upload a file at a local path.

```js
await s3client.uploadFileFromPath({
  path: "path/to/file", // The path of the file you want to upload
  key: "s3-file-key", // the s3 key you want to save for the uploaded file
  bucket: "s3-bucket", // [Optional] if provided, will use this bucket instead of the default bucket.
});
```

### Download file to local path

Download a S3 file to a local path.

```js
await s3client.downloadFileTo({
  key: "s3-file-key", // the s3 key of the file you want to download
  path: "path/to/save/file", // The path you want to save the file
  bucket: "s3-bucket", // [Optional] if provided, will use this bucket instead of the default bucket.
});
```
