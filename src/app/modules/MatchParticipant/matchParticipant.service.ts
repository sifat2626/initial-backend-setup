import { MatchParticipant, Type } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createMatchParticipant = async (payload: MatchParticipant) => {
  const { matchId, memberId, teamName } = payload

  if (!matchId) {
    throw new ApiError(
      400,
      "Match ID is required to create a match participant"
    )
  }

  if (!memberId) {
    throw new ApiError(
      400,
      "Member ID is required to create a match participant"
    )
  }

  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
    include: {
      Participant: true,
    },
  })

  if (!match) {
    throw new ApiError(404, "Match not found")
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
  })

  if (!member) {
    throw new ApiError(404, "Member not found")
  }

  // Check if the member is already a participant in the match
  const existingParticipant = await prisma.matchParticipant.findFirst({
    where: {
      matchId,
      memberId,
    },
  })

  if (existingParticipant) {
    throw new ApiError(400, "Member is already a participant in this match")
  }

  if (match.type === Type.SINGLE && match.Participant.length >= 1) {
    throw new ApiError(400, "Single matches can only have two participants")
  }

  if (match.type === Type.DOUBLES && match.Participant.length >= 3) {
    throw new ApiError(400, "Doubles matches can only have four participants")
  }

  if (match.type === Type.SINGLE) {
    if (!teamName) {
      throw new ApiError(400, "Team name is required for single matches")
    }

    const teamParticipants = await prisma.matchParticipant.findMany({
      where: {
        matchId,
        teamName,
      },
    })

    if (teamParticipants.length >= 1) {
      throw new ApiError(
        400,
        `Team ${teamName} already has a participant in this match`
      )
    }
  }

  if (match.type === Type.DOUBLES) {
    if (!teamName) {
      throw new ApiError(400, "Team name is required for doubles matches")
    }

    const teamParticipants = await prisma.matchParticipant.findMany({
      where: {
        matchId,
        teamName,
      },
    })

    if (teamParticipants.length >= 2) {
      throw new ApiError(
        400,
        `Team ${teamName} already has two participants in this match`
      )
    }
  }

  const matchParticipant = await prisma.matchParticipant.create({
    data: payload,
  })
  return matchParticipant
}

const getAllMatchParticipants = async (query: any) => {
  const { page = 1, limit = 10, matchId, memberId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (matchId) {
    whereConditions.matchId = matchId
  }

  if (memberId) {
    whereConditions.memberId = memberId
  }

  const totalCount = await prisma.matchParticipant.count({
    where: whereConditions,
  })

  const matchParticipants = await prisma.matchParticipant.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      match: true,
      member: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: matchParticipants,
  }
}

const getSingleMatchParticipant = async (id: string) => {
  const matchParticipant = await prisma.matchParticipant.findUnique({
    where: {
      id,
    },
    include: {
      match: true,
      member: true,
    },
  })

  if (!matchParticipant) {
    throw new ApiError(400, "MatchParticipant not found")
  }

  return matchParticipant
}

const getMyClubMatchParticipants = async (query: any) => {
  const { page = 1, limit = 10, matchId, memberId, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  if (matchId) {
    whereConditions.matchId = matchId
  }

  if (memberId) {
    whereConditions.memberId = memberId
  }

  const totalCount = await prisma.matchParticipant.count({
    where: whereConditions,
  })

  const matchParticipants = await prisma.matchParticipant.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      match: true,
      member: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: matchParticipants,
  }
}

const updateMatchParticipant = async (
  id: string,
  payload: Partial<MatchParticipant>
) => {
  const matchParticipant = await prisma.matchParticipant.update({
    where: {
      id,
    },
    data: payload,
  })

  return matchParticipant
}

const deleteMatchParticipant = async (id: string) => {
  const matchParticipant = await prisma.matchParticipant.findUnique({
    where: {
      id,
    },
  })

  if (!matchParticipant) {
    throw new ApiError(400, "MatchParticipant not found")
  }

  await prisma.matchParticipant.delete({
    where: {
      id,
    },
  })

  return matchParticipant
}

export const MatchParticipantServices = {
  createMatchParticipant,
  getAllMatchParticipants,
  getMyClubMatchParticipants,
  getSingleMatchParticipant,
  updateMatchParticipant,
  deleteMatchParticipant,
}
