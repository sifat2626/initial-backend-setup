import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { SessionServices } from "./session.service"

const createSession = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found")
  }

  const session = await SessionServices.createSession({
    ...req.body,
    clubId: club.id,
  })

  sendResponse(res, {
    statusCode: 200,
    message: "Session created successfully",
    data: session,
  })
})

const getAllSessions = catchAsync(async (req, res) => {
  const sessions = await SessionServices.getAllSessions(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Sessions retrieved successfully",
    data: sessions,
  })
})

const getSingleSession = catchAsync(async (req, res) => {
  const session = await SessionServices.getSingleSession(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Session retrieved successfully",
    data: session,
  })
})

const updateSession = catchAsync(async (req, res) => {
  const session = await SessionServices.updateSession(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Session updated successfully",
    data: session,
  })
})

const deleteSession = catchAsync(async (req, res) => {
  const session = await SessionServices.deleteSession(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Session deleted successfully",
    data: session,
  })
})

export const SessionControllers = {
  createSession,
  getAllSessions,
  getSingleSession,
  updateSession,
  deleteSession,
}
