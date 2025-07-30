import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { SessionCourtServices } from "./sessionCourt.service"

const createSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.createSessionCourt(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt created successfully",
    data: sessionCourt,
  })
})

const getAllSessionCourts = catchAsync(async (req, res) => {
  const sessionCourts = await SessionCourtServices.getAllSessionCourts(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourts retrieved successfully",
    data: sessionCourts,
  })
})

const getSingleSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.getSingleSessionCourt(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt retrieved successfully",
    data: sessionCourt,
  })
})

const updateSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.updateSessionCourt(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt updated successfully",
    data: sessionCourt,
  })
})

const deleteSessionCourt = catchAsync(async (req, res) => {
  const sessionCourt = await SessionCourtServices.deleteSessionCourt(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "SessionCourt deleted successfully",
    data: sessionCourt,
  })
})

export const SessionCourtControllers = {
  createSessionCourt,
  getAllSessionCourts,
  getSingleSessionCourt,
  updateSessionCourt,
  deleteSessionCourt,
}
