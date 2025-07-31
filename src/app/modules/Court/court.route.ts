import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { CourtControllers } from "./court.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), CourtControllers.createCourt)
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CourtControllers.getAllCourts
)
router.get(
  "/my-club",
  auth(UserRole.CLUB_OWNER),
  CourtControllers.getMyClubCourts
)
router.get("/:id", auth(), CourtControllers.getSingleCourt)
router.patch("/:id", auth(UserRole.CLUB_OWNER), CourtControllers.updateCourt)
router.delete("/:id", auth(UserRole.CLUB_OWNER), CourtControllers.deleteCourt)

export const CourtRoutes = router
