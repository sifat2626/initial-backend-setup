import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"
import { IUser, IUserFilterRequest } from "./user.interface"
import * as bcrypt from "bcrypt"
import { IPaginationOptions } from "../../../interfaces/paginations"
import { paginationHelper } from "../../../helpers/paginationHelper"
import { Prisma, User, UserRole, UserStatus } from "@prisma/client"
import { userSearchAbleFields } from "./user.costant"
import config from "../../../config"
import httpStatus from "http-status"

// Create a new user in the database.
const createUserIntoDb = async (payload: User) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  })

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`
      )
    }
  }
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  )

  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return result
}

// reterive all users from the database also searcing anf filetering
const getUsersFromDb = async (query: any) => {
  const { page = 1, limit = 10 } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  const totalUsers = await prisma.user.count({
    where: whereConditions,
  })

  const users = await prisma.user.findMany({
    where: whereConditions,
    skip: skip,
    take: take,
    orderBy: {
      createdAt: "desc",
    },
  })

  return {
    meta: {
      page,
      limit,
      total: totalUsers,
    },
    data: users,
  }
}

// update profile by user won profile uisng token or email and id
const updateProfile = async (user: IUser, payload: User) => {
  const userInfo = await prisma.user.findUnique({
    where: {
      email: user.email,
      id: user.id,
    },
  })

  if (!userInfo) {
    throw new ApiError(404, "User not found")
  }

  // Update the user profile with the new information
  const result = await prisma.user.update({
    where: {
      email: userInfo.email,
    },
    data: {
      name: payload.name || userInfo.name,
      email: payload.email || userInfo.email,
      profileImage: payload.profileImage || userInfo.profileImage,
      phoneNumber: payload.phoneNumber || userInfo.phoneNumber,
    },
    select: {
      id: true,
      name: true,

      email: true,
      profileImage: true,
      phoneNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    )

  return result
}

// update user data into database by id fir admin
const updateUserIntoDb = async (payload: IUser, id: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
  })
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id)

  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    )

  return result
}

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  updateProfile,
  updateUserIntoDb,
}
