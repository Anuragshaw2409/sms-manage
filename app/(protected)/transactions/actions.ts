"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getTransactions(
  page: number = 1,
  pageSize: number = 8,
  search: string = "",
  status: string = "all"
) {
  try {
    await verifyAuth();
    
    const skip = (page - 1) * pageSize;
    
    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    
    const [transactions, total] = await prisma.$transaction([
      prisma.transactions.findMany({
        where,
        include: {
          owner: {
            select: {
              email: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.transactions.count({ where })
    ]);
    
    return { data: transactions, total };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}
