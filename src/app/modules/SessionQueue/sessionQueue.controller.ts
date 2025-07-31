import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { SessionQueueServices } from "./sessionQueue.service"

const createSessionQueue = catchAsync(async (req, res) => {
  const sessionQueue = await SessionQueueServices.createSessionQueue(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue created successfully",
    data: sessionQueue,
  })
})

const getAllSessionQueues = catchAsync(async (req, res) => {
  const sessionQueues = await SessionQueueServices.getAllSessionQueues(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueues retrieved successfully",
    data: sessionQueues,
  })
})

const getSingleSessionQueue = catchAsync(async (req, res) => {
  const sessionQueue = await SessionQueueServices.getSingleSessionQueue(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue retrieved successfully",
    data: sessionQueue,
  })
})

const updateSessionQueue = catchAsync(async (req, res) => {
  const sessionQueue = await SessionQueueServices.updateSessionQueue(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue updated successfully",
    data: sessionQueue,
  })
})

const deleteSessionQueue = catchAsync(async (req, res) => {
  const sessionQueue = await SessionQueueServices.deleteSessionQueue(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionQueue deleted successfully",
    data: sessionQueue,
  })
})

export const SessionQueueControllers = {
  createSessionQueue,
  getAllSessionQueues,
  getSingleSessionQueue,
  updateSessionQueue,
  deleteSessionQueue,
}
