import ApiError from "../../../errors/ApiErrors"
import catchAsync from "../../../shared/catchAsync"
import prisma from "../../../shared/prisma"
import sendResponse from "../../../shared/sendResponse"
import { MemberServices } from "./member.service"

const createMember = catchAsync(async (req, res) => {
  const member = await MemberServices.createMember(req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Member created successfully",
    data: member,
  })
})

const getAllMembers = catchAsync(async (req, res) => {
  const ownerId = req.user.id
  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })

  if (!club) {
    throw new ApiError(404, "Club not found for the owner")
  }
  req.query.clubId = club.id
  const members = await MemberServices.getAllMembers(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Members retrieved successfully",
    data: members,
  })
})

const getMyClubMembers = catchAsync(async (req, res) => {
  const ownerId = req.user.id
  const club = await prisma.club.findUnique({
    where: {
      ownerId,
    },
  })
  if (!club) {
    throw new ApiError(404, "Club not found for the owner")
  }
  const members = await MemberServices.getMyClubMembers({ clubId: club.id })
  sendResponse(res, {
    statusCode: 200,
    message: "My Club Members retrieved successfully",
    data: members,
  })
})

const getSingleMember = catchAsync(async (req, res) => {
  const member = await MemberServices.getSingleMember(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Member retrieved successfully",
    data: member,
  })
})

const updateMember = catchAsync(async (req, res) => {
  const member = await MemberServices.updateMember(req.params.id, req.body)

  sendResponse(res, {
    statusCode: 200,
    message: "Member updated successfully",
    data: member,
  })
})

const deleteMember = catchAsync(async (req, res) => {
  const member = await MemberServices.deleteMember(req.params.id)

  sendResponse(res, {
    statusCode: 200,
    message: "Member deleted successfully",
    data: member,
  })
})

export const MemberControllers = {
  createMember,
  getAllMembers,
  getMyClubMembers,
  getSingleMember,
  updateMember,
  deleteMember,
}
