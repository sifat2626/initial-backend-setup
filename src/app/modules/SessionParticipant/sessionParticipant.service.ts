import { SessionParticipant } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

interface JoinSessionInput {
  sessionId: string
  memberId: string
}

const createSessionParticipant = async ({
  sessionId,
  memberId,
}: JoinSessionInput) => {
  if (!sessionId) throw new ApiError(400, "Session ID is required")
  if (!memberId) throw new ApiError(400, "Member ID is required")

  // Fetch session and validate
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })
  if (!session) throw new ApiError(404, "Session not found")
  if (!session.isActive) throw new ApiError(400, "Session is not active")
  if (session.remainingParticipants <= 0)
    throw new ApiError(400, "Session is full")
  if (session.endTime < new Date())
    throw new ApiError(400, "Session has already ended")

  // Check member existence
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  })
  if (!member) throw new ApiError(404, "Member not found")

  // Check if already joined
  const alreadyParticipant = await prisma.sessionParticipant.findFirst({
    where: { sessionId, memberId },
  })
  if (alreadyParticipant)
    throw new ApiError(400, "Member already joined this session")

  // Transactionally add participant and queue participant, decrement remainingParticipants
  const participant = await prisma.$transaction(async (tx) => {
    // Decrement remainingParticipants count
    await tx.session.update({
      where: { id: sessionId },
      data: { remainingParticipants: { decrement: 1 } },
    })

    // Create session participant
    const newParticipant = await tx.sessionParticipant.create({
      data: { sessionId, memberId, status: "ACTIVE" }, // Assuming default ACTIVE status
    })

    // Get or create sessionQueue
    let sessionQueue = await tx.sessionQueue.findUnique({
      where: { sessionId },
    })

    if (!sessionQueue) {
      sessionQueue = await tx.sessionQueue.create({
        data: { sessionId },
      })
    }

    // Add to sessionQueueParticipant
    await tx.sessionQueueParticipant.create({
      data: {
        sessionQueueId: sessionQueue.id,
        memberId,
      },
    })

    return newParticipant
  })

  return participant
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

  const existingMatch = await prisma.match.findFirst({
    where: {
      sessionId: sessionParticipant.sessionId,
    },
  })

  if (existingMatch) {
    const participant = await prisma.matchParticipant.findFirst({
      where: {
        matchId: sessionParticipant.sessionId,
        memberId: sessionParticipant.memberId,
      },
    })

    if (participant) {
      throw new ApiError(400, "Cannot delete participant, match already exists")
    }
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
