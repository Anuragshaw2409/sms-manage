"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Type definition for Plan input
export type PlanInput = {
  name: string;
  price: number;
  modules: string[];
  description?: string;
  discount?: number;
  schoolLimit: number;
  validityInMonths: number;
  isActive: boolean;
};

// Helper function to verify authentication
async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getPlans() {
  try {
    await verifyAuth();
    const plans = await prisma.plans.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return plans;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch plans");
  }
}

export async function createPlan(data: PlanInput) {
  try {
    await verifyAuth();
    const plan = await prisma.plans.create({
      data: {
        name: data.name,
        price: data.price,
        modules: data.modules,
        description: data.description || null,
        discount: data.discount || null,
        schoolLimit: data.schoolLimit,
        validityInMonths: data.validityInMonths,
        isActive: data.isActive,
      }
    });
    return plan;
  } catch (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }
}

export async function updatePlan(id: string, data: Partial<PlanInput>) {
  try {
    await verifyAuth();
    const plan = await prisma.plans.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        modules: data.modules,
        description: data.description,
        discount: data.discount,
        schoolLimit: data.schoolLimit,
        validityInMonths: data.validityInMonths,
        isActive: data.isActive,
      }
    });
    return plan;
  } catch (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }
}

export async function deletePlan(id: string) {
  try {
    await verifyAuth();
    await prisma.plans.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw new Error("Failed to delete plan");
  }
}
