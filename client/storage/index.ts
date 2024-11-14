import { type UploadResponse, type DeleteResponse } from '@packages/types';
import { axiosInstance } from '../utils/axiosConfig.ts';

/**
 * Use the storage API to upload an image to our Azure Blob Storage Account
 *
 * Client-side only (`File` is a browser construct unavailable in NodeJS)
 * @param file Native browser file interface taken directly from input type file `files` property
 * @returns `success` boolean property; if successful the public `url` to the image, if not an error `message`
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<UploadResponse>('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false,
    };
  }
}

/**
 * Use the storage API to delete an image from our Azure Blob Storage Account
 * @param imageName the file name of the image to be deleted. Do not include the whole URL
 * @returns `success` boolean property; failure state includes an error `message` and optional `response` from Azure
 */
export async function deleteImage(imageName: string): Promise<DeleteResponse> {
  try {
    const response = await axiosInstance.post<DeleteResponse>('/storage/delete', {
      name: imageName,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false,
    };
  }
}
