import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// *!register user
router.post(
  "/register",
  userController.createUser
);
// *!get all  user
router.get("/", userController.getUsers);

// *!profile user
router.put(
  "/profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
  userController.updateProfile
);

// *!update  user
router.put("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.updateUser);

export const userRoutes = router;
