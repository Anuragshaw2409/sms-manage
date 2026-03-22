"use client"
import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, Receipt, Users } from "lucide-react";
import { initialPlans, initialTransactions, initialTaxes, initialUsers } from "./mockData";

export default function Page() {
  const stats = [
    { title: "Total Plans", value: initialPlans.length, icon: FileText, desc: `${initialPlans.filter(p => p.isActive).length} active` },
    { title: "Transactions", value: initialTransactions.length, icon: CreditCard, desc: `${initialTransactions.filter(t => t.status === 'completed').length} completed` },
    { title: "Tax Rules", value: initialTaxes.length, icon: Receipt, desc: "States configured" },
    { title: "Users", value: initialUsers.length, icon: Users, desc: `${initialUsers.filter(u => u.status === 'active').length} active` },
  ];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your admin panel</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
