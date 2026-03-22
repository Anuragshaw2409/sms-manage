"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/PaginationControls";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SiteHeader } from "@/components/site-header";
import { getTransactions } from "./actions";

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, total } = await getTransactions(page, PAGE_SIZE, search, statusFilter);
      setTransactions(data);
      setTotalItems(total);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, statusFilter]);

  return (
    <>
      <SiteHeader header={"Transactions"} />
      <div className="@container/main p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <p className="text-muted-foreground">
              View payment transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
            <div className="w-40">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Owner Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Taxes</TableHead>
                <TableHead>Purchased At</TableHead>
                <TableHead className="text-right">Validity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>{tx.owner?.email || "N/A"}</TableCell>
                    <TableCell>{tx.planName}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status.toLowerCase()} />
                    </TableCell>
                    <TableCell>₹{tx.totalAmount}</TableCell>
                    <TableCell>₹{tx.totalTaxes}</TableCell>
                    <TableCell>
                      {format(new Date(tx.purchasedAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.validityInMonths} mo
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {transactions.length > 0 && (
            <div className="px-4 pb-4">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
