import { Match, TeamName } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createMatch = async (payload: Match) => {
  const { clubId, courtId, sessionId } = payload

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

  const match = await prisma.$transaction(async (prisma) => {
    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      })

      if (!session) {
        throw new ApiError(400, "Session not found")
      }

      const sessionCourt = await prisma.sessionCourt.findUnique({
        where: {
          sessionId_courtId: {
            sessionId: session.id,
            courtId: courtId,
          },
        },
      })
    }

    const match = await prisma.match.create({
      data: payload,
    })

    return match
  })

  return match
}

const getAllMatchs = async (query: any) => {
  const { page = 1, limit = 10, clubId, courtId, isActive } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  if (courtId) {
    whereConditions.courtId = courtId
  }

  if (isActive === "true" || isActive) {
    whereConditions.isActive = true
  }

  if (isActive === "false" || isActive === false) {
    whereConditions.isActive = false
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

  await prisma.match.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  })

  return match
}

const getMyClubMatches = async (query: any) => {
  const { page = 1, limit = 10, courtId, clubId, sessionId, isActive } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  if (courtId) {
    whereConditions.courtId = courtId
  }

  if (sessionId) {
    whereConditions.sessionId = sessionId
  }

  if (isActive === "true" || isActive) {
    whereConditions.isActive = true
  }

  if (isActive === "false" || isActive === false) {
    whereConditions.isActive = false
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

const finishMatch = async (
  matchId: string,
  winnerTeamName: TeamName,
  teamAPoints: number,
  teamBPoints: number
) => {
  if (!matchId) {
    throw new ApiError(400, "Match ID is required to finish a match")
  }

  if (!winnerTeamName) {
    throw new ApiError(400, "Winner team name is required to finish a match")
  }

  const match = await prisma.match.findUnique({
    where: {
      id: matchId,
    },
  })

  if (!match) {
    throw new ApiError(400, "Match not found")
  }

  let winningTeam: TeamName
  if (teamAPoints > teamBPoints) {
    winningTeam = TeamName.TEAM_A
  } else if (teamBPoints > teamAPoints) {
    winningTeam = TeamName.TEAM_B
  } else {
    throw new ApiError(400, "Match cannot be finished with equal points")
  }

  await prisma.$transaction(async (tx) => {
    // Update match participants
    await tx.matchParticipant.updateMany({
      where: {
        matchId,
        teamName: winningTeam,
      },
      data: {
        isWon: true,
        points: winningTeam === TeamName.TEAM_A ? teamAPoints : teamBPoints,
      },
    })

    await tx.matchParticipant.updateMany({
      where: {
        matchId,
        teamName: {
          not: winningTeam,
        },
      },
      data: {
        isWon: false,
        points: winningTeam === TeamName.TEAM_A ? teamBPoints : teamAPoints,
      },
    })

    // Release court
    if (match.sessionId && match.courtId) {
      await tx.sessionCourt.update({
        where: {
          sessionId_courtId: {
            sessionId: match.sessionId,
            courtId: match.courtId,
          },
        },
        data: {
          isBooked: false,
        },
      })
    }

    // Fetch match participants with member IDs
    const participants = await tx.matchParticipant.findMany({
      where: { matchId },
      include: { member: true },
    })

    const sessionQueue = await tx.sessionQueue.findUnique({
      where: {
        sessionId: match.sessionId!,
      },
    })

    if (!sessionQueue) {
      throw new ApiError(400, "SessionQueue not found")
    }

    // Split participants into winners and losers
    const winners = participants.filter((p) => p.teamName === winningTeam)
    const losers = participants.filter((p) => p.teamName !== winningTeam)

    const toQueue = [...winners, ...losers]

    for (const participant of toQueue) {
      await tx.sessionQueueParticipant.create({
        data: {
          sessionQueueId: sessionQueue.id,
          memberId: participant.memberId,
        },
      })
    }

    // Mark match inactive
    await tx.match.update({
      where: { id: matchId },
      data: {
        isActive: false,
      },
    })
  })

  return {
    message: "Match finished and players re-queued successfully",
    winnerTeam: winningTeam,
    teamAPoints,
    teamBPoints,
  }
}

export const MatchServices = {
  createMatch,
  getAllMatchs,
  getSingleMatch,
  updateMatch,
  deleteMatch,
  getMyClubMatches,
  finishMatch,
}
