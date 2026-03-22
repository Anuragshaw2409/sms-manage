import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, FileText, Receipt, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDashboardStats } from "./actions";

export default async function Page() {
  const data = await getDashboardStats();

  const stats = [
    { title: "Total Plans", value: data.plans.total, icon: FileText, desc: `${data.plans.active} active` },
    { title: "Transactions", value: data.transactions.total, icon: CreditCard, desc: `${data.transactions.completed} completed` },
    { title: "Tax Rules", value: data.taxes.total, icon: Receipt, desc: "States configured" },
    { title: "Users", value: data.users.total, icon: Users, desc: `${data.users.active} active` },
  ];

  return (
    <>
      <SiteHeader header="Dashboard" />
      <div className="@container/main p-4 space-y-6">
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
    </>
  );
}
