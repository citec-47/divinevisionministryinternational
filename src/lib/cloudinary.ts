import "server-only";

import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary, used only for images staff upload through the admin.
 *
 * Uploads go straight from the browser to Cloudinary rather than through this
 * server: a pastor on a Yaoundé mobile connection should not have to push a
 * 4 MB photo through our serverless function and then back out again. We only
 * sign the request, which is why the API secret never leaves the server.
 */
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const CLOUDINARY_FOLDER = "divine-vision";

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

export type UploadTicket = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/**
 * Signs a single upload. The signature covers the folder and timestamp, so a
 * leaked ticket cannot be replayed into a different folder or used for long.
 */
export function createUploadTicket(): UploadTicket {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: CLOUDINARY_FOLDER },
    API_SECRET,
  );

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    folder: CLOUDINARY_FOLDER,
    signature,
  };
}
