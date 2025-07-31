import { Session, Type } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createSession = async (payload: Session) => {
  const { startTime, endTime } = payload

  if (!startTime || !endTime) {
    throw new ApiError(
      400,
      "Start time and end time are required to create a session"
    )
  }

  if (new Date(startTime) >= new Date(endTime)) {
    throw new ApiError(400, "End time must be after start time")
  }

  if (new Date(startTime) < new Date()) {
    throw new ApiError(400, "Start time must be in the future")
  }
  const existingSession = await prisma.session.findFirst({
    where: {
      startTime: {
        lte: new Date(endTime),
      },
      endTime: {
        gte: new Date(startTime),
      },
    },
  })
  if (existingSession) {
    throw new ApiError(400, "Session overlaps with an existing session")
  }

  const session = await prisma.$transaction(async (prisma) => {
    const session = await prisma.session.create({
      data: payload,
    })

    const sessionQueue = await prisma.sessionQueue.create({
      data: {
        sessionId: session.id,
      },
    })

    return session
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
