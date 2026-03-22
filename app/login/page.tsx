import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import React from "react";
import LoginForm from "./loginForm";
import { redirect } from "next/navigation";

async function page() {
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    redirect("/dashboard");
  }
  return <LoginForm />;
}

export default page;
