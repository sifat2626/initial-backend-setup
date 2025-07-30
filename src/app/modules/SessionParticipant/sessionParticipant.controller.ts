import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { SessionParticipantServices } from "./sessionParticipant.service"

const createSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.createSessionParticipant(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant created successfully",
    data: sessionParticipant,
  })
})

const getAllSessionParticipants = catchAsync(async (req, res) => {
  const { sessionId } = req.params
  const sessionParticipants =
    await SessionParticipantServices.getAllSessionParticipants({
      ...req.query,
      sessionId,
    })

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipants retrieved successfully",
    data: sessionParticipants,
  })
})

const getSingleSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.getSingleSessionParticipant(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant retrieved successfully",
    data: sessionParticipant,
  })
})

const updateSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.updateSessionParticipant(
      req.params.id,
      req.body
    )

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant updated successfully",
    data: sessionParticipant,
  })
})

const deleteSessionParticipant = catchAsync(async (req, res) => {
  const sessionParticipant =
    await SessionParticipantServices.deleteSessionParticipant(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionParticipant deleted successfully",
    data: sessionParticipant,
  })
})

export const SessionParticipantControllers = {
  createSessionParticipant,
  getAllSessionParticipants,
  getSingleSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant,
}
