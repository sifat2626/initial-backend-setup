import express from "express"
import { UploadControllers } from "./upload.controller"
// import { upload } from "../../../helpers/fileUploader"
import { upload } from "../../utils/multer"

const router = express.Router()

router.post(
  "/multiple/images",
  upload.array("images", 20),
  UploadControllers.uploadImages
)

export const UploadRoutes = router
