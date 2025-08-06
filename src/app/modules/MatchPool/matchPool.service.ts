import { GenderType, SessionParticipant, TeamName } from "@prisma/client"
import ApiError from "../../../errors/ApiErrors"
import prisma from "../../../shared/prisma"

const POWER_MAP = {
  CASUAL: 50,
  BEGINNER: 60,
  INTERMEDIATE: 80,
  ADVANCED: 90,
}

const addToMatchPool = async (
  matchpoolId: string,
  sessionParticipantId: string,
  teamName: TeamName
) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id: matchpoolId },
    include: { session: true, matchPoolParticipants: true },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")

  const sessionParticipant = await prisma.sessionParticipant.findUnique({
    where: { id: sessionParticipantId },
  })
  if (!sessionParticipant)
    throw new ApiError(400, "SessionParticipant not found")

  const existingParticipants = await prisma.matchPoolParticipant.findMany({
    where: {
      matchPoolId: matchpoolId,
      memberId: sessionParticipant.memberId,
      teamName,
    },
  })
  if (existingParticipants.length === 2) {
    throw new ApiError(400, "Participants already exist in match pool")
  }

  const matchPoolParticipant = await prisma.$transaction(async (prisma) => {
    const created = await prisma.matchPoolParticipant.create({
      data: {
        matchPoolId: matchpoolId,
        memberId: sessionParticipant.memberId,
        teamName,
      },
      include: { member: true, matchPool: true },
    })

    await prisma.sessionParticipant.delete({
      where: { id: sessionParticipant.id },
    })

    return created
  })

  return matchPoolParticipant
}

const removeFromMatchPool = async (matchPoolParticipantId: string) => {
  const matchPoolParticipant = await prisma.matchPoolParticipant.findUnique({
    where: { id: matchPoolParticipantId },
    include: { matchPool: { include: { session: true } } },
  })
  if (!matchPoolParticipant)
    throw new ApiError(400, "MatchPoolParticipant not found")

  await prisma.matchPoolParticipant.delete({
    where: { id: matchPoolParticipantId },
  })

  await prisma.sessionParticipant.create({
    data: {
      memberId: matchPoolParticipant.memberId,
      sessionId: matchPoolParticipant.matchPool.sessionId!,
    },
  })

  return { message: "MatchPoolParticipant removed successfully" }
}

const generateMatchPool = async (sessionId: string, genderType: GenderType) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { MatchPool: true },
  })
  if (!session) throw new ApiError(400, "Session not found")

  const allParticipants = await prisma.sessionParticipant.findMany({
    where: { sessionId: session.id },
    include: { member: true },
    orderBy: { createdAt: "asc" }, // Ensures queue order
  })
  if (!allParticipants || allParticipants.length < 4)
    throw new ApiError(400, "Not enough players to generate a match")

  // Filter by gender type
  let participants = allParticipants
  if (genderType === GenderType.MALE || genderType === GenderType.FEMALE) {
    participants = allParticipants.filter(
      (p) => p.member?.gender === genderType
    )
  }

  // Take up to first 8 participants (or less if <8)
  const scope = participants.slice(0, Math.min(8, participants.length))

  if (scope.length < 4) {
    throw new ApiError(400, "Not enough players to form a match")
  }

  // Generate all 4-player combinations within scope
  const combos: Array<(typeof scope)[number][]> = []
  for (let i = 0; i < scope.length; i++) {
    for (let j = i + 1; j < scope.length; j++) {
      for (let k = j + 1; k < scope.length; k++) {
        for (let l = k + 1; l < scope.length; l++) {
          combos.push([scope[i], scope[j], scope[k], scope[l]])
        }
      }
    }
  }

  if (combos.length === 0) {
    throw new ApiError(400, "Unable to form a 4-player combination")
  }

  // Evaluate best power-balanced group
  let bestGroup: typeof scope = []
  let bestDiff = Infinity

  for (const group of combos) {
    const teamOptions = [
      [
        [0, 1],
        [2, 3],
      ],
      [
        [0, 2],
        [1, 3],
      ],
      [
        [0, 3],
        [1, 2],
      ],
    ]

    for (const [teamAIdx, teamBIdx] of teamOptions) {
      const powerOf = (p: (typeof group)[0]) => {
        const level = p.member?.level ?? "CASUAL"
        return POWER_MAP[level]
      }

      const powerA = powerOf(group[teamAIdx[0]]) + powerOf(group[teamAIdx[1]])
      const powerB = powerOf(group[teamBIdx[0]]) + powerOf(group[teamBIdx[1]])
      const diff = Math.abs(powerA - powerB)

      if (diff < bestDiff) {
        bestDiff = diff
        bestGroup = group
      }
    }
  }

  if (!bestGroup.length) {
    throw new ApiError(400, "Could not form a balanced group")
  }

  // Create match with the best balanced group
  await createBalancedMatch(session.id, bestGroup)
}

const createBalancedMatch = async (
  sessionId: string,
  participants: (SessionParticipant & {
    member: { level: keyof typeof POWER_MAP } | null
  })[]
) => {
  if (participants.length !== 4) return

  const powerOf = (
    p: SessionParticipant & {
      member: { level: keyof typeof POWER_MAP } | null
    }
  ) => {
    const level =
      p.member?.level && POWER_MAP[p.member.level] !== undefined
        ? p.member.level
        : "CASUAL"
    return POWER_MAP[level]
  }

  const combos = [
    [
      [0, 1],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 3],
    ],
    [
      [0, 3],
      [1, 2],
    ],
  ]

  let bestDiff = Infinity
  let bestTeams: number[][] = []

  for (const [teamAIdx, teamBIdx] of combos) {
    const teamA = teamAIdx.map((i) => participants[i])
    const teamB = teamBIdx.map((i) => participants[i])

    const powerA = teamA.reduce((acc, p) => acc + powerOf(p), 0)
    const powerB = teamB.reduce((acc, p) => acc + powerOf(p), 0)

    const diff = Math.abs(powerA - powerB)
    if (diff < bestDiff) {
      bestDiff = diff
      bestTeams = [teamAIdx, teamBIdx]
    }
  }

  const matchPool = await prisma.matchPool.create({
    data: { sessionId },
  })

  const [teamAIdx, teamBIdx] = bestTeams
  for (const idx of teamAIdx) {
    await addToMatchPool(matchPool.id, participants[idx].id, TeamName.TEAM_A)
  }
  for (const idx of teamBIdx) {
    await addToMatchPool(matchPool.id, participants[idx].id, TeamName.TEAM_B)
  }
}

const getAllMatchPools = async (query: any) => {
  const { page = 1, limit = 10, sessionId } = query
  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}
  if (sessionId) {
    whereConditions.sessionId = sessionId
  }
  const totalCount = await prisma.matchPool.count({
    where: whereConditions,
  })
  const matchPools = await prisma.matchPool.findMany({
    skip,
    take,
    where: whereConditions,
    include: {
      matchPoolParticipants: {
        include: { member: true },
      },
      session: true,
    },
  })
  return {
    meta: {
      totalCount,
      page,
      limit,
    },
    data: matchPools,
  }
}

const getMatchPoolById = async (id: string) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id },
    include: {
      matchPoolParticipants: {
        include: { member: true },
      },
      session: true,
    },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")
  return matchPool
}

export const MatchPoolServices = {
  addToMatchPool,
  removeFromMatchPool,
  getMatchPoolById,
  getAllMatchPools,
  generateMatchPool,
}
