import catchAsync from "../../../shared/catchAsync"
import { MatchPoolServices } from "./matchPool.service"

const addToMatchPool = catchAsync(async (req, res) => {
  const { matchpoolId, sessionParticipantId, teamName } = req.body

  const matchPoolParticipant = await MatchPoolServices.addToMatchPool(
    matchpoolId,
    sessionParticipantId,
    teamName
  )

  res.status(201).json({
    status: "success",
    data: {
      matchPoolParticipant,
    },
  })
})

const removeFromMatchPool = catchAsync(async (req, res) => {
  const { matchPoolParticipantId } = req.body

  const matchPoolParticipant = await MatchPoolServices.removeFromMatchPool(
    matchPoolParticipantId
  )

  res.status(200).json({
    status: "success",
    data: {
      matchPoolParticipant,
    },
  })
})

const generateMatchPool = catchAsync(async (req, res) => {
  const { sessionId, genderType } = req.body

  const matchPool = await MatchPoolServices.generateMatchPool(
    sessionId,
    genderType
  )

  res.status(200).json({
    status: "success",
    data: {
      matchPool,
    },
  })
})

const getAllMatchPools = catchAsync(async (req, res) => {
  const matchPools = await MatchPoolServices.getAllMatchPools(req.query)

  res.status(200).json({
    status: "success",
    data: {
      matchPools,
    },
  })
})

const getMatchPoolById = catchAsync(async (req, res) => {
  const { id } = req.params

  const matchPool = await MatchPoolServices.getMatchPoolById(id)

  res.status(200).json({
    status: "success",
    data: {
      matchPool,
    },
  })
})

export const MatchPoolController = {
  addToMatchPool,
  removeFromMatchPool,
  generateMatchPool,
  getAllMatchPools,
  getMatchPoolById,
}
