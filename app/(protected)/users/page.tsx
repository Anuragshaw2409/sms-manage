"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SiteHeader } from "@/components/site-header";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getActivePlans,
  addSubscriptionManually,
} from "./actions";

const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

const PAGE_SIZE = 8;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Subscription dialog state
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subOwnerId, setSubOwnerId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", isActive: true },
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, total } = await getUsers(page, PAGE_SIZE, search);
      setUsers(data);
      setTotalItems(total);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await getActivePlans();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to fetch plans");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", email: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (user: any) => {
    setEditing(user);
    form.reset({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editing) {
        await updateUser(editing.id, data);
        toast.success("User updated successfully");
      } else {
        await createUser(data);
        toast.success("User created successfully");
      }
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      if (error.message === "Email already registered") {
        form.setError("email", { type: "manual", message: "Email already registered" });
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const openAddSubscription = (id: string) => {
    setSubOwnerId(id);
    setSelectedPlanId("");
    setSubDialogOpen(true);
  };

  const handleAddSubscription = async () => {
    if (!subOwnerId || !selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    try {
      await addSubscriptionManually(subOwnerId, selectedPlanId);
      toast.success("Subscription assigned successfully");
      setSubDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add subscription");
    }
  };

  return (
    <>
      <SiteHeader header={"Users"} />
      <div className="@container/main p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-muted-foreground">
              Manage users and subscriptions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit User" : "Create User"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    value={form.watch("isActive") ? "active" : "inactive"}
                    onValueChange={(v) =>
                      form.setValue("isActive", v === "active")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Subscription</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Plan</Label>
                  <Select
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSubDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSubscription}>Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={user.isActive ? "active" : "inactive"}
                      />
                    </TableCell>
                    <TableCell>
                      {user.currentSubscription ? (
                        <StatusBadge
                          status={user.currentSubscription.status.toLowerCase()}
                          text={user.currentSubscription.planName}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Assign Plan"
                        onClick={() => openAddSubscription(user.id)}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit User"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete User"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {users.length > 0 && (
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
