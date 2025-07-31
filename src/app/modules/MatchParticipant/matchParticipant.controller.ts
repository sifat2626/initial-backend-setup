import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { MatchParticipantServices } from "./matchParticipant.service"

const createMatchParticipant = catchAsync(async (req, res) => {
  const matchParticipant =
    await MatchParticipantServices.createMatchParticipant(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "MatchParticipant created successfully",
    data: matchParticipant,
  })
})

const getAllMatchParticipants = catchAsync(async (req, res) => {
  const matchParticipants =
    await MatchParticipantServices.getAllMatchParticipants(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "MatchParticipants retrieved successfully",
    data: matchParticipants,
  })
})

const getMyClubMatchParticipants = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found for the owner")
  }

  req.query.clubId = club.id

  const matchParticipants =
    await MatchParticipantServices.getMyClubMatchParticipants(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "My Club MatchParticipants retrieved successfully",
    data: matchParticipants,
  })
})

const getSingleMatchParticipant = catchAsync(async (req, res) => {
  const matchParticipant =
    await MatchParticipantServices.getSingleMatchParticipant(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "MatchParticipant retrieved successfully",
    data: matchParticipant,
  })
})

const updateMatchParticipant = catchAsync(async (req, res) => {
  const matchParticipant =
    await MatchParticipantServices.updateMatchParticipant(
      req.params.id,
      req.body
    )

  sendResponse(res, {
    statusCode: 200,
    message: "MatchParticipant updated successfully",
    data: matchParticipant,
  })
})

const deleteMatchParticipant = catchAsync(async (req, res) => {
  const matchParticipant =
    await MatchParticipantServices.deleteMatchParticipant(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "MatchParticipant deleted successfully",
    data: matchParticipant,
  })
})

export const MatchParticipantControllers = {
  createMatchParticipant,
  getAllMatchParticipants,
  getMyClubMatchParticipants,
  getSingleMatchParticipant,
  updateMatchParticipant,
  deleteMatchParticipant,
}
