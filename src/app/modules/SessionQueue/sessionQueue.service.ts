import ApiError from "../../../errors/ApiErrors"
import prisma from "../../../shared/prisma"

const getSessionQueueBySessionId = async (sessionId: string) => {
  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId },
    include: {
      SessionQueueParticipant: {
        include: { member: true },
      },
    },
  })

  if (!sessionQueue) {
    throw new ApiError(400, "SessionQueue not found")
  }

  return sessionQueue
}

export const sessionQueueService = {
  getSessionQueueBySessionId,
  // Add other session queue related methods here
}
