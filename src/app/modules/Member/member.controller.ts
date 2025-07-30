import catchAsync from "../../../shared/catchAsync"
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
  const members = await MemberServices.getAllMembers(req.query)

  sendResponse(res, {
    statusCode: 200,
    message: "Members retrieved successfully",
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
  getSingleMember,
  updateMember,
  deleteMember,
}
