import { Club } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"
import { removeFileFromSpaces } from "../../utils/uploadImage"

const createClub = async (payload: Club) => {
  const { ownerId } = payload

  const existingClub = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (existingClub) {
    throw new ApiError(400, "Club already exists for this owner")
  }

  if (!ownerId) {
    throw new ApiError(400, "Owner ID is required to create a club")
  }

  const club = await prisma.club.create({
    data: payload,
  })
  return club
}

const getAllClubs = async (query: any) => {
  const { page = 1, limit = 10, ownerId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (ownerId) {
    whereConditions.ownerId = ownerId
  }

  const totalCount = await prisma.club.count({
    where: whereConditions,
  })

  const clubs = await prisma.club.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      owner: true,
      Member: true,
      Court: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: clubs,
  }
}

const getSingleClub = async (id: string) => {
  const club = await prisma.club.findUnique({
    where: {
      id,
    },
    include: {
      owner: true,
      Member: true,
      Court: true,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found")
  }

  return club
}

const updateClub = async (id: string, payload: Partial<Club>) => {
  const club = await prisma.club.update({
    where: {
      id,
    },
    data: payload,
  })

  return club
}

const deleteClub = async (id: string) => {
  const club = await prisma.club.findUnique({
    where: {
      id,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found")
  }

  await prisma.$transaction(async (prisma) => {
    if (club.image) {
      // If the club has an image, you might want to delete it from the storage
      await removeFileFromSpaces(club.image)
    }

    await prisma.club.delete({
      where: {
        id,
      },
    })
  })

  return club
}

export const ClubServices = {
  createClub,
  getAllClubs,
  getSingleClub,
  updateClub,
  deleteClub,
}
