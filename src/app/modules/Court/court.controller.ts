import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { CourtServices } from "./court.service"

const createCourt = catchAsync(async (req, res) => {
  const court = await CourtServices.createCourt(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Court created successfully",
    data: court,
  })
})

const getAllCourts = catchAsync(async (req, res) => {
  const courts = await CourtServices.getAllCourts(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Courts retrieved successfully",
    data: courts,
  })
})

const getSingleCourt = catchAsync(async (req, res) => {
  const court = await CourtServices.getSingleCourt(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Court retrieved successfully",
    data: court,
  })
})

const updateCourt = catchAsync(async (req, res) => {
  const court = await CourtServices.updateCourt(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Court updated successfully",
    data: court,
  })
})

const deleteCourt = catchAsync(async (req, res) => {
  const court = await CourtServices.deleteCourt(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Court deleted successfully",
    data: court,
  })
})

export const CourtControllers = {
  createCourt,
  getAllCourts,
  getSingleCourt,
  updateCourt,
  deleteCourt,
}
