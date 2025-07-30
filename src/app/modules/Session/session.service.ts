import { Session } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors"

const createSession = async (payload: Session) => {
  const session = await prisma.session.create({
    data: payload,
  });
  return session;
};

const getAllSessions = async (query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereConditions: any = {};

  const totalCount = await prisma.session.count({
    where: whereConditions,
  });

  const sessions = await prisma.session.findMany({
    where: whereConditions,
    skip,
    take,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    },
    data: sessions,
  };
};

const getSingleSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
  });

  if (!session) {
    throw new ApiError(400, "Session not found");
  }

  return session;
};

const updateSession = async (id: string, payload: Partial<Session>) => {
  const session = await prisma.session.update({
    where: {
      id,
    },
    data: payload,
  });

  return session;
};

const deleteSession = async (id: string) => {
  const session = await prisma.session.findUnique({
    where: {
      id,
    },
  });

  if (!session) {
    throw new ApiError(400, "Session not found");
  }

  await prisma.session.delete({
    where: {
      id,
    },
  });

  return session;
};

export const SessionServices = {
  createSession,
  getAllSessions,
  getSingleSession,
  updateSession,
  deleteSession,
};