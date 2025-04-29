import ApiError from "../../../errors/ApiErrors"
import { uploadImageToSpaces } from "../../utils/uploadImage"

const uploadImages = async (req: any) => {
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new Error("No files uploaded")
  }

  const imageUrls = await Promise.all(
    files.map(async (file) => {
      if (!file.mimetype.startsWith("image/")) {
        throw new ApiError(400, "File is not an image")
      }
      const imageUrl = await uploadImageToSpaces(file)
      return imageUrl
    })
  )

  return imageUrls
}

export const UploadServices = {
  uploadImages,
}
