import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { MatchParticipantControllers } from "./matchParticipant.controller"

const router = express.Router()

router.post(
  "/",
  auth(UserRole.CLUB_OWNER),
  MatchParticipantControllers.createMatchParticipant
)
router.get("/", MatchParticipantControllers.getAllMatchParticipants)
router.get(
  "/my-club",
  auth(UserRole.CLUB_OWNER),
  MatchParticipantControllers.getMyClubMatchParticipants
)
router.get("/:id", MatchParticipantControllers.getSingleMatchParticipant)
router.patch(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  MatchParticipantControllers.updateMatchParticipant
)
router.delete(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  MatchParticipantControllers.deleteMatchParticipant
)

export const MatchParticipantRoutes = router
