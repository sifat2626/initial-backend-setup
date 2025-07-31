import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { SessionControllers } from "./session.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), SessionControllers.createSession)
router.get("/", SessionControllers.getAllSessions)
router.get(
  "/my-club",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.getMyClubSessions
)
router.get("/:id", auth(), SessionControllers.getSingleSession)
router.patch(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.updateSession
)
router.delete(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  SessionControllers.deleteSession
)

export const SessionRoutes = router
