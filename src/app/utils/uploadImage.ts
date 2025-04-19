import AWS from "aws-sdk"
import { v4 as uuidv4 } from "uuid"
import config from "../../config"
import httpStatus from "http-status"
import ApiError from "../../errors/ApiErrors"

// Configure AWS SDK
const spacesEndpoint = new AWS.Endpoint(config.DO_SPACES_ENDPOINT as string) // DigitalOcean Spaces Endpoint
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.DO_ACCESS_KEY_ID,
  secretAccessKey: config.DO_SECRET_ACCESS_KEY,
})

export const uploadImageToSpaces = async (
  file: Express.Multer.File
): Promise<string> => {
  const fileKey = `${uuidv4()}-${file.originalname}` // Generate a unique file name

  if (!config.DO_SPACES_BUCKET) {
    throw new Error("DigitalOcean Spaces bucket name is not configured.")
  }

  const params = {
    Bucket: config.DO_SPACES_BUCKET, // Name of your DigitalOcean Space
    Key: fileKey, // File name in the Space
    Body: file.buffer, // File content
    ACL: "public-read", // Make the file publicly readable
  }

  try {
    const data = await s3.upload(params).promise()
    return data.Location // The public URL of the uploaded file
  } catch (error) {
    console.error("Error uploading image to DigitalOcean Spaces:", error)
    throw new Error("Failed to upload image.")
  }
}

export const removeFileFromSpaces = async (fileUrl: string): Promise<void> => {
  // Extract the key (filename) from the file URL

  const urlParts = fileUrl.split("/")

  const fileKey = decodeURIComponent(urlParts[urlParts.length - 1])

  if (!config.DO_SPACES_BUCKET) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "DigitalOcean Spaces bucket name is not configured."
    )
  }

  const params = {
    Bucket: config.DO_SPACES_BUCKET, // Name of your DigitalOcean Space
    Key: fileKey, // File name in the Space
  }

  try {
    await s3.deleteObject(params).promise()
    console.log(
      `File ${fileKey} deleted successfully from DigitalOcean Spaces.`
    )
  } catch (error) {
    console.error("Error deleting file from DigitalOcean Spaces:", error)
    throw new Error("Failed to delete file.")
  }
}
