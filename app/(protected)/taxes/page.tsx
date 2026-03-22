"use client"

import { useState, useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTaxes, createTax, updateTax, deleteTax, type TaxInput } from "./actions";

export type TaxType = TaxInput & { id: string };

const taxSchema = z.object({
  state: z.string().min(1, "State is required").max(100),
  cgst: z.coerce.number().min(0).max(100),
  sgst: z.coerce.number().min(0).max(100),
  igst: z.coerce.number().min(0).max(100),
});

type TaxFormData = z.infer<typeof taxSchema>;

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function Taxes() {
  const [taxes, setTaxes] = useState<TaxType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaxType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: { state: "", cgst: 0, sgst: 0, igst: 0 },
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const data = await getTaxes();
      setTaxes(data);
    } catch (error) {
      toast.error("Failed to load taxes");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.reset({ state: "", cgst: 0, sgst: 0, igst: 0 });
    setDialogOpen(true);
  };

  const openEdit = (tax: TaxType) => {
    setEditing(tax);
    form.reset({
      state: tax.state,
      cgst: tax.cgst,
      sgst: tax.sgst,
      igst: tax.igst
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: TaxFormData) => {
    startTransition(async () => {
      try {
        if (editing) {
          const updated = await updateTax(editing.id, data);
          setTaxes(prev => prev.map(t => t.id === updated.id ? updated : t));
          toast.success("Tax updated successfully");
        } else {
          const created = await createTax(data);
          setTaxes(prev => [...prev, created].sort((a, b) => a.state.localeCompare(b.state)));
          toast.success("Tax created successfully");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Failed to save tax");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax config?")) return;
    
    startTransition(async () => {
      try {
        await deleteTax(id);
        setTaxes(prev => prev.filter(t => t.id !== id));
        toast.success("Tax deleted successfully");
      } catch (error) {
        toast.error("Failed to delete tax");
      }
    });
  };

  return (
    <>
      <SiteHeader header="Taxes"/>

      <div className="@container/main p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Taxes</h1>
            <p className="text-muted-foreground">Manage state tax configurations</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={openCreate} disabled={isLoading || isPending}><Plus className="mr-2 h-4 w-4" />Add Tax</Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Tax" : "Create Tax"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label>State</Label>
                  <Controller
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isPending} 
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {INDIAN_STATES.filter(state => !taxes.some(t => t.state === state) || state === field.value).map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.state && <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>CGST %</Label>
                    <Input type="number" step="0.01" {...form.register("cgst")} disabled={isPending} />
                    {form.formState.errors.cgst && <p className="text-xs text-destructive">{form.formState.errors.cgst.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>SGST %</Label>
                    <Input type="number" step="0.01" {...form.register("sgst")} disabled={isPending} />
                  </div>
                  <div className="space-y-1">
                    <Label>IGST %</Label>
                    <Input type="number" step="0.01" {...form.register("igst")} disabled={isPending} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editing ? "Update" : "Create"}
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
                <TableHead>State</TableHead>
                <TableHead>CGST %</TableHead>
                <TableHead>SGST %</TableHead>
                <TableHead>IGST %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : taxes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No taxes configured.
                  </TableCell>
                </TableRow>
              ) : (
                taxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.state}</TableCell>
                    <TableCell>{tax.cgst}%</TableCell>
                    <TableCell>{tax.sgst}%</TableCell>
                    <TableCell>{tax.igst}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(tax)} disabled={isPending}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tax.id)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
