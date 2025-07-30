import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { CourtServices } from "./court.service"

const createCourt = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found for the owner")
  }

  req.body.clubId = club.id
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

const getMyClubCourts = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found for the owner")
  }
  const courts = await CourtServices.getMyClubCourts({ clubId: club.id })

  sendResponse(res, {
    statusCode: 200,
    message: "My Club Courts retrieved successfully",
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
  getMyClubCourts,
  getSingleCourt,
  updateCourt,
  deleteCourt,
}
