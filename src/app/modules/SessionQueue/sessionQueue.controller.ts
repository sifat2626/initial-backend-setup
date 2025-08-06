import catchAsync from "../../../shared/catchAsync"
import { sessionQueueService } from "./sessionQueue.service"

const getSessionQueueBySessionId = catchAsync(async (req, res) => {
  const { sessionId } = req.params

  const sessionQueue = await sessionQueueService.getSessionQueueBySessionId(
    sessionId
  )

  res.status(200).json({
    status: "success",
    data: {
      sessionQueue,
    },
  })
})

export const sessionQueueController = {
  getSessionQueueBySessionId,
  // Add other session queue related controllers here
}
