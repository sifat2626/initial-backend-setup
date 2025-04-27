import { uploadImageToSpaces } from "../../utils/uploadImage"

const uploadImages = async (req: any) => {
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new Error("No files uploaded")
  }

  const imageUrls = await Promise.all(
    files.map(async (file) => {
      const imageUrl = await uploadImageToSpaces(file)
      return imageUrl
    })
  )

  return imageUrls
}

export const UploadServices = {
  uploadImages,
}
