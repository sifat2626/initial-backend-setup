import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { sessionQueueController } from "./sessionQueue.controller"
const router = express.Router()

router.get(
  "/",
  auth(UserRole.CLUB_OWNER),
  sessionQueueController.getSessionQueueBySessionId
)

export const SessionQueueRoutes = router
