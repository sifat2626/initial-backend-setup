import { Member } from "@prisma/client"
import prisma from "../../../shared/prisma"
import ApiError from "../../../errors/ApiErrors"

const createMember = async (payload: Member) => {
  let { clubId, isMember } = payload

  const member = await prisma.$transaction(async (prisma) => {
    if (clubId) {
      const club = await prisma.club.findUnique({
        where: {
          id: clubId,
        },
      })

      if (!club) {
        throw new ApiError(404, "Club not found")
      }

      if (!club.isSubscribed && club.remainingMembers <= 0) {
        throw new ApiError(400, "No remaining members available for this club")
      }

      isMember = false
      await prisma.club.update({
        where: { id: clubId },
        data: {
          remainingMembers: club.remainingMembers - 1,
        },
      })
    }
    const member = await prisma.member.create({
      data: payload,
    })

    return member
  })

  return member
}

const getAllMembers = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {}

  if (clubId) {
    whereConditions.clubId = clubId
  }

  const totalCount = await prisma.member.count({
    where: whereConditions,
  })

  const members = await prisma.member.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: members,
  }
}

const getMyClubMembers = async (query: any) => {
  const { page = 1, limit = 10, clubId } = query

  const skip = (Number(page) - 1) * Number(limit)
  const take = Number(limit)

  const whereConditions: any = {
    clubId,
  }

  const totalCount = await prisma.member.count({
    where: whereConditions,
  })

  const members = await prisma.member.findMany({
    where: whereConditions,
    skip,
    take,
    include: {
      club: true,
    },
  })

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: members,
  }
}

const getSingleMember = async (id: string) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
    include: {
      club: true,
    },
  })

  if (!member) {
    throw new ApiError(400, "Member not found")
  }

  return member
}

const updateMember = async (id: string, payload: Partial<Member>) => {
  const { clubId } = payload

  if (clubId) {
    const club = await prisma.club.findUnique({
      where: {
        id: clubId,
      },
    })

    if (!club) {
      throw new ApiError(404, "Club not found")
    }
  }

  const member = await prisma.member.update({
    where: {
      id,
    },
    data: payload,
  })

  return member
}

const deleteMember = async (id: string) => {
  const member = await prisma.member.findUnique({
    where: {
      id,
    },
  })

  if (!member) {
    throw new ApiError(400, "Member not found")
  }

  await prisma.member.delete({
    where: {
      id,
    },
  })

  return member
}

export const MemberServices = {
  createMember,
  getAllMembers,
  getSingleMember,
  updateMember,
  deleteMember,
}
