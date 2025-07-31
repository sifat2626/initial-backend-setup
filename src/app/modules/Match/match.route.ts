import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { MatchControllers } from "./match.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), MatchControllers.createMatch)
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  MatchControllers.getAllMatchs
)

router.get(
  "/my-club",
  auth(UserRole.CLUB_OWNER),
  MatchControllers.getMyClubMatches
)

router.get("/:id", auth(), MatchControllers.getSingleMatch)
router.patch("/:id", auth(UserRole.CLUB_OWNER), MatchControllers.updateMatch)
router.delete("/:id", auth(UserRole.CLUB_OWNER), MatchControllers.deleteMatch)

router.post(
  "/:id/finish",
  auth(UserRole.CLUB_OWNER),
  MatchControllers.finishMatch
)

export const MatchRoutes = router
