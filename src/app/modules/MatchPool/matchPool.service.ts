import { GenderType, SessionQueueParticipant, TeamName } from "@prisma/client"
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

  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId: matchPool.sessionId },
  })
  if (!sessionQueue) throw new ApiError(400, "SessionQueue not found")

  const sessionQueueParticipant =
    await prisma.sessionQueueParticipant.findFirst({
      where: {
        sessionQueueId: sessionQueue.id,
        memberId: sessionParticipant.memberId,
      },
    })
  if (!sessionQueueParticipant) {
    throw new ApiError(400, "SessionQueueParticipant not found")
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

    await prisma.sessionQueueParticipant.delete({
      where: { id: sessionQueueParticipant.id },
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

  await prisma.sessionQueueParticipant.create({
    data: {
      sessionQueueId: matchPoolParticipant.matchPool.sessionId,
      memberId: matchPoolParticipant.memberId,
    },
  })

  return { message: "MatchPoolParticipant removed successfully" }
}

const getMatchPoolParticipants = async (matchPoolId: string) => {
  const matchPool = await prisma.matchPool.findUnique({
    where: { id: matchPoolId },
    include: {
      matchPoolParticipants: { include: { member: true } },
    },
  })
  if (!matchPool) throw new ApiError(400, "MatchPool not found")

  return matchPool.matchPoolParticipants
}

const generateMatchPool = async (sessionId: string, genderType: GenderType) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { MatchPool: true },
  })
  if (!session) throw new ApiError(400, "Session not found")

  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: { sessionId: session.id },
  })
  if (!sessionQueue) throw new ApiError(400, "SessionQueue not found")

  const allParticipants = await prisma.sessionQueueParticipant.findMany({
    where: { sessionQueueId: sessionQueue.id },
    include: { member: true },
  })
  if (!allParticipants)
    throw new ApiError(400, "SessionQueueParticipants not found")

  let participants: (SessionQueueParticipant & {
    member: { level: keyof typeof POWER_MAP } | null
  })[] = []
  if (genderType === GenderType.MALE || genderType === GenderType.FEMALE) {
    participants = allParticipants.filter(
      (p) => p.member?.gender === genderType
    )
  } else {
    participants = allParticipants
  }

  const matches: (SessionQueueParticipant & {
    member: { level: keyof typeof POWER_MAP } | null
  })[][] = []
  while (participants.length >= 4) {
    const group = participants.splice(0, 4)
    matches.push(group)
  }

  for (const match of matches) {
    await createBalancedMatch(session.id, match)
  }
}

const createBalancedMatch = async (
  sessionId: string,
  participants: (SessionQueueParticipant & {
    member: { level: keyof typeof POWER_MAP } | null
  })[]
) => {
  if (participants.length !== 4) return

  const powerOf = (
    p: SessionQueueParticipant & {
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

export {
  addToMatchPool,
  removeFromMatchPool,
  getMatchPoolParticipants,
  generateMatchPool,
}
