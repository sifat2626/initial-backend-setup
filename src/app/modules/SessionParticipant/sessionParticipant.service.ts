import { SessionParticipant } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createSessionParticipant = async (payload: SessionParticipant) => {
  const { sessionId, memberId } = payload

  if (!sessionId) {
    throw new ApiError(
      400,
      "Session ID is required to create a session participant"
    )
  }

  if (!memberId) {
    throw new ApiError(
      400,
      "Member ID is required to create a session participant"
    )
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  })

  if (!session) {
    throw new ApiError(400, "Session not found")
  }

  if (session.remainingParticipants <= 0) {
    throw new ApiError(
      400,
      "No remaining participants available for this session"
    )
  }

  if (session.isActive === false) {
    throw new ApiError(400, "Session is not active")
  }

  if (session.endTime < new Date()) {
    throw new ApiError(400, "Session has already ended")
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
  })

  if (!member) {
    throw new ApiError(400, "Member not found")
  }

  // Check if the member is already a participant in the session
  const existingParticipant = await prisma.sessionParticipant.findFirst({
    where: {
      sessionId,
      memberId,
    },
  })

  if (existingParticipant) {
    throw new ApiError(400, "Member is already a participant in this session")
  }

  const sessionParticipant = await prisma.$transaction(async (prisma) => {
    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        remainingParticipants: {
          decrement: 1,
        },
      },
    })

    return await prisma.sessionParticipant.create({
      data: payload,
    })
  })

  return sessionParticipant
}

const getAllSessionParticipants = async (query: any) => {
  const { page = 1, limit = 10, sessionId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (sessionId) {
    whereConditions.sessionId = sessionId
  }

  const totalCount = await prisma.sessionParticipant.count({
    where: whereConditions,
  })

  const sessionParticipants = await prisma.sessionParticipant.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      session: true,
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
    data: sessionParticipants,
  }
}

const getSingleSessionParticipant = async (id: string) => {
  const sessionParticipant = await prisma.sessionParticipant.findUnique({
    where: {
      id,
    },
    include: {
      session: true,
      member: true,
    },
  })

  if (!sessionParticipant) {
    throw new ApiError(400, "SessionParticipant not found")
  }

  return sessionParticipant
}

const updateSessionParticipant = async (
  id: string,
  payload: Partial<SessionParticipant>
) => {
  const { sessionId, memberId } = payload

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    })

    if (!session) {
      throw new ApiError(400, "Session not found")
    }
  }

  if (memberId) {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    })

    if (!member) {
      throw new ApiError(400, "Member not found")
    }
  }

  const sessionParticipant = await prisma.sessionParticipant.update({
    where: {
      id,
    },
    data: payload,
  })

  return sessionParticipant
}

const deleteSessionParticipant = async (id: string) => {
  const sessionParticipant = await prisma.sessionParticipant.findUnique({
    where: {
      id,
    },
  })

  if (!sessionParticipant) {
    throw new ApiError(400, "SessionParticipant not found")
  }

  await prisma.sessionParticipant.delete({
    where: {
      id,
    },
  })

  return sessionParticipant
}

export const SessionParticipantServices = {
  createSessionParticipant,
  getAllSessionParticipants,
  getSingleSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant,
}
