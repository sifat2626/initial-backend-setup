import { SessionCourt } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createSessionCourt = async (payload: SessionCourt, clubId: string) => {
  const { sessionId, courtId } = payload
  if (!sessionId) {
    throw new ApiError(400, "Session ID is required to create a session court")
  }

  if (!courtId) {
    throw new ApiError(400, "Court ID is required to create a session court")
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      club: true,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  if (session.club.id !== clubId) {
    throw new ApiError(400, "Session does not belong to the specified club")
  }

  const court = await prisma.court.findUnique({
    where: {
      id: courtId,
    },
    include: {
      club: true,
    },
  })

  if (!court) {
    throw new ApiError(400, "Court not found")
  }

  if (court.club.id !== clubId) {
    throw new ApiError(400, "Court does not belong to the specified club")
  }

  // Check if the session already has this court assigned
  const existingSessionCourt = await prisma.sessionCourt.findFirst({
    where: {
      sessionId,
      courtId,
    },
  })

  if (existingSessionCourt) {
    throw new ApiError(400, "This court is already assigned to the session")
  }

  const sessionCourt = await prisma.sessionCourt.create({
    data: payload,
  })
  return sessionCourt
}

const getAllSessionCourts = async (query: any) => {
  const { page = 1, limit = 10, sessionId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (sessionId) {
    whereConditions.sessionId = sessionId
  }

  const totalCount = await prisma.sessionCourt.count({
    where: whereConditions,
  })

  const sessionCourts = await prisma.sessionCourt.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      session: true,
      court: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: sessionCourts,
  }
}

const getSingleSessionCourt = async (id: string) => {
  const sessionCourt = await prisma.sessionCourt.findUnique({
    where: {
      id,
    },
    include: {
      session: true,
      court: true,
    },
  })

  if (!sessionCourt) {
    throw new ApiError(400, "SessionCourt not found")
  }

  return sessionCourt
}

const updateSessionCourt = async (
  id: string,
  payload: Partial<SessionCourt>
) => {
  const sessionCourt = await prisma.sessionCourt.update({
    where: {
      id,
    },
    data: payload,
  })

  return sessionCourt
}

const deleteSessionCourt = async (id: string) => {
  const sessionCourt = await prisma.sessionCourt.findUnique({
    where: {
      id,
    },
  })

  if (!sessionCourt) {
    throw new ApiError(400, "SessionCourt not found")
  }

  await prisma.sessionCourt.delete({
    where: {
      id,
    },
  })

  return sessionCourt
}

export const SessionCourtServices = {
  createSessionCourt,
  getAllSessionCourts,
  getSingleSessionCourt,
  updateSessionCourt,
  deleteSessionCourt,
}
