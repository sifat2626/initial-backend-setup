import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { MatchServices } from "./match.service"

const createMatch = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found for the owner")
  }

  const match = await MatchServices.createMatch({
    ...req.body,
    clubId: club.id,
  })

  sendResponse(res, {
    statusCode: 200,
    message: "Match created successfully",
    data: match,
  })
})

const getAllMatchs = catchAsync(async (req, res) => {
  const matchs = await MatchServices.getAllMatchs(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Matchs retrieved successfully",
    data: matchs,
  })
})

const getSingleMatch = catchAsync(async (req, res) => {
  const match = await MatchServices.getSingleMatch(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Match retrieved successfully",
    data: match,
  })
})

const updateMatch = catchAsync(async (req, res) => {
  const match = await MatchServices.updateMatch(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Match updated successfully",
    data: match,
  })
})

const deleteMatch = catchAsync(async (req, res) => {
  const match = await MatchServices.deleteMatch(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Match deleted successfully",
    data: match,
  })
})

const getMyClubMatches = catchAsync(async (req, res) => {
  const ownerId = req.user.id

  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(400, "Club not found for the owner")
  }

  const matches = await MatchServices.getMyClubMatches({
    ...req.query,
    clubId: club.id,
  })

  sendResponse(res, {
    statusCode: 200,
    message: "Club matches retrieved successfully",
    data: matches,
  })
})

export const MatchControllers = {
  createMatch,
  getAllMatchs,
  getSingleMatch,
  updateMatch,
  deleteMatch,
  getMyClubMatches,
}
