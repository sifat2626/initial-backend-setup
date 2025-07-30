import { Session } from "@prisma/client"
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

  const session = await prisma.session.create({
    data: payload,
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

export const SessionServices = {
  createSession,
  getAllSessions,
  getMyClubSessions,
  getSingleSession,
  updateSession,
  deleteSession,
}
