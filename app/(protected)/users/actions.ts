"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
export type UserInput = {
  name: string;
  email: string;
  isActive: boolean;
};

async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getUsers(page: number = 1, pageSize: number = 8, search: string = "") {
  try {
    await verifyAuth();
    
    const skip = (page - 1) * pageSize;
    
    const where: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    } : {};
    
    const [users, total] = await prisma.$transaction([
      prisma.owner.findMany({
        where,
        include: {
          currentSubscription: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.owner.count({ where })
    ]);
    
    return { data: users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(data: UserInput) {
  try {
    await verifyAuth();

    const existingUser = await prisma.owner.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = await prisma.owner.create({
      data: {
        name: data.name,
        email: data.email,
        isActive: data.isActive,
        password: bcryptjs.hashSync("temp1234", 10), // default password
      },
    });
    return user;
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.message === "Email already registered") {
      throw new Error(error.message);
    }
    throw new Error("Failed to create user");
  }
}

export async function updateUser(id: string, data: Partial<UserInput>) {
  try {
    await verifyAuth();
    const user = await prisma.owner.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        isActive: data.isActive,
      },
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: string) {
  try {
    await verifyAuth();
    await prisma.owner.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function getActivePlans() {
  try {
    await verifyAuth();
    const plans = await prisma.plans.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    return plans;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw new Error("Failed to fetch active plans");
  }
}

export async function addSubscriptionManually(ownerId: string, planId: string) {
  try {
    await verifyAuth();

    const plan = await prisma.plans.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.validityInMonths);

    const transaction = await prisma.transactions.create({
      data: {
        totalAmount: plan.price,
        totalTaxes: 0,
        planName: plan.name,
        expiresAt: expiresAt,
        validityInMonths: plan.validityInMonths,
        modules: plan.modules,
        ownerId: ownerId,
        status: "COMPLETED",
      },
    });

    const subscription = await prisma.subscription.upsert({
      where: { ownerId: ownerId },
      create: {
        ownerId: ownerId,
        planName: plan.name,
        startedAt: new Date(),
        expiresAt: expiresAt,
        status: "ACTIVE",
        transactionId: transaction.id,
      },
      update: {
        planName: plan.name,
        startedAt: new Date(),
        expiresAt: expiresAt,
        status: "ACTIVE",
        transactionId: transaction.id,
      },
    });

    return subscription;
  } catch (error) {
    console.error("Error adding subscription:", error);
    throw new Error("Failed to add subscription");
  }
}
