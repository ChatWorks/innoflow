import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Deal {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  status: string;
  expected_date?: string;
  description?: string;
}

interface EditDealModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditDealModal = ({ deal, open, onOpenChange, onSuccess }: EditDealModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    amount: "",
    status: "potential",
    expected_date: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        client_name: deal.client_name,
        amount: deal.amount.toString(),
        status: deal.status,
        expected_date: deal.expected_date || "",
        description: deal.description || ""
      });
    }
  }, [deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    
    setLoading(true);

    try {
      const updateData: any = {
        title: formData.title,
        client_name: formData.client_name,
        amount: parseFloat(formData.amount),
        status: formData.status,
        expected_date: formData.expected_date || null,
        description: formData.description || null,
        probability: formData.status === "potential" ? 50 : formData.status === "confirmed" ? 80 : 100
      };

      // If status changed to paid, create cashflow entry
      if (formData.status === "paid" && deal.status !== "paid") {
        await createCashflowEntry(deal.id, parseFloat(formData.amount), formData.title);
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
          is_projected: false
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error creating cashflow entry:", error);
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
                <SelectItem value="potential">Potentieel</SelectItem>
                <SelectItem value="confirmed">Bevestigd</SelectItem>
                <SelectItem value="invoiced">Gefactureerd</SelectItem>
                <SelectItem value="paid">Betaald</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_date">Verwachte Datum</Label>
            <Input
              id="expected_date"
              type="date"
              value={formData.expected_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
            />
          </div>

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