"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export type TaxInput = {
  state: string;
  cgst: number;
  sgst: number;
  igst: number;
};

async function verifyAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

export async function getTaxes() {
  try {
    await verifyAuth();
    const taxes = await prisma.tax.findMany({
      orderBy: { state: "asc" }
    });
    return taxes;
  } catch (error) {
    console.error("Error fetching taxes:", error);
    throw new Error("Failed to fetch taxes");
  }
}

export async function createTax(data: TaxInput) {
  try {
    await verifyAuth();
    const tax = await prisma.tax.create({
      data: {
        state: data.state,
        cgst: data.cgst,
        sgst: data.sgst,
        igst: data.igst
      }
    });
    return tax;
  } catch (error) {
    console.error("Error creating tax:", error);
    throw new Error("Failed to create tax");
  }
}

export async function updateTax(id: string, data: Partial<TaxInput>) {
  try {
    await verifyAuth();
    const tax = await prisma.tax.update({
      where: { id },
      data: {
        state: data.state,
        cgst: data.cgst,
        sgst: data.sgst,
        igst: data.igst
      }
    });
    return tax;
  } catch (error) {
    console.error("Error updating tax:", error);
    throw new Error("Failed to update tax");
  }
}

export async function deleteTax(id: string) {
  try {
    await verifyAuth();
    await prisma.tax.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting tax:", error);
    throw new Error("Failed to delete tax");
  }
}
