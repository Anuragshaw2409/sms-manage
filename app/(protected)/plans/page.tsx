"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { modules } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  type PlanInput,
} from "./actions";

// Use standard type instead of prisma generated one for the client side component
export type PlanType = PlanInput & {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const planSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  price: z.coerce.number().min(0, "Price must be positive"),
  discount: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  validityInMonths: z.coerce
    .number()
    .min(1, "Validity must be at least 1 month"),
  modules: z.array(z.string()).min(1, "At least one module required"),
  schoolLimit: z.coerce.number().min(1),
  isActive: z.boolean(),
});

type PlanFormData = z.infer<typeof planSchema>;

const PAGE_SIZE = 8;

export default function Plans() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(plans.length / PAGE_SIZE);
  const paginatedPlans = plans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      price: 0,
      discount: 0,
      description: "",
      validityInMonths: 1,
      modules: [],
      schoolLimit: 1,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await getPlans();
      setPlans(data as any);
    } catch (error) {
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPlan(null);
    form.reset({
      name: "",
      price: 0,
      discount: 0,
      description: "",
      validityInMonths: 1,
      modules: [],
      schoolLimit: 1,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (plan: PlanType) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      price: plan.price,
      description: plan.description || "",
      discount: plan.discount || 0,
      validityInMonths: plan.validityInMonths,
      schoolLimit: plan.schoolLimit,
      modules: plan.modules,
      isActive: plan.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: PlanFormData) => {
    startTransition(async () => {
      try {
        if (editingPlan) {
          const updated = await updatePlan(editingPlan.id, data);
          setPlans((prev) =>
            prev.map((p) => (p.id === updated.id ? (updated as any) : p)),
          );
          toast.success("Plan updated successfully");
        } else {
          const created = await createPlan(data);
          setPlans((prev) => [created as any, ...prev]);
          toast.success("Plan created successfully");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Failed to save plan");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    startTransition(async () => {
      try {
        await deletePlan(id);
        setPlans((prev) => prev.filter((p) => p.id !== id));
        toast.success("Plan deleted successfully");
      } catch (error) {
        toast.error("Failed to delete plan");
      }
    });
  };

  return (
    <>
      <SiteHeader header={"Plans"} />

      <div className="@container/main p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Plans</h1>
            <p className="text-muted-foreground">Manage subscription plans</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={openCreate} disabled={isLoading || isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Plan" : "Create Plan"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Price</Label>
                    <Input type="number" {...form.register("price")} />
                    {form.formState.errors.price && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Discount Price</Label>
                    <Input type="number" {...form.register("discount")} />
                  </div>
                  <div className="space-y-1">
                    <Label>Validity (months)</Label>
                    <Input
                      type="number"
                      {...form.register("validityInMonths")}
                    />
                    {form.formState.errors.validityInMonths && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.validityInMonths.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>School Limit</Label>
                    <Input type="number" {...form.register("schoolLimit")} />
                    {form.formState.errors.schoolLimit && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.schoolLimit.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Input {...form.register("description")} />
                  </div>
                  <div className="flex items-center gap-2 pt-6 col-span-2">
                    <Switch
                      checked={form.watch("isActive")}
                      onCheckedChange={(v) => form.setValue("isActive", v)}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Included Modules <span className="text-destructive">*</span>
                  </Label>
                  <div className=" gap-4 border p-4 rounded-md bg-muted/50 flex flex-wrap">
                    {modules.map((m) => (
                      <div
                        key={m}
                        className="flex items-center space-x-2 w-auto"
                      >
                        <Checkbox
                          id={`module-${m}`}
                          checked={form.watch("modules").includes(m)}
                          onCheckedChange={(checked) => {
                            const current = form.watch("modules");
                            if (checked) {
                              form.setValue("modules", [...current, m], {
                                shouldValidate: true,
                              });
                            } else {
                              form.setValue(
                                "modules",
                                current.filter((x) => x !== m),
                                { shouldValidate: true },
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`module-${m}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {m}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.modules && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.modules.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {editingPlan ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Schools Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No plans found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>₹{plan.price}</TableCell>
                    <TableCell>
                      {plan.discount ? `₹${plan.discount}` : "-"}
                    </TableCell>
                    <TableCell>{plan.validityInMonths} mo</TableCell>
                    <TableCell>{plan.schoolLimit}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={plan.isActive ? "active" : "inactive"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(plan)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoading && plans.length > 0 && (
            <div className="px-4 pb-4">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={plans.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
