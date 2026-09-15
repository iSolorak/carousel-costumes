import { prisma } from "@/lib/db";

export function uploadUrl(filename: string | null | undefined) {
  if (!filename) return null;
  return `/api/uploads/${filename}`;
}

export function getFeaturedCostumes() {
  return prisma.costume.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
  });
}

export function getAllCostumes() {
  return prisma.costume.findMany({
    orderBy: { order: "asc" },
  });
}

export function getCostumeById(id: string) {
  return prisma.costume.findUnique({ where: { id } });
}
