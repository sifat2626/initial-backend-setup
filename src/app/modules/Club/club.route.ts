import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { ClubControllers } from "./club.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), ClubControllers.createClub)
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ClubControllers.getAllClubs
)

router.get("/my-club", auth(UserRole.CLUB_OWNER), ClubControllers.getMyClub)

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ClubControllers.getSingleClub
)
router.patch("/:id", auth(UserRole.CLUB_OWNER), ClubControllers.updateClub)
router.delete("/:id", auth(UserRole.CLUB_OWNER), ClubControllers.deleteClub)

export const ClubRoutes = router
