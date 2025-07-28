import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: string;
  payment_received_date?: string;
  description?: string;
  deal_type?: string;
  monthly_amount?: number;
  contract_length?: number;
  start_date?: string;
}

interface EditDealModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditDealModal = ({ deal, open, onOpenChange, onSuccess }: EditDealModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    amount: "",
    status: "potential",
    payment_received_date: "",
    description: "",
    deal_type: "one_time",
    monthly_amount: "",
    contract_length: "",
    start_date: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        client_name: deal.client_name,
        amount: deal.amount.toString(),
        status: deal.status,
        payment_received_date: deal.payment_received_date || "",
        description: deal.description || "",
        deal_type: deal.deal_type || "one_time",
        monthly_amount: deal.monthly_amount?.toString() || "",
        contract_length: deal.contract_length?.toString() || "",
        start_date: deal.start_date || ""
      });
    }
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    
    setLoading(true);

    try {
      // ✅ Voor MRR deals: amount = monthly_amount (GEEN vermenigvuldiging)
      let dealAmount = parseFloat(formData.amount);
      if (formData.deal_type === "recurring" && formData.monthly_amount) {
        dealAmount = parseFloat(formData.monthly_amount); // ✅ amount = monthly_amount
      }

      const updateData: any = {
        title: formData.title,
        client_name: formData.client_name,
        amount: dealAmount, // ✅ Voor MRR = monthly_amount
        status: formData.status,
        payment_received_date: formData.payment_received_date || null,
        description: formData.description || null,
        probability: formData.status === "potential" ? 50 : formData.status === "confirmed" ? 80 : 100,
        deal_type: formData.deal_type,
        monthly_amount: formData.deal_type === "recurring" ? parseFloat(formData.monthly_amount) : null,
        contract_length: formData.deal_type === "recurring" && formData.contract_length ? parseInt(formData.contract_length) : null,
        start_date: formData.deal_type === "recurring" ? formData.start_date : null
      };

      // If status changed to paid, create cashflow entry
      if (formData.status === "paid" && deal.status !== "paid") {
        await createCashflowEntry(deal.id, parseFloat(formData.amount), formData.title);
      }

      // ✅ Voor MRR deals: update zowel deals ALS recurring_revenue tabel
      if (formData.deal_type === "recurring" && (formData.status === "confirmed" || formData.status === "paid") && formData.monthly_amount) {
        const contractLength = formData.contract_length ? parseInt(formData.contract_length) : null;
        const startDate = formData.start_date || new Date().toISOString().split('T')[0];
        await upsertRecurringRevenueEntry(deal.id, parseFloat(formData.monthly_amount), startDate, contractLength);
      }

      const { error } = await supabase
        .from("deals")
        .update(updateData)
        .eq("id", deal.id);

      if (error) throw error;

      toast({
        title: "Deal bijgewerkt",
        description: "De deal is succesvol bijgewerkt.",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating deal:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de deal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCashflowEntry = async (dealId: string, amount: number, description: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("cashflow_entries")
        .insert({
          type: "income",
          description: `Deal betaling: ${description}`,
          category: "deals",
          amount: amount,
          transaction_date: new Date().toISOString().split('T')[0],
          deal_id: dealId,
          is_projected: false,
          user_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating cashflow entry:", error);
    }
  };

  const upsertRecurringRevenueEntry = async (dealId: string, monthlyAmount: number, startDate: string, contractLength: number | null) => {
    if (!user) return;
    
    try {
      const endDate = contractLength ? (() => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + contractLength);
        return date.toISOString().split('T')[0];
      })() : null;

      const { error } = await supabase
        .from("recurring_revenue")
        .upsert({
          deal_id: dealId,
          monthly_amount: monthlyAmount,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
          user_id: user.id
        }, { onConflict: 'deal_id' });

      if (error) throw error;
    } catch (error) {
      console.error("Error upserting recurring revenue entry:", error);
    }
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deal Bewerken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Deal Type</Label>
            <RadioGroup
              value={formData.deal_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, deal_type: value }))}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one_time" id="edit_one_time" />
                <Label htmlFor="edit_one_time">Eenmalig Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="edit_recurring" />
                <Label htmlFor="edit_recurring">Recurring Revenue (MRR)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Deal Naam</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Klant</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              required
            />
          </div>

          {/* One-time Project Fields */}
          {formData.deal_type === "one_time" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Bedrag (€)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {/* Recurring MRR Fields */}
          {formData.deal_type === "recurring" && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">Recurring Revenue Details</h4>
              
              <div className="space-y-2">
                <Label htmlFor="monthly_amount">Maandelijks Bedrag (€) *</Label>
                <Input
                  id="monthly_amount"
                  type="number"
                  value={formData.monthly_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_amount: e.target.value }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Datum</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                  <p className="text-xs text-blue-600">Voor projecties</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_length">Contract Lengte (maanden)</Label>
                  <Input
                    id="contract_length"
                    type="number"
                    value={formData.contract_length}
                    onChange={(e) => setFormData(prev => ({ ...prev, contract_length: e.target.value }))}
                    min="1"
                  />
                  <p className="text-xs text-blue-600">Laat leeg voor onbepaalde tijd</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="potential">🟡 Potentieel</SelectItem>
                <SelectItem value="confirmed">🟢 Bevestigd</SelectItem>
                <SelectItem value="invoiced">📄 Gefactureerd</SelectItem>
                <SelectItem value="paid">💰 Betaald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Information - Only show for one-time projects AND when status is paid/invoiced */}
          {(formData.deal_type === "one_time" && (formData.status === "paid" || formData.status === "invoiced")) && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">Betaal Informatie</h4>
              
              <div className="space-y-2">
                <Label htmlFor="payment_received_date">Betaal Datum</Label>
                <Input
                  id="payment_received_date"
                  type="date"
                  value={formData.payment_received_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_received_date: e.target.value }))}
                  className="h-10"
                />
                <p className="text-xs text-green-600">Datum waarop de betaling is ontvangen</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Bijwerken..." : "Bijwerken"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};