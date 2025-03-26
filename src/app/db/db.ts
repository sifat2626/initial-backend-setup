import { UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";

export const initiateSuperAdmin = async () => {
  const payload: any = {
    name: "Super",
    email: "admin@gmail.com",
    phoneNumber: "1234567890",
    password: "12345678",
    role: UserRole.SUPER_ADMIN,
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });


  const hashedPassword = await bcrypt.hash(payload.password, 12);
  payload.password = hashedPassword;

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};
