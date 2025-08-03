import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { MatchPoolController } from "./matchPool.controller"
const router = express.Router()

router.post(
  "/add",
  auth(UserRole.CLUB_OWNER),
  MatchPoolController.addToMatchPool
)
router.post(
  "/remove",
  auth(UserRole.CLUB_OWNER),
  MatchPoolController.removeFromMatchPool
)
router.post(
  "/generate",
  auth(UserRole.CLUB_OWNER),
  MatchPoolController.generateMatchPool
)

router.get("/", auth(UserRole.CLUB_OWNER), MatchPoolController.getAllMatchPools)

router.get(
  "/:id",
  auth(UserRole.CLUB_OWNER),
  MatchPoolController.getMatchPoolById
)

export const MatchPoolRoutes = router
