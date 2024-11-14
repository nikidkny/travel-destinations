import {
  type BlobDeleteResponse,
  BlobServiceClient,
  type BlockBlobUploadResponse,
  type ContainerClient,
} from '@azure/storage-blob';
import path from 'path';
import { nanoid } from 'nanoid';

const { BLOB_STORAGE_CONNECTION_STRING } = process.env;

if (BLOB_STORAGE_CONNECTION_STRING == null) {
  throw new Error('Blob Storage connection string is not defined');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_STORAGE_CONNECTION_STRING);

/**
 * Gets an existing container within the Azure Blob Storage Account resource
 *
 * To keep school project contained this is limited to just one container
 *
 * Server-side only
 * @returns Container client if successful, null if error
 */
async function getContainerClient(): Promise<ContainerClient | null> {
  try {
    const containerClient = blobServiceClient.getContainerClient('container');

    if (await containerClient.exists()) {
      return containerClient;
    }

    console.error('Container not found');
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type CreateBlobArgs = {
  blob: Blob | Buffer;
  blobName: string;
  blobMimeType?: string;
};

type CreateBlobResponse =
  | {
      status: 'success';
      response: BlockBlobUploadResponse;
      name: string;
      url: string;
    }
  | {
      status: 'error';
      message: string;
      response?: BlockBlobUploadResponse;
    };

/**
 * Upload a blob to an Azure Storage Account container server-side
 *
 * Azure overrides blobs with the same name on upload. Random characters will be added to the name
 * of the blob to ensure no data loss occurs
 *
 * For that reason, you should not assume that the passed `args.blobName` will necessarily match the
 * result; use the response `name` or `url` instead
 * @param args.blob `Blob` or `Buffer` item to be uploaded
 * @param args.blobName name of the blob to be uploaded including the file extension
 * @param args.blobMimeType optional MIME type which will override the Azure default `application/octet-stream`. Not strictly required. Use this for `Buffer`; for `Blob` make sure its `type` property is defined and accurate
 * @returns a `CreateBlobResponse` which may container either an error or a success response including the name and url of the resource
 */
export async function createBlob(args: CreateBlobArgs): Promise<CreateBlobResponse> {
  try {
    const { blob, blobName, blobMimeType } = args;

    const containerClient = await getContainerClient();
    if (containerClient == null || !(await containerClient.exists())) {
      console.error(`Failed to create container client`);
      return {
        status: 'error',
        message: `Failed to create container client`,
      };
    }

    let uniqueName = blobName;
    while (await containerClient.getBlockBlobClient(uniqueName).exists()) {
      uniqueName = `${path.parse(uniqueName).name}_${nanoid(4)}${path.parse(uniqueName).ext}`;
    }

    const isBuffer = Buffer.isBuffer(blob);
    const valueToUpload = isBuffer ? blob : Buffer.from(await blob.arrayBuffer());
    const mimeType = blobMimeType != null ? blobMimeType : isBuffer ? null : blob.type;
    const size = isBuffer ? blob.byteLength : blob.size;

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    const upload = await blockBlobClient.upload(valueToUpload, size, {
      ...(mimeType != null && {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      }),
    });

    if (upload.errorCode != null) {
      console.error(`Upload failed: ${upload}`);
      return {
        status: 'error',
        message: `Failed to upload ${uniqueName} with error code ${upload.errorCode}`,
        response: upload,
      };
    }

    return {
      status: 'success',
      response: upload,
      name: blockBlobClient.name,
      url: blockBlobClient.url,
    };
  } catch (e) {
    console.error(e);
    return {
      status: 'error',
      message: e,
    };
  }
}

/**
 * Delete a blob from the Azure Storage Account container
 *
 * For the purpose of this project no soft-deletion is handled
 *
 * Server-side only
 * @param blobName Name of the blob to be deleted
 * @returns a BlobDeleteResponse or null in case of hard failure
 */
export async function deleteBlob(blobName: string): Promise<BlobDeleteResponse | null> {
  try {
    const containerClient = await getContainerClient();
    if (containerClient == null || !(await containerClient.exists())) {
      console.error(`Container not found`);
      return null;
    }
    return await containerClient.deleteBlob(blobName);
  } catch (error) {
    console.error(error);
    return null;
  }
}
