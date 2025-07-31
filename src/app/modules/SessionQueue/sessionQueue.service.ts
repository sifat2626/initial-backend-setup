import { SessionQueue } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors"

const createSessionQueue = async (payload: SessionQueue) => {
  const sessionQueue = await prisma.sessionQueue.create({
    data: payload,
  });
  return sessionQueue;
};

const getAllSessionQueues = async (query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereConditions: any = {};

  const totalCount = await prisma.sessionQueue.count({
    where: whereConditions,
  });

  const sessionQueues = await prisma.sessionQueue.findMany({
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
    data: sessionQueues,
  };
};

const getSingleSessionQueue = async (id: string) => {
  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: {
      id,
    },
  });

  if (!sessionQueue) {
    throw new ApiError(400, "SessionQueue not found");
  }

  return sessionQueue;
};

const updateSessionQueue = async (id: string, payload: Partial<SessionQueue>) => {
  const sessionQueue = await prisma.sessionQueue.update({
    where: {
      id,
    },
    data: payload,
  });

  return sessionQueue;
};

const deleteSessionQueue = async (id: string) => {
  const sessionQueue = await prisma.sessionQueue.findUnique({
    where: {
      id,
    },
  });

  if (!sessionQueue) {
    throw new ApiError(400, "SessionQueue not found");
  }

  await prisma.sessionQueue.delete({
    where: {
      id,
    },
  });

  return sessionQueue;
};

export const SessionQueueServices = {
  createSessionQueue,
  getAllSessionQueues,
  getSingleSessionQueue,
  updateSessionQueue,
  deleteSessionQueue,
};