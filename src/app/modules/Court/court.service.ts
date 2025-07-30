import { Court } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createCourt = async (payload: Court) => {
  const { clubId, name } = payload

  if (!clubId) {
    throw new ApiError(400, "Club ID is required to create a court")
  }

  const club = await prisma.club.findUnique({
    where: {
      id: clubId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const existingCourt = await prisma.court.findUnique({
    where: {
      name,
    },
  })

  if (existingCourt) {
    throw new ApiError(400, "Court with this name already exists")
  }

  if (!club.isSubscribed) {
    if (club.remainingCourts <= 0) {
      throw new ApiError(400, "No remaining courts available for this club")
    } else {
      await prisma.club.update({
        where: { id: clubId },
        data: {
          remainingCourts: club.remainingCourts - 1,
        },
      })
    }
  }

  const court = await prisma.court.create({
    data: payload,
  })
  return court
}

const getAllCourts = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  const totalCount = await prisma.court.count({
    where: whereConditions,
  })

  const courts = await prisma.court.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: courts,
  }
}

const getMyClubCourts = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  const totalCount = await prisma.court.count({
    where: whereConditions,
  })

  const courts = await prisma.court.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: courts,
  }
}

const getSingleCourt = async (id: string) => {
  const court = await prisma.court.findUnique({
    where: {
      id,
    },
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
    },
  })

  if (!court) {
    throw new ApiError(400, "Court not found")
  }

  return court
}

const updateCourt = async (id: string, payload: Partial<Court>) => {
  const { clubId } = payload

  if (clubId) {
    const club = await prisma.club.findUnique({
      where: {
        id: clubId,
      },
    })

    if (!club) {
      throw new ApiError(404, "Club not found")
    }
  }

  const court = await prisma.court.update({
    where: {
      id,
    },
    data: payload,
  })

  return court
}

const deleteCourt = async (id: string) => {
  const court = await prisma.court.findUnique({
    where: {
      id,
    },
  })

  if (!court) {
    throw new ApiError(400, "Court not found")
  }

  await prisma.court.delete({
    where: {
      id,
    },
  })

  return court
}

export const CourtServices = {
  createCourt,
  getAllCourts,
  getMyClubCourts,
  getSingleCourt,
  updateCourt,
  deleteCourt,
}
