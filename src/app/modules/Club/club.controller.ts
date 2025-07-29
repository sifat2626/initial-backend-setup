import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { ClubServices } from "./club.service"

const createClub = catchAsync(async (req, res) => {
  const ownerId = req.user.id
  const club = await ClubServices.createClub({ ...req.body, ownerId })

  sendResponse(res, {
    statusCode: 200,
    message: "Club created successfully",
    data: club,
  })
})

const getAllClubs = catchAsync(async (req, res) => {
  const clubs = await ClubServices.getAllClubs(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Clubs retrieved successfully",
    data: clubs,
  })
})

const getSingleClub = catchAsync(async (req, res) => {
  const club = await ClubServices.getSingleClub(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Club retrieved successfully",
    data: club,
  })
})

const updateClub = catchAsync(async (req, res) => {
  const club = await ClubServices.updateClub(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Club updated successfully",
    data: club,
  })
})

const deleteClub = catchAsync(async (req, res) => {
  const club = await ClubServices.deleteClub(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Club deleted successfully",
    data: club,
  })
})

export const ClubControllers = {
  createClub,
  getAllClubs,
  getSingleClub,
  updateClub,
  deleteClub,
}
