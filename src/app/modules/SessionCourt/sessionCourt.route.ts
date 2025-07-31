import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { SessionCourtControllers } from "./sessionCourt.controller"

const router = express.Router()

router.post(
  "/",
  auth(UserRole.CLUB_OWNER),
  SessionCourtControllers.createSessionCourt
)
router.get(
  "/",
  auth(UserRole.CLUB_OWNER),
  SessionCourtControllers.getAllSessionCourts
)

router.get(
  "/available/:sessionId",
  auth(UserRole.CLUB_OWNER),
  SessionCourtControllers.getAvaiableCourtsForSession
)
router.get("/:id", SessionCourtControllers.getSingleSessionCourt)
router.patch(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionCourtControllers.updateSessionCourt
)
router.delete(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionCourtControllers.deleteSessionCourt
)

export const SessionCourtRoutes = router
