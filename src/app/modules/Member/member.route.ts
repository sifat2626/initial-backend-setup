import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { MemberControllers } from "./member.controller"

const router = express.Router()

router.post("/", auth(UserRole.CLUB_OWNER), MemberControllers.createMember)
router.get("/", auth(), MemberControllers.getAllMembers)
router.get("/:id", auth(), MemberControllers.getSingleMember)
router.patch("/:id", auth(UserRole.CLUB_OWNER), MemberControllers.updateMember)
router.delete("/:id", auth(UserRole.CLUB_OWNER), MemberControllers.deleteMember)

export const MemberRoutes = router
