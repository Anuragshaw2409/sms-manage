"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const [
      totalPlans,
      activePlans,
      totalTransactions,
      completedTransactions,
      totalTaxes,
      totalUsers,
      activeUsers,
    ] = await prisma.$transaction([
      prisma.plans.count(),
      prisma.plans.count({ where: { isActive: true } }),
      prisma.transactions.count(),
      prisma.transactions.count({ where: { status: "COMPLETED" } }),
      prisma.tax.count(),
      prisma.owner.count(),
      prisma.owner.count({ where: { isActive: true } }),
    ]);

    return {
      plans: { total: totalPlans, active: activePlans },
      transactions: { total: totalTransactions, completed: completedTransactions },
      taxes: { total: totalTaxes },
      users: { total: totalUsers, active: activeUsers },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}
