import { Session, Type } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

interface CreateSessionInput {
  clubId: string
  startTime: Date | string
  endTime: Date | string
  type?: Type // SINGLE or DOUBLES, default DOUBLES
}

const createSession = async (input: CreateSessionInput) => {
  const { clubId, startTime, endTime, type = Type.DOUBLES } = input

  if (!clubId) {
    throw new ApiError(400, "clubId is required")
  }
  if (!startTime || !endTime) {
    throw new ApiError(400, "startTime and endTime are required")
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (start >= end) {
    throw new ApiError(400, "endTime must be after startTime")
  }

  if (start < new Date()) {
    throw new ApiError(400, "startTime must be in the future")
  }

  // Check overlapping sessions for the same club
  const overlappingSession = await prisma.session.findFirst({
    where: {
      clubId,
      AND: [
        { startTime: { lte: end } },
        { endTime: { gte: start } },
        { isActive: true },
      ],
    },
  })

  if (overlappingSession) {
    throw new ApiError(400, "Session overlaps with an existing active session")
  }

  // Use a transaction to create session and sessionQueue atomically
  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.session.create({
      data: {
        clubId,
        startTime: start,
        endTime: end,
        type,
        isActive: true,
      },
    })

    await tx.sessionQueue.create({
      data: {
        sessionId: createdSession.id,
      },
    })

    return createdSession
  })

  return session
}
const getAllSessions = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  const totalCount = await prisma.session.count({
    where: whereConditions,
  })

  const sessions = await prisma.session.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: sessions,
  }
}

const getMyClubSessions = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  const totalCount = await prisma.session.count({
    where: whereConditions,
  })

  const sessions = await prisma.session.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
      sessionQueue: {
        include: {
          SessionQueueParticipant: {
            include: { member: true },
          },
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
    data: sessions,
  }
}

const getSingleSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
    include: {
      club: true,
      Match: true,
      SessionCourt: true,
      SessionParticipant: true,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  return session
}

const updateSession = async (id: string, payload: Partial<Session>) => {
  const session = await prisma.session.update({
    where: {
      id,
    },
    data: payload,
  })

  return session
}

const deleteSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  await prisma.session.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  })

  return session
}

const generateMatchPool = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      SessionParticipant: {
        include: {
          member: true,
        },
      },
      SessionCourt: {
        include: {
          court: true,
        },
      },
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  const power = {
    MALE: 1,
    FEMALE: 0.8,
    CASUAL: 3,
    BEGINNER: 5,
    INTERMEDIATE: 7,
    ADVANCED: 10,
  }

  if (session.type === Type.SINGLE) {
    if (session.SessionParticipant.length < 2) {
      throw new ApiError(400, "Not enough participants to generate a match")
    }

    const participants = session.SessionParticipant.map((participant) => ({
      memberId: participant.memberId,
      power: power[participant.member.gender] * power[participant.member.level],
    }))

    participants.sort((a, b) => b.power - a.power)

    const top2 = participants.slice(0, 2)

    const teamA = top2[0]
    const teamB = top2[1]

    const sessionQueue = await prisma.sessionQueue.findUnique({
      where: {
        sessionId: session.id,
      },
      include: {
        SessionQueueParticipant: {
          include: {
            member: true,
          },
        },
      },
    })

    if (!sessionQueue) {
      throw new ApiError(400, "Session queue not found")
    }

    await prisma.sessionQueueParticipant.deleteMany({
      where: {
        memberId: {
          in: sessionQueue.SessionQueueParticipant.map((p) => p.memberId),
        },
      },
    })

    return {
      teamA: {
        memberId: teamA.memberId,
        power: teamA.power,
      },
      teamB: {
        memberId: teamB.memberId,
        power: teamB.power,
      },
    }
  }

  if (session.type === Type.DOUBLES) {
    if (session.SessionParticipant.length < 4) {
      throw new ApiError(400, "Not enough participants to generate a match")
    }

    const participants = session.SessionParticipant.map((participant) => ({
      memberId: participant.memberId,
      power: power[participant.member.gender] * power[participant.member.level],
    }))

    participants.sort((a, b) => b.power - a.power)

    const top4 = participants.slice(0, 4)

    const teamA = {
      member1: top4[0],
      member2: top4[3],
    }
    const teamB = {
      member1: top4[1],
      member2: top4[2],
    }

    const sessionQueue = await prisma.sessionQueue.findUnique({
      where: {
        sessionId: session.id,
      },
      include: {
        SessionQueueParticipant: {
          include: {
            member: true,
          },
        },
      },
    })

    if (!sessionQueue) {
      throw new ApiError(400, "Session queue not found")
    }

    await prisma.sessionQueueParticipant.deleteMany({
      where: {
        memberId: {
          in: sessionQueue.SessionQueueParticipant.map((p) => p.memberId),
        },
      },
    })

    return {
      teamA: {
        member1: teamA.member1.memberId,
        member2: teamA.member2.memberId,
        power: teamA.member1.power + teamA.member2.power,
      },
      teamB: {
        member1: teamB.member1.memberId,
        member2: teamB.member2.memberId,
        power: teamB.member1.power + teamB.member2.power,
      },
    }
  }
}

const addToMatchPool = async (sessionId: string, memberId: string) => {}

const removeFromMatchPool = async (sessionId: string, memberId: string) => {}

const generateSessionMatch = async (sessionId: string) => {}

export const SessionServices = {
  createSession,
  getAllSessions,
  getMyClubSessions,
  getSingleSession,
  updateSession,
  deleteSession,
}
