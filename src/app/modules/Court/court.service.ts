import { Court } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors"

const createCourt = async (payload: Court) => {
  const court = await prisma.court.create({
    data: payload,
  });
  return court;
};

const getAllCourts = async (query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereConditions: any = {};

  const totalCount = await prisma.court.count({
    where: whereConditions,
  });

  const courts = await prisma.court.findMany({
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
    data: courts,
  };
};

const getSingleCourt = async (id: string) => {
  const court = await prisma.court.findUnique({
    where: {
      id,
    },
  });

  if (!court) {
    throw new ApiError(400, "Court not found");
  }

  return court;
};

const updateCourt = async (id: string, payload: Partial<Court>) => {
  const court = await prisma.court.update({
    where: {
      id,
    },
    data: payload,
  });

  return court;
};

const deleteCourt = async (id: string) => {
  const court = await prisma.court.findUnique({
    where: {
      id,
    },
  });

  if (!court) {
    throw new ApiError(400, "Court not found");
  }

  await prisma.court.delete({
    where: {
      id,
    },
  });

  return court;
};

export const CourtServices = {
  createCourt,
  getAllCourts,
  getSingleCourt,
  updateCourt,
  deleteCourt,
};