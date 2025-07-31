import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { MatchServices } from "./match.service"

const createMatch = catchAsync(async (req, res) => {
  const match = await MatchServices.createMatch(req.body)

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

export const MatchControllers = {
  createMatch,
  getAllMatchs,
  getSingleMatch,
  updateMatch,
  deleteMatch,
}
