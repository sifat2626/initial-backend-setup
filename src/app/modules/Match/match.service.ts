import { Match } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createMatch = async (payload: Match) => {
  const { clubId, courtId } = payload

  if (!clubId) {
    throw new ApiError(400, "Club ID is required to create a match")
  }

  if (!courtId) {
    throw new ApiError(400, "Court ID is required to create a match")
  }

  const court = await prisma.court.findUnique({
    where: {
      id: courtId,
    },
  })

  if (!court) {
    throw new ApiError(400, "Court not found")
  }

  if (court.clubId !== clubId) {
    throw new ApiError(400, "Court does not belong to the specified club")
  }

  const match = await prisma.match.create({
    data: payload,
  })
  return match
}

const getAllMatchs = async (query: any) => {
  const { page = 1, limit = 10, clubId, courtId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  if (courtId) {
    whereConditions.courtId = courtId
  }

  const totalCount = await prisma.match.count({
    where: whereConditions,
  })

  const matchs = await prisma.match.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      court: true,
      club: true,
      Participant: {
        include: {
          member: true,
        },
      },
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: matchs,
  }
}

const getSingleMatch = async (id: string) => {
  const match = await prisma.match.findUnique({
    where: {
      id,
    },
    include: {
      court: true,
      club: true,
      Participant: {
        include: {
          member: true,
        },
      },
    },
  })

  if (!match) {
    throw new ApiError(400, "Match not found")
  }

  return match
}

const updateMatch = async (id: string, payload: Partial<Match>) => {
  const match = await prisma.match.update({
    where: {
      id,
    },
    data: payload,
  })

  return match
}

const deleteMatch = async (id: string) => {
  const match = await prisma.match.findUnique({
    where: {
      id,
    },
  })

  if (!match) {
    throw new ApiError(400, "Match not found")
  }

  await prisma.match.delete({
    where: {
      id,
    },
  })

  return match
}

export const MatchServices = {
  createMatch,
  getAllMatchs,
  getSingleMatch,
  updateMatch,
  deleteMatch,
}
